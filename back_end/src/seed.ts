import { AppDataSource } from "./data-source";
import { User, UserType } from "./entity/User";
import { Course } from "./entity/Course";
import { LecturerCourse } from "./entity/LecturerCourse";
import * as bcrypt from "bcrypt";

async function seed() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection initialized");

    // Create admin user
    const adminUser = new User();
    adminUser.name = "Admin User";
    adminUser.email = "admin@example.com";
    adminUser.password = await bcrypt.hash("admin123", 10);
    adminUser.type = UserType.ADMIN;
    await AppDataSource.manager.save(adminUser);

    // Create lecturer
    const lecturer = new User();
    lecturer.name = "John Lecturer";
    lecturer.email = "lecturer@example.com";
    lecturer.password = await bcrypt.hash("lecturer123", 10);
    lecturer.type = UserType.LECTURER;
    await AppDataSource.manager.save(lecturer);

    // Create tutor
    const tutor = new User();
    tutor.name = "Jane Tutor";
    tutor.email = "tutor@example.com";
    tutor.password = await bcrypt.hash("tutor123", 10);
    tutor.type = UserType.TUTOR;
    await AppDataSource.manager.save(tutor);

    // Create courses
    const course1 = new Course();
    course1.courseCode = "COSC1234";
    course1.name = "COSC1234 - Introduction to Programming";
    course1.description = "Basic programming concepts and practices";
    course1.semester = "Semester 1";
    course1.year = 2024;
    await AppDataSource.manager.save(course1);

    const course2 = new Course();
    course2.courseCode = "COSC2345";
    course2.name = "COSC2345 - Web Development";
    course2.description = "Modern web development techniques";
    course2.semester = "Semester 2";
    course2.year = 2024;
    await AppDataSource.manager.save(course2);

    // Assign lecturer to courses
    const lecturerCourse1 = new LecturerCourse();
    lecturerCourse1.lecturer = lecturer;
    lecturerCourse1.course = course1;
    await AppDataSource.manager.save(lecturerCourse1);

    const lecturerCourse2 = new LecturerCourse();
    lecturerCourse2.lecturer = lecturer;
    lecturerCourse2.course = course2;
    await AppDataSource.manager.save(lecturerCourse2);


    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed(); 