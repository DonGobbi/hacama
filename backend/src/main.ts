import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { LOCAL_UPLOAD_DIR } from './storage/storage.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust the first proxy hop (Cloud Run / load balancer) so req.ip is the real client IP.
  app.set('trust proxy', 1);

  app.useStaticAssets(LOCAL_UPLOAD_DIR, { prefix: '/uploads' });

  app.setGlobalPrefix('api');
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',');
  app.enableCors({
    // Allow configured origins plus any localhost/127.0.0.1 origin (any port) —
    // needed for local dev tools that proxy the site (e.g. browser previews).
    origin: (origin, cb) => {
      const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin ?? '');
      cb(null, !origin || corsOrigins.includes(origin) || isLocal);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`Hacama API running on http://localhost:${port}/api`);
}

bootstrap();
