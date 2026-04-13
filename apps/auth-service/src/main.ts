import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // gRPC microservice on a separate port for token verification by the gateway
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../packages/proto/auth.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT ?? 50051}`,
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Auth Service HTTP on :${port}, gRPC on :${process.env.GRPC_PORT ?? 50051}`);
}

bootstrap();
