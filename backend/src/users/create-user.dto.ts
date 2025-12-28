export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'jobseeker' | 'recruiter' | 'admin';
}
