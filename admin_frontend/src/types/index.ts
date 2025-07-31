export interface User {
  id: string;
  name: string;
  email: string;
  type: 'tutor' | 'lecturer' | 'admin';
  isBlocked: boolean;
}

export interface Course {
  id: string;
  courseCode: string;
  name: string;
  description?: string;
  semester: string;
  year: number;
  isActive: boolean;
}

export interface LecturerCourse {
  id: string;
  lecturer: User;
  course: Course;
}

export interface Application {
  id: string;
  tutor: User;
  course: Course;
  status: 'pending' | 'selected' | 'rejected';
  role: 'tutor' | 'lab_assistant';
  availability: 'full_time' | 'part_time';
}

export interface CandidateAvailabilityUpdate {
  tutorId: string;
  tutorName: string;
  isAvailable: boolean;
  message: string;
} 