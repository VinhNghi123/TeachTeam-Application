import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Unique
  } from "typeorm";
  import { User } from "./User";
  import { Course } from "./Course";
  
  @Entity("lecturer_courses")
  @Unique(["lecturerId", "courseId"]) 
  export class LecturerCourse {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    lecturerId: number;
  
    @ManyToOne(() => User, (user) => user.lecturerCourses)
    @JoinColumn({ name: "lecturerId" })
    lecturer: User;
  
    @Column()
    courseId: number;
  
    @ManyToOne(() => Course, (course) => course.lecturerCourses)
    @JoinColumn({ name: "courseId" })
    course: Course;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }