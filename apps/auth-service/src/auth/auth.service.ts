import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from './redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RefreshToken) private tokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.CUSTOMER,
    });
    await this.userRepo.save(user);

    return this.generateTokenPair(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    return this.generateTokenPair(user);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; jti: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      }) as { sub: string; jti: string };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecord = await this.tokenRepo.findOne({
      where: { id: payload.jti, userId: payload.sub, revoked: false },
    });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate: revoke old token, issue new pair
    tokenRecord.revoked = true;
    await this.tokenRepo.save(tokenRecord);

    return this.generateTokenPair(user);
  }

  async logout(userId: string, accessToken: string) {
    // Revoke all refresh tokens for this user
    await this.tokenRepo.update({ userId, revoked: false }, { revoked: true });

    // Blacklist the access token in Redis until it expires
    try {
      const payload = this.jwtService.decode(accessToken) as { exp: number };
      if (payload?.exp) {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redisService.set(`blacklist:${accessToken}`, '1', ttl);
        }
      }
    } catch {
      // Best-effort blacklist
    }
  }

  async verifyToken(token: string) {
    // Check blacklist first
    const blacklisted = await this.redisService.get(`blacklist:${token}`);
    if (blacklisted) return { valid: false, userId: '', email: '', role: '' };

    try {
      const payload = this.jwtService.verify(token) as {
        sub: string;
        email: string;
        role: string;
      };
      return { valid: true, userId: payload.sub, email: payload.email, role: payload.role };
    } catch {
      return { valid: false, userId: '', email: '', role: '' };
    }
  }

  private async generateTokenPair(user: User) {
    const jti = uuidv4();
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti },
      { expiresIn: refreshExpiresIn },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.tokenRepo.save(
      this.tokenRepo.create({ id: jti, userId: user.id, tokenHash, expiresAt }),
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
