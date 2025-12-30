import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JobsAggregatorService } from './jobs/jobs-aggregator.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const importer = app.get(JobsAggregatorService);

  await importer.importJobs();

  // Serve static files for uploaded resumes
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
