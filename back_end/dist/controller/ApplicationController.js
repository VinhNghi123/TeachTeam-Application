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
exports.ApplicationController = void 0;
const data_source_1 = require("../data-source");
const Application_1 = require("../entity/Application");
const User_1 = require("../entity/User");
const Course_1 = require("../entity/Course");
const typeorm_1 = require("typeorm");
class ApplicationController {
    constructor() {
        this.applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    /**
     * Retrieves all applications with optional filtering
     * @param request - Express request with query parameters
     * @param response - Express response object
     * @returns JSON response with filtered applications
     */
    all(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, role, availability, search } = request.query;
                let query = this.applicationRepository.createQueryBuilder("application")
                    .leftJoinAndSelect("application.tutor", "tutor")
                    .leftJoinAndSelect("application.course", "course");
                // Apply filters if provided
                if (status && Object.values(Application_1.ApplicationStatus).includes(status)) {
                    query = query.andWhere("application.status = :status", { status });
                }
                if (role && Object.values(Application_1.ApplicationRole).includes(role)) {
                    query = query.andWhere("application.role = :role", { role });
                }
                if (availability && Object.values(Application_1.AvailabilityType).includes(availability)) {
                    query = query.andWhere("application.availability = :availability", { availability });
                }
                // Add search filter for tutor name or email
                if (search) {
                    query = query.andWhere("(LOWER(tutor.name) LIKE LOWER(:search) OR LOWER(tutor.email) LIKE LOWER(:search))", {
                        search: `%${search}%`
                    });
                }
                const applications = yield query.getMany();
                // If search is provided and no results found, return a specific message
                if (search && applications.length === 0) {
                    return response.status(404).json({
                        message: "No tutors found matching your search criteria",
                        applications: []
                    });
                }
                return response.json(applications);
            }
            catch (error) {
                console.error("Error retrieving applications:", error);
                return response.status(500).json({
                    message: "Error retrieving applications",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves applications for a specific tutor
     * @param request - Express request with tutor ID
     * @param response - Express response object
     * @returns JSON response with tutor's applications
     */
    getByTutor(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutorId = parseInt(request.params.tutorId);
                const applications = yield this.applicationRepository.find({
                    where: { tutorId },
                    relations: ["course"],
                    order: { createdAt: "DESC" }
                });
                return response.json(applications);
            }
            catch (error) {
                console.error("Error retrieving tutor applications:", error);
                return response.status(500).json({
                    message: "Error retrieving tutor applications",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves applications for a specific course
     * @param request - Express request with course ID
     * @param response - Express response object
     * @returns JSON response with course applications
     */
    getByCourse(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseId = parseInt(request.params.courseId);
                const applications = yield this.applicationRepository.find({
                    where: { courseId },
                    relations: ["tutor"],
                    order: { status: "ASC", ranking: "ASC" }
                });
                return response.json(applications);
            }
            catch (error) {
                console.error("Error retrieving course applications:", error);
                return response.status(500).json({
                    message: "Error retrieving course applications",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves a single application by ID
     * @param request - Express request with application ID
     * @param response - Express response object
     * @returns JSON response with the application
     */
    one(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const application = yield this.applicationRepository.findOne({
                    where: { id },
                    relations: ["tutor", "course"]
                });
                if (!application) {
                    return response.status(404).json({ message: "Application not found" });
                }
                return response.json(application);
            }
            catch (error) {
                console.error("Error retrieving application:", error);
                return response.status(500).json({
                    message: "Error retrieving application",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Creates a new application
     * @param request - Express request with application details
     * @param response - Express response object
     * @returns JSON response with the created application
     */
    save(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tutorId, courseId, role = Application_1.ApplicationRole.TUTOR, availability = Application_1.AvailabilityType.PART_TIME, relevantSkills = [], academicCredentials, relevantExperience = [] } = request.body;
                // Validate required fields
                if (!tutorId || !courseId || !academicCredentials) {
                    return response.status(400).json({
                        message: "Tutor ID, course ID, and academic credentials are required"
                    });
                }
                // Check if tutor exists
                const tutor = yield this.userRepository.findOne({
                    where: { id: tutorId }
                });
                if (!tutor) {
                    return response.status(404).json({
                        message: "Tutor not found"
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
                // Check if application already exists for this tutor and course
                const existingApplication = yield this.applicationRepository.findOne({
                    where: {
                        tutorId,
                        courseId
                    }
                });
                if (existingApplication) {
                    return response.status(400).json({
                        message: "Application already exists for this tutor and course"
                    });
                }
                // Create new application
                const application = new Application_1.Application();
                application.tutorId = tutorId;
                application.courseId = courseId;
                application.role = role;
                application.availability = availability;
                application.relevantSkills = relevantSkills;
                application.academicCredentials = academicCredentials;
                application.relevantExperience = relevantExperience;
                application.status = Application_1.ApplicationStatus.PENDING;
                const savedApplication = yield this.applicationRepository.save(application);
                return response.status(201).json(savedApplication);
            }
            catch (error) {
                console.error("Error creating application:", error);
                return response.status(500).json({
                    message: "Error creating application",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Updates an existing application
     * @param request - Express request with application ID and updates
     * @param response - Express response object
     * @returns JSON response with the updated application
     */
    update(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { role, availability, relevantSkills, academicCredentials, relevantExperience, status, ranking, comments } = request.body;
                let applicationToUpdate = yield this.applicationRepository.findOne({
                    where: { id }
                });
                if (!applicationToUpdate) {
                    return response.status(404).json({ message: "Application not found" });
                }
                // Update fields if provided
                if (role)
                    applicationToUpdate.role = role;
                if (availability)
                    applicationToUpdate.availability = availability;
                if (relevantSkills)
                    applicationToUpdate.relevantSkills = relevantSkills;
                if (academicCredentials)
                    applicationToUpdate.academicCredentials = academicCredentials;
                if (relevantExperience)
                    applicationToUpdate.relevantExperience = relevantExperience;
                if (status)
                    applicationToUpdate.status = status;
                if (ranking !== undefined)
                    applicationToUpdate.ranking = ranking;
                if (comments !== undefined)
                    applicationToUpdate.comments = comments;
                const updatedApplication = yield this.applicationRepository.save(applicationToUpdate);
                return response.json(updatedApplication);
            }
            catch (error) {
                console.error("Error updating application:", error);
                return response.status(500).json({
                    message: "Error updating application",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Updates just the status of an application
     * @param request - Express request with application ID and status
     * @param response - Express response object
     * @returns JSON response with the updated application
     */
    updateStatus(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { status } = request.body;
                if (!status || !Object.values(Application_1.ApplicationStatus).includes(status)) {
                    return response.status(400).json({
                        message: "Valid status is required"
                    });
                }
                let applicationToUpdate = yield this.applicationRepository.findOne({
                    where: { id }
                });
                if (!applicationToUpdate) {
                    return response.status(404).json({ message: "Application not found" });
                }
                applicationToUpdate.status = status;
                const updatedApplication = yield this.applicationRepository.save(applicationToUpdate);
                return response.json(updatedApplication);
            }
            catch (error) {
                console.error("Error updating application status:", error);
                return response.status(500).json({
                    message: "Error updating application status",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Gets the maximum possible ranking for a course
     * @param request - Express request with course ID
     * @param response - Express response object
     * @returns JSON response with max ranking
     */
    getMaxRanking(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseId = parseInt(request.params.courseId);
                const courseApplications = yield this.applicationRepository.find({
                    where: { courseId }
                });
                return response.json({ maxRanking: courseApplications.length });
            }
            catch (error) {
                console.error("Error getting max ranking:", error);
                return response.status(500).json({
                    message: "Error getting max ranking",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Updates just the ranking of an application
     * @param request - Express request with application ID and ranking
     * @param response - Express response object
     * @returns JSON response with the updated application
     */
    updateRanking(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { ranking } = request.body;
                if (ranking === undefined) {
                    return response.status(400).json({
                        message: "Ranking is required"
                    });
                }
                let applicationToUpdate = yield this.applicationRepository.findOne({
                    where: { id },
                    relations: ["course"]
                });
                if (!applicationToUpdate) {
                    return response.status(404).json({ message: "Application not found" });
                }
                // Get total number of applications for this course
                const courseApplications = yield this.applicationRepository.find({
                    where: { courseId: applicationToUpdate.courseId }
                });
                const maxRanking = courseApplications.length;
                // Validate ranking is within range
                if (ranking !== null && (ranking < 1 || ranking > maxRanking)) {
                    return response.status(400).json({
                        message: `Ranking must be between 1 and ${maxRanking}, or null to remove ranking`
                    });
                }
                // Check if the ranking is already taken by another application
                if (ranking !== null) {
                    const existingRankedApplication = yield this.applicationRepository.findOne({
                        where: {
                            courseId: applicationToUpdate.courseId,
                            ranking: ranking,
                            id: (0, typeorm_1.Not)(id) // Exclude current application
                        }
                    });
                    if (existingRankedApplication) {
                        return response.status(400).json({
                            message: `Ranking ${ranking} is already assigned to another application`
                        });
                    }
                }
                applicationToUpdate.ranking = ranking;
                const updatedApplication = yield this.applicationRepository.save(applicationToUpdate);
                return response.json(updatedApplication);
            }
            catch (error) {
                console.error("Error updating application ranking:", error);
                return response.status(500).json({
                    message: "Error updating application ranking",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Updates just the comments of an application
     * @param request - Express request with application ID and comments
     * @param response - Express response object
     * @returns JSON response with the updated application
     */
    updateComments(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { comments } = request.body;
                if (comments === undefined) {
                    return response.status(400).json({
                        message: "Comments field is required"
                    });
                }
                let applicationToUpdate = yield this.applicationRepository.findOne({
                    where: { id }
                });
                if (!applicationToUpdate) {
                    return response.status(404).json({ message: "Application not found" });
                }
                applicationToUpdate.comments = comments;
                const updatedApplication = yield this.applicationRepository.save(applicationToUpdate);
                return response.json(updatedApplication);
            }
            catch (error) {
                console.error("Error updating application comments:", error);
                return response.status(500).json({
                    message: "Error updating application comments",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Removes an application from the database
     * @param request - Express request with application ID
     * @param response - Express response object
     * @returns JSON response with success message
     */
    remove(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const applicationToRemove = yield this.applicationRepository.findOne({
                    where: { id }
                });
                if (!applicationToRemove) {
                    return response.status(404).json({ message: "Application not found" });
                }
                yield this.applicationRepository.remove(applicationToRemove);
                return response.json({ message: "Application removed successfully" });
            }
            catch (error) {
                console.error("Error removing application:", error);
                return response.status(500).json({
                    message: "Error removing application",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Retrieves statistics for applications visualization
     * @param request - Express request
     * @param response - Express response object
     * @returns JSON response with statistics
     */
    getStatistics(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all applications with related data
                const applications = yield this.applicationRepository.find({
                    relations: ["tutor", "course"]
                });
                // Get counts for each status
                const statusCounts = {
                    pending: applications.filter(app => app.status === Application_1.ApplicationStatus.PENDING).length,
                    selected: applications.filter(app => app.status === Application_1.ApplicationStatus.SELECTED).length,
                    rejected: applications.filter(app => app.status === Application_1.ApplicationStatus.REJECTED).length,
                    total: applications.length
                };
                // Get counts for each role among selected applications
                const selectedApplications = applications.filter(app => app.status === Application_1.ApplicationStatus.SELECTED);
                const roleCounts = {
                    tutors: selectedApplications.filter(app => app.role === Application_1.ApplicationRole.TUTOR).length,
                    labAssistants: selectedApplications.filter(app => app.role === Application_1.ApplicationRole.LAB_ASSISTANT).length
                };
                // Find most and least selected tutors
                const tutorSelectionMap = new Map();
                // Count selections for each tutor
                applications.forEach(app => {
                    if (app.status === Application_1.ApplicationStatus.SELECTED) {
                        const tutorId = app.tutorId;
                        tutorSelectionMap.set(tutorId, (tutorSelectionMap.get(tutorId) || 0) + 1);
                    }
                });
                // Get tutors who have at least one application
                const tutorsWithApplications = [...new Set(applications.map(app => app.tutorId))];
                // Initialize most and least selected data
                let mostSelectedTutor = null;
                let mostSelectedCount = 0;
                let leastSelectedTutor = null;
                let leastSelectedCount = Number.MAX_SAFE_INTEGER;
                // Find most and least selected tutors
                tutorsWithApplications.forEach(tutorId => {
                    var _a, _b;
                    const selectCount = tutorSelectionMap.get(tutorId) || 0;
                    if (selectCount > mostSelectedCount) {
                        mostSelectedCount = selectCount;
                        mostSelectedTutor = (_a = applications.find(app => app.tutorId === tutorId)) === null || _a === void 0 ? void 0 : _a.tutor;
                    }
                    // Consider only tutors who have at least one application
                    if (applications.some(app => app.tutorId === tutorId)) {
                        if (selectCount < leastSelectedCount) {
                            leastSelectedCount = selectCount;
                            leastSelectedTutor = (_b = applications.find(app => app.tutorId === tutorId)) === null || _b === void 0 ? void 0 : _b.tutor;
                        }
                    }
                });
                // Get tutors with no selections
                const notSelectedTutors = applications
                    .filter(app => app.status !== Application_1.ApplicationStatus.SELECTED)
                    .map(app => app.tutor)
                    .filter((tutor, index, self) => self.findIndex(t => t.id === tutor.id) === index);
                return response.json({
                    statusCounts,
                    roleCounts,
                    mostSelected: {
                        tutor: mostSelectedTutor,
                        count: mostSelectedCount
                    },
                    leastSelected: {
                        tutor: leastSelectedTutor,
                        count: leastSelectedCount === Number.MAX_SAFE_INTEGER ? 0 : leastSelectedCount
                    },
                    notSelected: notSelectedTutors
                });
            }
            catch (error) {
                console.error("Error getting application statistics:", error);
                return response.status(500).json({
                    message: "Error getting application statistics",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=ApplicationController.js.map