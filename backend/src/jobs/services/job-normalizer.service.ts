import { Injectable, Logger } from '@nestjs/common';
import { ExternalJob } from '../interfaces/external-job.interface';
import { Job } from '../job.entity';

@Injectable()
export class JobNormalizerService {
  private readonly logger = new Logger(JobNormalizerService.name);

  /**
   * Normalize external job data to match our Job entity schema
   */
  normalizeJob(externalJob: ExternalJob): Partial<Job> {
    return {
      title: this.normalizeTitle(externalJob.title),
      company: this.normalizeCompany(externalJob.company),
      description: this.normalizeDescription(externalJob.description),
      skills: this.normalizeSkills(externalJob.skills),
      location: this.normalizeLocation(externalJob.location),
      salaryMin: externalJob.salaryMin,
      salaryMax: externalJob.salaryMax,
      jobType: this.normalizeJobType(externalJob.jobType),
      source: externalJob.source,
      externalId: externalJob.externalId,
      sourceUrl: externalJob.sourceUrl,
      postedBy: 9999, // System user for aggregated jobs
      status: 'open',
    };
  }

  /**
   * Normalize job title - capitalize properly, remove extra spaces
   */
  private normalizeTitle(title: string): string {
    if (!title) return 'Untitled Position';
    
    return title
      .trim()
      .replace(/\s+/g, ' ') // Remove multiple spaces
      .substring(0, 255); // Ensure it fits in DB column
  }

  /**
   * Normalize company name
   */
  private normalizeCompany(company: string): string {
    if (!company) return 'Unknown Company';
    
    return company
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 255);
  }

  /**
   * Normalize description - clean HTML, limit length
   */
  private normalizeDescription(description: string): string {
    if (!description) return 'No description available.';
    
    // Remove HTML tags
    let cleaned = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    // Limit to reasonable length (10000 chars)
    if (cleaned.length > 10000) {
      cleaned = cleaned.substring(0, 9997) + '...';
    }
    
    return cleaned;
  }

  /**
   * Normalize skills - format consistently
   */
  private normalizeSkills(skills: string | undefined): string {
    if (!skills) return '';
    
    // Split by common delimiters, clean, and rejoin
    const skillsArray = skills
      .split(/[,;|]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .filter((skill, index, self) => self.indexOf(skill) === index); // Remove duplicates
    
    return skillsArray.join(', ').substring(0, 500);
  }

  /**
   * Normalize location
   */
  private normalizeLocation(location: string | undefined): string {
    if (!location) return '';
    
    return location
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 255);
  }

  /**
   * Normalize job type to match our enum
   */
  private normalizeJobType(jobType: string | undefined): string {
    if (!jobType) return 'full-time';
    
    const type = jobType.toLowerCase().trim();
    
    // Map variations to our standard types
    if (type.includes('full') || type.includes('permanent')) return 'full-time';
    if (type.includes('part')) return 'part-time';
    if (type.includes('contract') || type.includes('freelance')) return 'contract';
    if (type.includes('remote')) return 'remote';
    if (type.includes('hybrid')) return 'hybrid';
    
    return 'full-time'; // Default
  }

  /**
   * Categorize job by source and other metadata
   */
  categorizeJob(job: Partial<Job>): { category: string; tags: string[] } {
    const tags: string[] = [];
    let category = 'General';

    // Add source tag
    if (job.source) {
      tags.push(job.source);
    }

    // Categorize by skills
    if (job.skills) {
      const skills = job.skills.toLowerCase();
      
      if (skills.includes('react') || skills.includes('vue') || skills.includes('angular')) {
        category = 'Frontend Development';
        tags.push('frontend');
      }
      if (skills.includes('node') || skills.includes('python') || skills.includes('java') || skills.includes('go')) {
        category = 'Backend Development';
        tags.push('backend');
      }
      if (skills.includes('devops') || skills.includes('aws') || skills.includes('kubernetes')) {
        category = 'DevOps';
        tags.push('devops');
      }
      if (skills.includes('data') || skills.includes('ml') || skills.includes('ai')) {
        category = 'Data Science/AI';
        tags.push('data-science');
      }
    }

    // Categorize by job type
    if (job.jobType === 'remote') {
      tags.push('remote-work');
    }

    return { category, tags };
  }
}
