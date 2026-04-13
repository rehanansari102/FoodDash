import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly expiresIn: number;
  private readonly publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.getOrThrow('CLOUDFLARE_ACCOUNT_ID');
    this.bucket = this.configService.getOrThrow('CLOUDFLARE_BUCKET_NAME');
    this.expiresIn = Number(this.configService.get('PRESIGNED_URL_EXPIRES', 300));

    // Cloudflare R2 is S3-compatible — just point to the R2 endpoint
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow('CLOUDFLARE_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('CLOUDFLARE_SECRET_ACCESS_KEY'),
      },
    });

    // Public URL for accessing uploaded files (set up custom domain in R2 dashboard)
    this.publicBaseUrl = `https://media.fooddash.app`;
  }

  async getPresignedUrl(dto: PresignedUrlDto): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    // Generate unique key: folder/uuid.ext
    const ext = dto.fileName.split('.').pop() ?? 'jpg';
    const key = `${dto.folder}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    // Generate presigned URL — client uploads directly to R2 using this URL
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: this.expiresIn });
    const publicUrl = `${this.publicBaseUrl}/${key}`;

    return { uploadUrl, publicUrl, key };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
