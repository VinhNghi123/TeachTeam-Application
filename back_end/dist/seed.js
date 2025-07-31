"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const Course_1 = require("./entity/Course");
const LecturerCourse_1 = require("./entity/LecturerCourse");
const bcrypt = __importStar(require("bcrypt"));
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize the database connection
            yield data_source_1.AppDataSource.initialize();
            console.log("Database connection initialized");
            // Create admin user
            const adminUser = new User_1.User();
            adminUser.name = "Admin User";
            adminUser.email = "admin@example.com";
            adminUser.password = yield bcrypt.hash("admin123", 10);
            adminUser.type = User_1.UserType.ADMIN;
            yield data_source_1.AppDataSource.manager.save(adminUser);
            // Create lecturer
            const lecturer = new User_1.User();
            lecturer.name = "John Lecturer";
            lecturer.email = "lecturer@example.com";
            lecturer.password = yield bcrypt.hash("lecturer123", 10);
            lecturer.type = User_1.UserType.LECTURER;
            yield data_source_1.AppDataSource.manager.save(lecturer);
            // Create tutor
            const tutor = new User_1.User();
            tutor.name = "Jane Tutor";
            tutor.email = "tutor@example.com";
            tutor.password = yield bcrypt.hash("tutor123", 10);
            tutor.type = User_1.UserType.TUTOR;
            yield data_source_1.AppDataSource.manager.save(tutor);
            // Create courses
            const course1 = new Course_1.Course();
            course1.courseCode = "COSC1234";
            course1.name = "COSC1234 - Introduction to Programming";
            course1.description = "Basic programming concepts and practices";
            course1.semester = "Semester 1";
            course1.year = 2024;
            yield data_source_1.AppDataSource.manager.save(course1);
            const course2 = new Course_1.Course();
            course2.courseCode = "COSC2345";
            course2.name = "COSC2345 - Web Development";
            course2.description = "Modern web development techniques";
            course2.semester = "Semester 2";
            course2.year = 2024;
            yield data_source_1.AppDataSource.manager.save(course2);
            // Assign lecturer to courses
            const lecturerCourse1 = new LecturerCourse_1.LecturerCourse();
            lecturerCourse1.lecturer = lecturer;
            lecturerCourse1.course = course1;
            yield data_source_1.AppDataSource.manager.save(lecturerCourse1);
            const lecturerCourse2 = new LecturerCourse_1.LecturerCourse();
            lecturerCourse2.lecturer = lecturer;
            lecturerCourse2.course = course2;
            yield data_source_1.AppDataSource.manager.save(lecturerCourse2);
            console.log("Database seeded successfully!");
        }
        catch (error) {
            console.error("Error seeding database:", error);
        }
        finally {
            yield data_source_1.AppDataSource.destroy();
        }
    });
}
seed();
//# sourceMappingURL=seed.js.map