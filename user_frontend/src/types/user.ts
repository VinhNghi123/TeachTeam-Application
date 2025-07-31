export type UserType = 'tutor' | 'lecturer';
export type ApplicationRole = 'tutor' | 'lab-assistant';

export interface BaseUser {
  id: number;
  name: string;
  email: string;
  password: string;
  type: UserType;
}

export interface Tutor extends BaseUser {
  type: 'tutor';
  skills: string[];
  availability: 'part-time' | 'full-time';
  previousRoles: string[];
  academicCredentials: string;
  appliedCourses?: Application[];
}

export interface Lecturer extends BaseUser {
  type: 'lecturer';
  courses: string[];
}

export type User = Tutor | Lecturer;

export interface Application {
  courseId: number;
  tutorId: number;
  status: 'pending' | 'selected' | 'rejected';
  ranking: number | null;
  comments?: string;
  role: ApplicationRole;
  relevantSkills: string[];
  academicCredentials: string;
  availability: 'part-time' | 'full-time';
}