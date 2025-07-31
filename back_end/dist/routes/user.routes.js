"use strict";
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
const express_1 = require("express");
const UserController_1 = require("../controller/UserController");
const AuthController_1 = require("../controller/AuthController");
const CourseController_1 = require("../controller/CourseController");
const ApplicationController_1 = require("../controller/ApplicationController");
const LecturerCourseController_1 = require("../controller/LecturerCourseController");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
const authController = new AuthController_1.AuthController();
const courseController = new CourseController_1.CourseController();
const applicationController = new ApplicationController_1.ApplicationController();
const lecturerCourseController = new LecturerCourseController_1.LecturerCourseController();
// Auth routes
router.post("/auth/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.register(req, res);
}));
router.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.login(req, res);
}));
// User routes
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.all(req, res);
}));
router.get("/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.one(req, res);
}));
router.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.save(req, res);
}));
router.put("/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.update(req, res);
}));
router.delete("/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.remove(req, res);
}));
// Course routes
router.get("/courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield courseController.all(req, res);
}));
router.get("/courses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield courseController.one(req, res);
}));
router.post("/courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield courseController.save(req, res);
}));
router.put("/courses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield courseController.update(req, res);
}));
router.delete("/courses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield courseController.remove(req, res);
}));
// Application routes
router.get("/applications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.all(req, res);
}));
router.get("/applications/tutor/:tutorId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.getByTutor(req, res);
}));
router.get("/applications/course/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.getByCourse(req, res);
}));
router.get("/applications/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.one(req, res);
}));
router.post("/applications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.save(req, res);
}));
router.put("/applications/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.update(req, res);
}));
router.patch("/applications/:id/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.updateStatus(req, res);
}));
router.patch("/applications/:id/ranking", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.updateRanking(req, res);
}));
router.patch("/applications/:id/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.updateComments(req, res);
}));
router.delete("/applications/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.remove(req, res);
}));
router.get("/applications/course/:courseId/max-ranking", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.getMaxRanking(req, res);
}));
// Lecturer course assignment routes
router.get("/lecturer-courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerCourseController.all(req, res);
}));
router.get("/lecturer-courses/lecturer/:lecturerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerCourseController.getByLecturer(req, res);
}));
router.get("/lecturer-courses/course/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerCourseController.getByCourse(req, res);
}));
router.post("/lecturer-courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerCourseController.save(req, res);
}));
router.delete("/lecturer-courses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerCourseController.remove(req, res);
}));
// Statistics and reports for visualizations
router.get("/statistics/applications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield applicationController.getStatistics(req, res);
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map