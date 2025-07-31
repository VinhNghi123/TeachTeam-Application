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
exports.CourseController = void 0;
const data_source_1 = require("../data-source");
const Course_1 = require("../entity/Course");
const validation_1 = require("../utils/validation");
class CourseController {
    constructor() {
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    /**
     * Retrieves all courses with optional filtering
     * @param request - Express request with query parameters
     * @param response - Express response object
     * @returns JSON response with filtered courses
     */
    all(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { semester, year, isActive } = request.query;
                let query = this.courseRepository.createQueryBuilder("course");
                // Apply filters if provided
                if (semester) {
                    query = query.andWhere("course.semester = :semester", { semester });
                }
                if (year) {
                    query = query.andWhere("course.year = :year", { year: parseInt(year) });
                }
                if (isActive !== undefined) {
                    const active = isActive === 'true';
                    query = query.andWhere("course.isActive = :isActive", { isActive: active });
                }
                // Order by course code
                query = query.orderBy("course.courseCode", "ASC");
                const courses = yield query.getMany();
                return response.json(courses);
            }
            catch (error) {
                console.error("Error retrieving courses:", error);
                return response.status(500).json({
                    message: "Error retrieving courses",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves a single course by ID
     * @param request - Express request with course ID
     * @param response - Express response object
     * @returns JSON response with the course if found
     */
    one(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const course = yield this.courseRepository.findOne({
                    where: { id },
                    relations: ["applications", "lecturerCourses", "lecturerCourses.lecturer"]
                });
                if (!course) {
                    return response.status(404).json({ message: "Course not found" });
                }
                return response.json(course);
            }
            catch (error) {
                console.error("Error retrieving course:", error);
                return response.status(500).json({
                    message: "Error retrieving course",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Creates a new course
     * @param request - Express request with course details
     * @param response - Express response object
     * @returns JSON response with the created course
     */
    save(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseCode, name, description, semester, year, isActive = true } = request.body;
                // Validate required fields
                if (!courseCode || !name || !semester || !year) {
                    return response.status(400).json({
                        message: "Course code, name, semester, and year are required"
                    });
                }
                // Validate course code format (COSC followed by 4 digits)
                if (!(0, validation_1.validateCourseCode)(courseCode)) {
                    return response.status(400).json({
                        message: "Invalid course code format. Must be in format COSCxxxx where xxxx is a 4-digit number"
                    });
                }
                // Check if course code already exists
                const existingCourse = yield this.courseRepository.findOne({
                    where: { courseCode }
                });
                if (existingCourse) {
                    return response.status(400).json({
                        message: "Course code already exists"
                    });
                }
                // Create new course
                const course = new Course_1.Course();
                course.courseCode = courseCode;
                course.name = name;
                course.description = description;
                course.semester = semester;
                course.year = parseInt(year);
                course.isActive = isActive;
                const savedCourse = yield this.courseRepository.save(course);
                return response.status(201).json(savedCourse);
            }
            catch (error) {
                console.error("Error creating course:", error);
                return response.status(500).json({
                    message: "Error creating course",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Updates an existing course
     * @param request - Express request with course ID and updated details
     * @param response - Express response object
     * @returns JSON response with the updated course
     */
    update(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { courseCode, name, description, semester, year, isActive } = request.body;
                let courseToUpdate = yield this.courseRepository.findOne({
                    where: { id }
                });
                if (!courseToUpdate) {
                    return response.status(404).json({ message: "Course not found" });
                }
                // If course code is being updated, validate and check for duplicates
                if (courseCode && courseCode !== courseToUpdate.courseCode) {
                    // Validate course code format
                    if (!(0, validation_1.validateCourseCode)(courseCode)) {
                        return response.status(400).json({
                            message: "Invalid course code format. Must be in format COSCxxxx where xxxx is a 4-digit number"
                        });
                    }
                    // Check if the new course code already exists
                    const existingCourse = yield this.courseRepository.findOne({
                        where: { courseCode }
                    });
                    if (existingCourse) {
                        return response.status(400).json({
                            message: "Course code already exists"
                        });
                    }
                    courseToUpdate.courseCode = courseCode;
                }
                // Update other fields if provided
                if (name)
                    courseToUpdate.name = name;
                if (description !== undefined)
                    courseToUpdate.description = description;
                if (semester)
                    courseToUpdate.semester = semester;
                if (year)
                    courseToUpdate.year = parseInt(year);
                if (isActive !== undefined)
                    courseToUpdate.isActive = isActive;
                const updatedCourse = yield this.courseRepository.save(courseToUpdate);
                return response.json(updatedCourse);
            }
            catch (error) {
                console.error("Error updating course:", error);
                return response.status(500).json({
                    message: "Error updating course",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Removes a course from the database
     * @param request - Express request with course ID
     * @param response - Express response object
     * @returns JSON response with success message
     */
    remove(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const courseToRemove = yield this.courseRepository.findOne({
                    where: { id }
                });
                if (!courseToRemove) {
                    return response.status(404).json({ message: "Course not found" });
                }
                yield this.courseRepository.remove(courseToRemove);
                return response.json({ message: "Course removed successfully" });
            }
            catch (error) {
                console.error("Error removing course:", error);
                return response.status(500).json({
                    message: "Error removing course",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.CourseController = CourseController;
//# sourceMappingURL=CourseController.js.map