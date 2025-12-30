import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ExternalJob, JobApiProvider } from '../interfaces/external-job.interface';

@Injectable()
export class AdzunaProvider implements JobApiProvider {
  private readonly logger = new Logger(AdzunaProvider.name);
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';

  constructor(private readonly httpService: HttpService) {}

  getName(): string {
    return 'Adzuna';
  }

  async fetchJobs(): Promise<ExternalJob[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      this.logger.warn('Adzuna credentials not configured. Skipping...');
      return [];
    }

    try {
      // Adzuna API: GET /v1/api/jobs/{country}/search/{page}
      const country = 'us'; // Can be made configurable
      const page = 1;
      const resultsPerPage = 50;

      const url = `${this.baseUrl}/${country}/search/${page}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            app_id: appId,
            app_key: appKey,
            results_per_page: resultsPerPage,
            what: 'software developer', // Can be made dynamic
          },
        })
      );

      const jobs = response.data.results || [];
      this.logger.log(`✅ Fetched ${jobs.length} jobs from Adzuna`);

      return jobs.map((job: any) => this.transformAdzunaJob(job));
    } catch (error) {
      this.logger.error(`❌ Adzuna API Error: ${error.message}`);
      return [];
    }
  }

  private transformAdzunaJob(job: any): ExternalJob {
    // Extract skills from description (simple approach)
    const skillsMatch = job.description?.match(/\b(JavaScript|Python|Java|React|Node\.js|TypeScript|AWS|Docker|Kubernetes)\b/gi);
    const skills = skillsMatch ? [...new Set(skillsMatch)].join(', ') : '';

    return {
      externalId: job.id,
      title: job.title || 'No Title',
      company: job.company?.display_name || 'Unknown Company',
      description: job.description || 'No description available',
      skills: skills,
      location: job.location?.display_name || '',
      salaryMin: job.salary_min ? Math.round(job.salary_min) : undefined,
      salaryMax: job.salary_max ? Math.round(job.salary_max) : undefined,
      jobType: this.mapJobType(job.contract_type),
      sourceUrl: job.redirect_url || '',
      source: 'Adzuna',
    };
  }

  private mapJobType(contractType: string): string {
    if (!contractType) return 'full-time';
    
    const type = contractType.toLowerCase();
    if (type.includes('full')) return 'full-time';
    if (type.includes('part')) return 'part-time';
    if (type.includes('contract')) return 'contract';
    if (type.includes('remote')) return 'remote';
    
    return 'full-time';
  }
}
