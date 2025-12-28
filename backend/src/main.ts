import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JobsAggregatorService } from './jobs/jobs-aggregator.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const importer = app.get(JobsAggregatorService);

  await importer.importJobs();

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
