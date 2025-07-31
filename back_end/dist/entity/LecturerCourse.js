"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LecturerCourse = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Course_1 = require("./Course");
let LecturerCourse = class LecturerCourse {
};
exports.LecturerCourse = LecturerCourse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LecturerCourse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LecturerCourse.prototype, "lecturerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.lecturerCourses),
    (0, typeorm_1.JoinColumn)({ name: "lecturerId" }),
    __metadata("design:type", User_1.User)
], LecturerCourse.prototype, "lecturer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LecturerCourse.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.lecturerCourses),
    (0, typeorm_1.JoinColumn)({ name: "courseId" }),
    __metadata("design:type", Course_1.Course)
], LecturerCourse.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LecturerCourse.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LecturerCourse.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LecturerCourse.prototype, "updatedAt", void 0);
exports.LecturerCourse = LecturerCourse = __decorate([
    (0, typeorm_1.Entity)("lecturer_courses"),
    (0, typeorm_1.Unique)(["lecturerId", "courseId"])
], LecturerCourse);
//# sourceMappingURL=LecturerCourse.js.map