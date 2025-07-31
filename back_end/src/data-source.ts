import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Course } from "./entity/Course";
import { Application } from "./entity/Application";
import { LecturerCourse } from "./entity/LecturerCourse";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S3978216",
  password: "S3978216",
  database: "S3978216",
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true,
  entities: [User, Application, Course, LecturerCourse],
  migrations: [],
  subscribers: [],
});
