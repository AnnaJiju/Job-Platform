import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { JobsGateway } from 'src/gateway/jobs.gateway';
import { Cron } from '@nestjs/schedule/dist/decorators/cron.decorator';
import { JobApiProvider, ExternalJob } from './interfaces/external-job.interface';
import { AdzunaProvider } from './providers/adzuna.provider';
import { JobNormalizerService } from './services/job-normalizer.service';
import { Profile } from '../profiles/profile.entity';

@Injectable()
export class JobsAggregatorService {
  private readonly logger = new Logger(JobsAggregatorService.name);
  private readonly providers: JobApiProvider[];

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
    private readonly gateway: JobsGateway,
    private readonly adzunaProvider: AdzunaProvider,
    private readonly normalizerService: JobNormalizerService,
  ) {
    // Register Adzuna as the job API provider
    this.providers = [
      this.adzunaProvider,
    ];
  }

  @Cron('*/5 * * * *') 
  async importJobs() {
    this.logger.log('🚀 Cron Triggered — importing jobs from external sources...');

    let totalImported = 0;
    let totalSkipped = 0;

    // Fetch jobs from all providers
    for (const provider of this.providers) {
      const { imported, skipped } = await this.importFromProvider(provider);
      totalImported += imported;
      totalSkipped += skipped;
    }

    this.logger.log(`✅ Import Complete: ${totalImported} new jobs imported, ${totalSkipped} duplicates skipped`);
  }

  /**
   * Import jobs from a specific provider
   */
  private async importFromProvider(provider: JobApiProvider): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    try {
      this.logger.log(`📡 Fetching jobs from ${provider.getName()}...`);
      
      const externalJobs = await provider.fetchJobs();
      
      if (externalJobs.length === 0) {
        this.logger.log(`⚠️ No jobs fetched from ${provider.getName()}`);
        return { imported, skipped };
      }

      this.logger.log(`📥 Processing ${externalJobs.length} jobs from ${provider.getName()}...`);

      for (const externalJob of externalJobs) {
        try {
          // Check for duplicates using externalId and source
          const exists = await this.jobsRepo.findOne({
            where: [
              { externalId: externalJob.externalId, source: externalJob.source },
              { title: externalJob.title, company: externalJob.company }
            ]
          });

          if (exists) {
            skipped++;
            continue;
          }

          // Normalize the external job data
          const normalizedJob = this.normalizerService.normalizeJob(externalJob);
          
          // Get category information
          const { category, tags } = this.normalizerService.categorizeJob(normalizedJob);

          // Create and save the job
          const job = this.jobsRepo.create(normalizedJob);
          const saved = await this.jobsRepo.save(job);

          this.logger.log(`✔️ Imported from ${provider.getName()}: ${saved.title} at ${saved.company} [${category}]`);
          imported++;

          // Broadcast new job in real-time
          this.gateway.notifyNewJob(saved);

          // Send personalized notifications to matching jobseekers
          await this.notifyMatchingJobseekers(saved);

        } catch (error) {
          this.logger.error(`❌ Error saving job: ${error.message}`);
        }
      }

      this.logger.log(`✅ ${provider.getName()}: ${imported} imported, ${skipped} skipped`);

    } catch (error) {
      this.logger.error(`❌ Error importing from ${provider.getName()}: ${error.message}`);
    }

    return { imported, skipped };
  }

  /**
   * Notify matching jobseekers about new job
   */
  private async notifyMatchingJobseekers(job: Job) {
    if (!job.skills) return;

    try {
      const allProfiles = await this.profilesRepo.find({
        relations: ['user'],
      });

      // Filter jobseekers and calculate match scores
      const matchingJobseekers = allProfiles
        .filter(profile => profile.user && profile.user.role === 'jobseeker' && profile.skills)
        .map(profile => ({
          userId: profile.user.id,
          matchScore: this.calculateMatchScore(job.skills, profile.skills),
        }))
        .filter(match => match.matchScore > 0);

      // Send personalized notifications
      matchingJobseekers.forEach(match => {
        this.gateway.notifyRecommendedJob(match.userId, {
          ...job,
          matchScore: match.matchScore,
        });
      });

      if (matchingJobseekers.length > 0) {
        this.logger.log(`📢 Notified ${matchingJobseekers.length} matching jobseekers`);
      }
    } catch (error) {
      this.logger.error(`Error notifying jobseekers: ${error.message}`);
    }
  }

  /**
   * Calculate skill match score
   */
  private calculateMatchScore(jobSkills: string, userSkills: string): number {
    if (!jobSkills || !userSkills) return 0;

    const jobArr = jobSkills.toLowerCase().split(',').map(s => s.trim());
    const userArr = userSkills.toLowerCase().split(',').map(s => s.trim());

    const matches = jobArr.filter(skill => userArr.includes(skill));

    return Math.round((matches.length / jobArr.length) * 100);
  }

  /**
   * Manual trigger for testing (can be called via endpoint)
   */
  async manualImport(): Promise<{ success: boolean; imported: number; skipped: number }> {
    this.logger.log('🔧 Manual import triggered...');
    
    let totalImported = 0;
    let totalSkipped = 0;

    for (const provider of this.providers) {
      const { imported, skipped } = await this.importFromProvider(provider);
      totalImported += imported;
      totalSkipped += skipped;
    }

    return { 
      success: true, 
      imported: totalImported, 
      skipped: totalSkipped 
    };
  }

  /**
   * Get statistics about imported jobs by source
   */
  async getImportStatistics() {
    const stats = await this.jobsRepo
      .createQueryBuilder('job')
      .select('job.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('job.source IS NOT NULL')
      .groupBy('job.source')
      .getRawMany();

    return stats;
  }
}
