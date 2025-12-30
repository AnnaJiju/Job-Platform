# Job Platform

A full-stack job board application that allows job seekers to browse, apply for jobs, and manage their profiles, while recruiters can post jobs and manage applications. The platform integrates with external job APIs (Adzuna) to aggregate job listings and provides real-time notifications via WebSockets.

## 🚀 Features

### For Job Seekers
- **User Authentication** - Secure registration and login with JWT tokens
- **Profile Management** - Create and update professional profiles with resume uploads
- **Job Search & Filtering** - Browse jobs from internal postings and external APIs (Adzuna)
- **Job Applications** - Apply to jobs with one click
- **Saved Jobs** - Bookmark interesting job listings for later
- **Real-time Notifications** - Receive instant updates about application status via WebSocket
- **Application Tracking** - Monitor all job applications and their statuses

### For Recruiters
- **Job Posting** - Create and manage job listings
- **Application Management** - Review applications, update statuses (pending, reviewed, rejected, accepted)
- **Applicant Profiles** - View job seeker profiles and resumes
- **Real-time Updates** - Instant notifications when candidates apply

### For Administrators
- **User Management** - View, suspend, or activate job seeker accounts
- **Job Moderation** - Manage all job listings (internal and external)
- **Analytics Dashboard** - Comprehensive statistics including:
  - User counts (job seekers, recruiters, suspended accounts)
  - Job statistics (total jobs, open jobs, internal vs. external jobs)
  - Application analytics (total, pending, accepted, rejected)
  - Top companies by applications
  - Recent Adzuna imports
  - Application status distribution charts
- **Source Filtering** - Filter jobs by source (Internal/Adzuna)

### External Job Integration
- **Adzuna API Integration** - Automatically imports jobs every 5 minutes
- **Duplicate Detection** - Prevents importing duplicate job listings
- **External Job Handling** - Seamlessly manages jobs from external APIs with proper attribution

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS v11.0.1
- **Database**: PostgreSQL with TypeORM v0.3.28
- **Authentication**: JWT (JSON Web Tokens) with Passport.js
- **Real-time Communication**: Socket.IO for WebSocket connections
- **File Upload**: Multer for resume uploads
- **Job Scheduling**: @nestjs/schedule for cron jobs
- **API Integration**: Axios for external API calls
- **Validation**: class-validator & class-transformer

### Frontend
- **Framework**: React v19.2.0
- **Routing**: React Router DOM v7.11.0
- **HTTP Client**: Axios v1.13.2
- **Real-time**: Socket.IO Client v4.8.3
- **Build Tool**: Vite v7.2.4
- **Styling**: Custom CSS

