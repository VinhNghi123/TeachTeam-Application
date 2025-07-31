import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { Application } from "./Application";
  import { LecturerCourse } from "./LecturerCourse";
  
  @Entity("courses")
  export class Course {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    courseCode: string;
  
    @Column()
    name: string;
  
    @Column({ type: "text", nullable: true })
    description: string;
  
    @Column()
    semester: string;
  
    @Column()
    year: number;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @OneToMany(() => Application, (application) => application.course)
    applications: Application[];
  
    @OneToMany(() => LecturerCourse, (lecturerCourse) => lecturerCourse.course)
    lecturerCourses: LecturerCourse[];
  }