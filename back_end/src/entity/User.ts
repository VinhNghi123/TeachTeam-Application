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

export enum UserType {
  TUTOR = "tutor",
  LECTURER = "lecturer",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.TUTOR,
  })
  type: UserType;

  @Column({ nullable: true })
  profileBio: string;

  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.tutor)
  applications: Application[];

  @OneToMany(() => LecturerCourse, (lecturerCourse) => lecturerCourse.lecturer)
  lecturerCourses: LecturerCourse[];
}