### External APIs
- **Adzuna Jobs API** - Job listing aggregation (1000 calls/month free tier)

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Adzuna API credentials** (Sign up at https://developer.adzuna.com/signup)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd job-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=job_platform

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Adzuna API Credentials
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key

# Cron Job Settings
JOB_IMPORT_INTERVAL=*/5 * * * *  # Every 5 minutes
```

#### Database Setup
1. Create a PostgreSQL database named `job_platform`
2. The application will automatically create tables on first run (TypeORM synchronize enabled)

### 3. Frontend Setup

```bash
cd ../job-frontend
npm install
```

#### Configure API Endpoint
Update the API base URL in [job-frontend/src/api/axios.js](job-frontend/src/api/axios.js) if needed (default: `http://localhost:3000`).

## 🚀 Running the Application

### Start the Backend
```bash
cd backend
npm run start:dev
```
The backend server will start on http://localhost:3000

### Start the Frontend
```bash
cd job-frontend
npm run dev
```
The frontend will start on http://localhost:5173

## 📁 Project Structure

```
job-platform/
├── backend/                      # NestJS Backend
│   ├── src/
│   │   ├── admin/               # Admin management module
│   │   ├── applications/        # Job application handling
│   │   ├── auth/                # Authentication & authorization
│   │   ├── gateway/             # WebSocket gateway
│   │   ├── jobs/                # Job listings & aggregation
│   │   │   ├── providers/       # External API providers (Adzuna)
│   │   │   └── dto/             # Data transfer objects
│   │   ├── notifications/       # Notification system
│   │   ├── profiles/            # User profile management
│   │   ├── saved-jobs/          # Saved jobs functionality
│   │   └── users/               # User management
│   ├── uploads/                 # Uploaded resumes storage
│   │   └── resumes/
│   ├── test/                    # E2E tests
│   └── .env                     # Environment variables
│
├── job-frontend/                # React Frontend
│   ├── src/
│   │   ├── api/                 # API client configuration
│   │   ├── assets/              # Static assets
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── JobCard.jsx
│   │   │   └── ...
│   │   ├── context/             # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── JobListings.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/                  # Public static files
│
└── README.md                    # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - Register new user (jobseeker/recruiter)
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user

### Profiles
- `POST /profiles` - Create profile
- `GET /profiles/:userId` - Get user profile
- `PATCH /profiles/:userId` - Update profile
- `POST /profiles/:userId/resume` - Upload resume

### Jobs
- `GET /jobs` - Get all jobs (with filters)
- `GET /jobs/:id` - Get job by ID
- `POST /jobs` - Create new job (recruiter only)
- `PATCH /jobs/:id` - Update job (recruiter only)
- `DELETE /jobs/:id` - Delete job (recruiter only)

### Applications
- `POST /applications` - Apply to a job
- `GET /applications/jobseeker/:jobseekerId` - Get jobseeker's applications
- `GET /applications/job/:jobId` - Get applications for a job
- `PATCH /applications/:id/status` - Update application status

### Saved Jobs
- `POST /saved-jobs` - Save a job
- `GET /saved-jobs/:jobseekerId` - Get saved jobs
- `DELETE /saved-jobs/:id` - Remove saved job

### Notifications
- `GET /notifications/:userId` - Get user notifications
- `PATCH /notifications/:id/read` - Mark notification as read

### Admin
- `GET /admin/analytics` - Get comprehensive analytics
- `GET /admin/users` - Get all users with filters
- `PATCH /admin/users/:id/status` - Update user status (suspend/activate)
- `GET /admin/jobs` - Get all jobs with source filters

### WebSocket Events
- `notification` - Receive real-time notifications

## 👥 User Roles

### Job Seeker
- Can browse and search jobs
- Can apply to jobs
- Can save jobs for later
- Can manage their profile and upload resume
- Receives notifications about application status

### Recruiter
- All job seeker capabilities
- Can post new jobs
- Can review applications for their jobs
- Can update application statuses
- Receives notifications when candidates apply

### Admin
- Can view all users and jobs
- Can suspend/activate job seeker accounts
- Can view comprehensive analytics
- Can moderate job listings
- Has access to admin dashboard

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Guards for recruiter and admin routes
- **Password Hashing** - Bcrypt for secure password storage
- **Suspended Account Protection** - Prevents suspended users from logging in or applying to jobs
- **CORS Configuration** - Controlled cross-origin requests

## 📊 Key Features Implementation

### Jobseeker Suspension System
When an admin suspends a jobseeker:
1. **Login Prevention** - Suspended users cannot log in
2. **Application Block** - Suspended users cannot apply to jobs
3. **Notifications** - Users receive notifications about suspension/reactivation

### External Job Integration (Adzuna)
- **Automated Import** - Cron job runs every 5 minutes
- **Duplicate Prevention** - Checks existing jobs by title and company
- **Proper Attribution** - External jobs are marked with source and special handling
- **Application Safety** - Prevents errors when applying to external jobs

### Real-time Notifications
- **WebSocket Connection** - Instant notifications without polling
- **Application Updates** - Recruiters notified when candidates apply
- **Status Changes** - Job seekers notified when application status changes
- **User Management** - Notifications for account suspension/activation

### Analytics Dashboard
Comprehensive admin analytics including:
- User statistics (total, job seekers, recruiters, suspended)
- Job metrics (total, open, internal vs. external)
- Application analytics (total, by status, success rate)
- Top companies by application count
- Recent Adzuna imports
- Visual charts for application status distribution

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test coverage
```

### Frontend Tests
```bash
cd job-frontend
npm run lint              # Linting
```

## 📝 Environment Variables

### Required Backend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `DB_DATABASE` | Database name | `job_platform` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `ADZUNA_APP_ID` | Adzuna API App ID | `your_app_id` |
| `ADZUNA_APP_KEY` | Adzuna API Key | `your_api_key` |

## 🚧 Known Limitations

- Adzuna API free tier: 1000 calls/month
- Resume uploads limited to PDF format
- Real-time notifications require active WebSocket connection
- External jobs (Adzuna) link to original source, applications tracked internally

## 🔄 Recent Updates

- ✅ Integrated Adzuna API with automated job imports
- ✅ Added comprehensive admin analytics dashboard
- ✅ Implemented jobseeker suspension system
- ✅ Added source filtering for jobs (Internal/Adzuna)
- ✅ Enhanced notification system with WebSocket support
- ✅ Fixed external job application handling
- ✅ Improved admin job management interface


### Code Standards
- Backend: Follow NestJS best practices
- Frontend: Use functional components with hooks
- TypeScript: Maintain type safety
- Formatting: Use Prettier for consistent code style

### Database Migrations
TypeORM is configured with `synchronize: true` for development. For production, use proper migrations:
```bash
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## 🐛 Troubleshooting

### Backend won't start
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check CORS settings in [backend/src/main.ts](backend/src/main.ts)
- Verify API URL in [job-frontend/src/api/axios.js](job-frontend/src/api/axios.js)

### Adzuna jobs not importing
- Verify API credentials in `.env`
- Check Adzuna API quota (1000 calls/month)
- Review backend logs for import errors

### WebSocket notifications not working
- Check WebSocket connection in browser console
- Verify Socket.IO client version matches server
- Ensure CORS allows WebSocket connections

