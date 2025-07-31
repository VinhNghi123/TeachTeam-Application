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
exports.LecturerCourseController = void 0;
const data_source_1 = require("../data-source");
const LecturerCourse_1 = require("../entity/LecturerCourse");
const User_1 = require("../entity/User");
const Course_1 = require("../entity/Course");
class LecturerCourseController {
    constructor() {
        this.lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    /**
     * Retrieves all lecturer-course assignments
     * @param request - Express request with optional query parameters
     * @param response - Express response object
     * @returns JSON response with all lecturer-course assignments
     */
    all(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { isActive } = request.query;
                let query = this.lecturerCourseRepository.createQueryBuilder("lecturerCourse")
                    .leftJoinAndSelect("lecturerCourse.lecturer", "lecturer")
                    .leftJoinAndSelect("lecturerCourse.course", "course");
                // Filter by active status if specified
                if (isActive !== undefined) {
                    const active = isActive === 'true';
                    query = query.andWhere("lecturerCourse.isActive = :isActive", { isActive: active });
                }
                const lecturerCourses = yield query.getMany();
                return response.json(lecturerCourses);
            }
            catch (error) {
                console.error("Error retrieving lecturer-course assignments:", error);
                return response.status(500).json({
                    message: "Error retrieving lecturer-course assignments",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves course assignments for a specific lecturer
     * @param request - Express request with lecturer ID
     * @param response - Express response object
     * @returns JSON response with lecturer's course assignments
     */
    getByLecturer(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lecturerId = parseInt(request.params.lecturerId);
                const lecturerCourses = yield this.lecturerCourseRepository.find({
                    where: { lecturerId, isActive: true },
                    relations: ["course"],
                    order: { course: { courseCode: "ASC" } }
                });
                return response.json(lecturerCourses);
            }
            catch (error) {
                console.error("Error retrieving lecturer's courses:", error);
                return response.status(500).json({
                    message: "Error retrieving lecturer's courses",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves lecturer assignments for a specific course
     * @param request - Express request with course ID
     * @param response - Express response object
     * @returns JSON response with course's lecturer assignments
     */
    getByCourse(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseId = parseInt(request.params.courseId);
                const lecturerCourses = yield this.lecturerCourseRepository.find({
                    where: { courseId, isActive: true },
                    relations: ["lecturer"],
                    order: { lecturer: { name: "ASC" } }
                });
                return response.json(lecturerCourses);
            }
            catch (error) {
                console.error("Error retrieving course's lecturers:", error);
                return response.status(500).json({
                    message: "Error retrieving course's lecturers",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Creates a new lecturer-course assignment
     * @param request - Express request with assignment details
     * @param response - Express response object
     * @returns JSON response with the created assignment
     */
    save(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lecturerId, courseId, isActive = true } = request.body;
                // Validate required fields
                if (!lecturerId || !courseId) {
                    return response.status(400).json({
                        message: "Lecturer ID and course ID are required"
                    });
                }
                // Check if lecturer exists and is a lecturer
                const lecturer = yield this.userRepository.findOne({
                    where: { id: lecturerId }
                });
                if (!lecturer) {
                    return response.status(404).json({
                        message: "Lecturer not found"
                    });
                }
                if (lecturer.type !== User_1.UserType.LECTURER) {
                    return response.status(400).json({
                        message: "User is not a lecturer"
                    });
                }
                // Check if course exists
                const course = yield this.courseRepository.findOne({
                    where: { id: courseId }
                });
                if (!course) {
                    return response.status(404).json({
                        message: "Course not found"
                    });
                }
                // Check if assignment already exists
                const existingAssignment = yield this.lecturerCourseRepository.findOne({
                    where: {
                        lecturerId,
                        courseId
                    }
                });
                if (existingAssignment) {
                    // If it exists but was inactive, reactivate it
                    if (!existingAssignment.isActive && isActive) {
                        existingAssignment.isActive = true;
                        const updatedAssignment = yield this.lecturerCourseRepository.save(existingAssignment);
                        return response.json(updatedAssignment);
                    }
                    return response.status(400).json({
                        message: "Lecturer is already assigned to this course"
                    });
                }
                // Create new assignment
                const lecturerCourse = new LecturerCourse_1.LecturerCourse();
                lecturerCourse.lecturerId = lecturerId;
                lecturerCourse.courseId = courseId;
                lecturerCourse.isActive = isActive;
                const savedAssignment = yield this.lecturerCourseRepository.save(lecturerCourse);
                return response.status(201).json(savedAssignment);
            }
            catch (error) {
                console.error("Error creating lecturer-course assignment:", error);
                return response.status(500).json({
                    message: "Error creating lecturer-course assignment",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Updates a lecturer-course assignment
     * @param request - Express request with assignment ID and updates
     * @param response - Express response object
     * @returns JSON response with the updated assignment
     */
    update(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { isActive } = request.body;
                if (isActive === undefined) {
                    return response.status(400).json({
                        message: "Active status is required"
                    });
                }
                let assignmentToUpdate = yield this.lecturerCourseRepository.findOne({
                    where: { id }
                });
                if (!assignmentToUpdate) {
                    return response.status(404).json({ message: "Assignment not found" });
                }
                assignmentToUpdate.isActive = isActive;
                const updatedAssignment = yield this.lecturerCourseRepository.save(assignmentToUpdate);
                return response.json(updatedAssignment);
            }
            catch (error) {
                console.error("Error updating lecturer-course assignment:", error);
                return response.status(500).json({
                    message: "Error updating lecturer-course assignment",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Removes a lecturer-course assignment
     * @param request - Express request with assignment ID
     * @param response - Express response object
     * @returns JSON response with success message
     */
    remove(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const assignmentToRemove = yield this.lecturerCourseRepository.findOne({
                    where: { id }
                });
                if (!assignmentToRemove) {
                    return response.status(404).json({ message: "Assignment not found" });
                }
                yield this.lecturerCourseRepository.remove(assignmentToRemove);
                return response.json({ message: "Lecturer-course assignment removed successfully" });
            }
            catch (error) {
                console.error("Error removing lecturer-course assignment:", error);
                return response.status(500).json({
                    message: "Error removing lecturer-course assignment",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.LecturerCourseController = LecturerCourseController;
//# sourceMappingURL=LecturerCourseController.js.map