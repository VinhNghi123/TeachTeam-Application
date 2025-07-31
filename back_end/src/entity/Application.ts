import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
  } from "typeorm";
  import { User } from "./User";
  import { Course } from "./Course";
  
  export enum ApplicationRole {
    TUTOR = "tutor",
    LAB_ASSISTANT = "lab-assistant",
  }
  
  export enum ApplicationStatus {
    PENDING = "pending",
    SELECTED = "selected",
    REJECTED = "rejected",
  }
  
  export enum AvailabilityType {
    FULL_TIME = "full-time",
    PART_TIME = "part-time",
  }
  
  @Entity("applications")
  export class Application {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    tutorId: number;
  
    @ManyToOne(() => User, (user) => user.applications)
    @JoinColumn({ name: "tutorId" })
    tutor: User;
  
    @Column()
    courseId: number;
  
    @ManyToOne(() => Course, (course) => course.applications)
    @JoinColumn({ name: "courseId" })
    course: Course;
  
    @Column({
      type: "enum",
      enum: ApplicationRole,
      default: ApplicationRole.TUTOR,
    })
    role: ApplicationRole;
  
    @Column({
      type: "enum",
      enum: AvailabilityType,
      default: AvailabilityType.PART_TIME,
    })
    availability: AvailabilityType;
  
    @Column("simple-array", { nullable: true })
    relevantSkills: string[];
  
    @Column({ type: "text" })
    academicCredentials: string;
  
    @Column("simple-array", { nullable: true })
    relevantExperience: string[];
  
    @Column({
      type: "enum",
      enum: ApplicationStatus,
      default: ApplicationStatus.PENDING,
    })
    status: ApplicationStatus;
  
    @Column({ type: "int", nullable: true })
    ranking: number;
  
    @Column({ type: "text", nullable: true })
    comments: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }