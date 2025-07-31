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
exports.Application = exports.AvailabilityType = exports.ApplicationStatus = exports.ApplicationRole = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Course_1 = require("./Course");
var ApplicationRole;
(function (ApplicationRole) {
    ApplicationRole["TUTOR"] = "tutor";
    ApplicationRole["LAB_ASSISTANT"] = "lab-assistant";
})(ApplicationRole || (exports.ApplicationRole = ApplicationRole = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["SELECTED"] = "selected";
    ApplicationStatus["REJECTED"] = "rejected";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var AvailabilityType;
(function (AvailabilityType) {
    AvailabilityType["FULL_TIME"] = "full-time";
    AvailabilityType["PART_TIME"] = "part-time";
})(AvailabilityType || (exports.AvailabilityType = AvailabilityType = {}));
let Application = class Application {
};
exports.Application = Application;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Application.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Application.prototype, "tutorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.applications),
    (0, typeorm_1.JoinColumn)({ name: "tutorId" }),
    __metadata("design:type", User_1.User)
], Application.prototype, "tutor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Application.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.applications),
    (0, typeorm_1.JoinColumn)({ name: "courseId" }),
    __metadata("design:type", Course_1.Course)
], Application.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ApplicationRole,
        default: ApplicationRole.TUTOR,
    }),
    __metadata("design:type", String)
], Application.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AvailabilityType,
        default: AvailabilityType.PART_TIME,
    }),
    __metadata("design:type", String)
], Application.prototype, "availability", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Application.prototype, "relevantSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Application.prototype, "academicCredentials", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Application.prototype, "relevantExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Application.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Application.prototype, "ranking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Application.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "updatedAt", void 0);
exports.Application = Application = __decorate([
    (0, typeorm_1.Entity)("applications")
], Application);
//# sourceMappingURL=Application.js.map