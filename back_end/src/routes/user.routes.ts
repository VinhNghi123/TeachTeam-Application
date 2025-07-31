import { Router } from "express";
import { UserController } from "../controller/UserController";
import { AuthController } from "../controller/AuthController";
import { CourseController } from "../controller/CourseController"; 
import { ApplicationController } from "../controller/ApplicationController";
import { LecturerCourseController } from "../controller/LecturerCourseController";

const router = Router();
const userController = new UserController();
const authController = new AuthController();
const courseController = new CourseController();
const applicationController = new ApplicationController();
const lecturerCourseController = new LecturerCourseController();

// Auth routes
router.post("/auth/register", async (req, res) => {
  await authController.register(req, res);
});

router.post("/auth/login", async (req, res) => {
  await authController.login(req, res);
});

// User routes
router.get("/users", async (req, res) => {
  await userController.all(req, res);
});

router.get("/users/:id", async (req, res) => {
  await userController.one(req, res);
});

router.post("/users", async (req, res) => {
  await userController.save(req, res);
});

router.put("/users/:id", async (req, res) => {
  await userController.update(req, res);
});

router.delete("/users/:id", async (req, res) => {
  await userController.remove(req, res);
});

// Course routes
router.get("/courses", async (req, res) => {
  await courseController.all(req, res);
});

router.get("/courses/:id", async (req, res) => {
  await courseController.one(req, res);
});

router.post("/courses", async (req, res) => {
  await courseController.save(req, res);
});

router.put("/courses/:id", async (req, res) => {
  await courseController.update(req, res);
});

router.delete("/courses/:id", async (req, res) => {
  await courseController.remove(req, res);
});

// Application routes
router.get("/applications", async (req, res) => {
  await applicationController.all(req, res);
});

router.get("/applications/tutor/:tutorId", async (req, res) => {
  await applicationController.getByTutor(req, res);
});

router.get("/applications/course/:courseId", async (req, res) => {
  await applicationController.getByCourse(req, res);
});

router.get("/applications/:id", async (req, res) => {
  await applicationController.one(req, res);
});

router.post("/applications", async (req, res) => {
  await applicationController.save(req, res);
});

router.put("/applications/:id", async (req, res) => {
  await applicationController.update(req, res);
});

router.patch("/applications/:id/status", async (req, res) => {
  await applicationController.updateStatus(req, res);
});

router.patch("/applications/:id/ranking", async (req, res) => {
  await applicationController.updateRanking(req, res);
});

router.patch("/applications/:id/comments", async (req, res) => {
  await applicationController.updateComments(req, res);
});

router.delete("/applications/:id", async (req, res) => {
  await applicationController.remove(req, res);
});

router.get("/applications/course/:courseId/max-ranking", async (req, res) => {
  await applicationController.getMaxRanking(req, res);
});

// Lecturer course assignment routes
router.get("/lecturer-courses", async (req, res) => {
  await lecturerCourseController.all(req, res);
});

router.get("/lecturer-courses/lecturer/:lecturerId", async (req, res) => {
  await lecturerCourseController.getByLecturer(req, res);
});

router.get("/lecturer-courses/course/:courseId", async (req, res) => {
  await lecturerCourseController.getByCourse(req, res);
});

router.post("/lecturer-courses", async (req, res) => {
  await lecturerCourseController.save(req, res);
});

router.delete("/lecturer-courses/:id", async (req, res) => {
  await lecturerCourseController.remove(req, res);
});

// Statistics and reports for visualizations
router.get("/statistics/applications", async (req, res) => {
  await applicationController.getStatistics(req, res);
});

export default router;