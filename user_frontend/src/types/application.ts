export enum ApplicationRole {
  TUTOR = "tutor",
  LAB_ASSISTANT = "lab-assistant"
}

export enum ApplicationStatus {
  PENDING = "pending",
  SELECTED = "selected",
  REJECTED = "rejected"
}

export enum AvailabilityType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time"
}

export interface Application {
  id: number;
  tutorId: number;
  courseId: number;
  role: ApplicationRole;
  availability: AvailabilityType;
  relevantSkills: string[];
  academicCredentials: string;
  relevantExperience: string[];
  status: ApplicationStatus;
  ranking: number | null;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
} 