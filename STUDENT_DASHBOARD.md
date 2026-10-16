# Student Dashboard

A comprehensive student management system integrated into the three-tier application.

## Features

### Student Management
- View all students with their basic information (name, ID, major, year, GPA)
- Individual student dashboards with detailed academic information
- Real-time statistics and performance tracking

### Course Management
- Track enrolled courses with credits, instructors, and semesters
- View current grades for each course
- Course-specific assignment lists

### Assignment Tracking
- View all assignments across enrolled courses
- See due dates, point values, and descriptions
- Submit assignments directly from the dashboard
- Track submission status (pending, submitted, graded)
- View earned points and percentages for graded work

### Statistics & Analytics
- Total enrolled courses count
- Assignment submission progress
- Number of graded assignments
- Overall average score across all graded work

## Database Schema

### Tables
- **students**: Student profiles with GPA and academic information
- **courses**: Course catalog with instructors and credit hours
- **enrollments**: Many-to-many relationship between students and courses
- **assignments**: Course assignments with due dates and point values
- **submissions**: Student assignment submissions with grades

### Relationships
- Students ↔ Courses (via enrollments)
- Courses → Assignments (one-to-many)
- Students + Assignments → Submissions (unique pair)

## API Endpoints

### Student Endpoints
- `GET /students` - List all students
- `GET /students/:id` - Get single student
- `GET /students/:id/dashboard` - Complete dashboard data

### Course & Assignment Endpoints
- `GET /courses` - List all courses
- `GET /assignments` - List all assignments
- `POST /submissions` - Submit an assignment

## Pages

### `/students`
Student list page showing all students in a card layout with:
- Student name and ID
- Major and year
- GPA (prominently displayed)
- Email address

### `/students/[id]`
Individual student dashboard featuring:
- **Header**: Student info with large GPA display
- **Statistics Cards**: 4 key metrics at a glance
- **Upcoming Assignments**: Next 5 pending assignments with quick submit
- **All Assignments**: Organized by status (pending, submitted, graded)
- **Course Sidebar**: Enrolled courses with grades and details

## Sample Data

The migration includes sample data for immediate testing:
- 3 students (Computer Science and Mathematics majors)
- 4 courses (CS101, CS201, CS301, MATH201)
- 6 enrollments with various grades
- 4 assignments with different due dates
- 5 submissions in different states

## Usage

1. Start the application with `docker-compose up`
2. Navigate to http://localhost:3000
3. Click "Student Dashboard" in the header
4. Select a student to view their dashboard
5. Submit assignments, view grades, and track progress

## Design

- **Responsive**: Works on all screen sizes
- **Dark Mode**: Full dark mode support
- **Accessible**: Semantic HTML and ARIA labels
- **Modern UI**: Clean design with Tailwind CSS
- **Color-coded**: Status badges for easy identification

## Technology

- **Frontend**: Next.js 16 with React 19 Server Components
- **Backend**: Express 5 REST API
- **Database**: PostgreSQL 17 with foreign key constraints
- **Styling**: Tailwind CSS 4 with dark mode
- **TypeScript**: Strict mode for type safety
