import { IsIn } from 'class-validator';

export class UpdateJobStatusDto {
  @IsIn(['open', 'closed', 'paused'])
  status: string;
}
