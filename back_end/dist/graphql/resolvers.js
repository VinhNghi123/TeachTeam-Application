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
exports.resolvers = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const Course_1 = require("../entity/Course");
const LecturerCourse_1 = require("../entity/LecturerCourse");
const Application_1 = require("../entity/Application");
const typeorm_1 = require("typeorm");
// PubSub instance for GraphQL subscriptions
const pubsub = new graphql_subscriptions_1.PubSub();
// Constants for subscription topics
const CANDIDATE_AVAILABILITY_CHANGED = 'CANDIDATE_AVAILABILITY_CHANGED';
// Helper function to publish candidate availability changes
const publishCandidateAvailabilityChange = (update) => {
    console.log('Publishing candidate availability change:', update);
    pubsub.publish(CANDIDATE_AVAILABILITY_CHANGED, {
        candidateAvailabilityChanged: {
            tutorId: update.tutorId,
            tutorName: update.tutorName,
            isAvailable: update.isAvailable,
            message: update.message,
            timestamp: update.timestamp,
            reason: update.reason
        }
    });
};
// Helper function to check if a user has active applications
const checkUserHasApplications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
    const applications = yield applicationRepository.find({
        where: { tutorId: userId }
    });
    return applications.length > 0;
});
// Helper function to get user's assigned lecturers (for targeted notifications)
const getUserAssignedLecturers = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
    const lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
    // Get courses the user applied to
    const applications = yield applicationRepository.find({
        where: { tutorId: userId },
        select: ['courseId']
    });
    const courseIds = applications.map(app => app.courseId);
    if (courseIds.length === 0)
        return [];
    // Get lecturers assigned to those courses
    const lecturerCourses = yield lecturerCourseRepository.find({
        where: { courseId: (0, typeorm_1.In)(courseIds), isActive: true },
        select: ['lecturerId']
    });
    return [...new Set(lecturerCourses.map(lc => lc.lecturerId))];
});
exports.resolvers = {
    Query: {
        // Admin authentication
        getCandidates: () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            return userRepository.find({
                where: { type: User_1.UserType.TUTOR },
                order: { name: 'ASC' }
            });
        }),
        getCourses: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { semester, year }) {
            const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
            const query = courseRepository.createQueryBuilder('course');
            if (semester) {
                query.andWhere('course.semester = :semester', { semester });
            }
            if (year) {
                query.andWhere('course.year = :year', { year });
            }
            return query.orderBy('course.courseCode', 'ASC').getMany();
        }),
        getLecturers: () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            return userRepository.find({
                where: { type: User_1.UserType.LECTURER },
                order: { name: 'ASC' }
            });
        }),
        getLecturerCourses: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { lecturerId }) {
            const lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
            return lecturerCourseRepository.find({
                where: {
                    lecturerId: parseInt(lecturerId),
                    isActive: true
                },
                relations: ['lecturer', 'course'],
                order: { course: { courseCode: 'ASC' } }
            });
        }),
        getCandidatesByCourse: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { courseId }) {
            const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
            const applications = yield applicationRepository.find({
                where: {
                    courseId: parseInt(courseId),
                    status: Application_1.ApplicationStatus.SELECTED
                },
                relations: ['tutor', 'course'],
                order: { tutor: { name: 'ASC' } }
            });
            // Map availability for GraphQL enum compatibility and add blocked status
            return applications.map(app => (Object.assign(Object.assign({}, app), { availability: app.availability === 'full-time' ? 'full_time'
                    : app.availability === 'part-time' ? 'part_time'
                        : app.availability, role: app.role === 'lab-assistant' ? 'lab_assistant'
                    : app.role, isUnavailable: app.tutor.isBlocked // Add unavailability indicator
             })));
        }),
        getCandidatesWithMultipleCourses: () => __awaiter(void 0, void 0, void 0, function* () {
            const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
            // Get tutors who have been selected for more than 3 courses
            const result = yield applicationRepository
                .createQueryBuilder('application')
                .select('application.tutorId', 'tutorId')
                .addSelect('COUNT(DISTINCT application.courseId)', 'courseCount')
                .where('application.status = :status', { status: 'selected' })
                .groupBy('application.tutorId')
                .having('courseCount > 3')
                .getRawMany();
            if (result.length === 0) {
                return [];
            }
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const tutorIds = result.map(r => r.tutorId);
            return userRepository.find({
                where: {
                    id: (0, typeorm_1.In)(tutorIds),
                    type: User_1.UserType.TUTOR
                },
                order: { name: 'ASC' }
            });
        }),
        getCandidatesWithoutCourses: () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
            // Get all tutors who have been selected for at least one course
            const selectedTutors = yield applicationRepository
                .createQueryBuilder('application')
                .select('DISTINCT application.tutorId', 'tutorId')
                .where('application.status = :status', { status: 'selected' })
                .getRawMany();
            const selectedTutorIds = selectedTutors.map(t => t.tutorId);
            // Get all tutors who have applications but were never selected
            const allApplicants = yield applicationRepository
                .createQueryBuilder('application')
                .select('DISTINCT application.tutorId', 'tutorId')
                .getRawMany();
            const allApplicantIds = allApplicants.map(t => t.tutorId);
            // Find tutors who applied but were never selected
            const unselectedTutorIds = allApplicantIds.filter(id => !selectedTutorIds.includes(id));
            if (unselectedTutorIds.length === 0) {
                return [];
            }
            return userRepository.find({
                where: {
                    id: (0, typeorm_1.In)(unselectedTutorIds),
                    type: User_1.UserType.TUTOR
                },
                order: { name: 'ASC' }
            });
        })
    },
    Mutation: {
        // Admin login
        adminLogin: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { email, password }) {
            // Simple admin authentication - in production, use proper password hashing
            if (email === 'admin' && password === 'admin') {
                // Return a simple token
                return 'admin-auth-token-' + Date.now();
            }
            throw new Error('Invalid admin credentials');
        }),
        // Course management
        createCourse: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { input }) {
            var _b;
            const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
            // Check if course code already exists
            const existingCourse = yield courseRepository.findOne({
                where: { courseCode: input.courseCode }
            });
            if (existingCourse) {
                throw new Error('Course code already exists');
            }
            const course = courseRepository.create({
                courseCode: input.courseCode,
                name: input.name,
                description: input.description,
                semester: input.semester,
                year: input.year,
                isActive: (_b = input.isActive) !== null && _b !== void 0 ? _b : true
            });
            const savedCourse = yield courseRepository.save(course);
            console.log('Course created:', savedCourse.courseCode);
            return savedCourse;
        }),
        updateCourse: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id, input }) {
            var _b;
            const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
            const courseId = parseInt(id);
            const course = yield courseRepository.findOne({ where: { id: courseId } });
            if (!course) {
                throw new Error('Course not found');
            }
            // Check if course code is being changed and if it already exists
            if (input.courseCode !== course.courseCode) {
                const existingCourse = yield courseRepository.findOne({
                    where: { courseCode: input.courseCode }
                });
                if (existingCourse) {
                    throw new Error('Course code already exists');
                }
            }
            yield courseRepository.update(courseId, {
                courseCode: input.courseCode,
                name: input.name,
                description: input.description,
                semester: input.semester,
                year: input.year,
                isActive: (_b = input.isActive) !== null && _b !== void 0 ? _b : course.isActive
            });
            const updatedCourse = yield courseRepository.findOne({ where: { id: courseId } });
            console.log('Course updated:', updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.courseCode);
            return updatedCourse;
        }),
        deleteCourse: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
            const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
            const lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
            const courseId = parseInt(id);
            // Check if course has applications
            const applications = yield applicationRepository.find({
                where: { courseId }
            });
            if (applications.length > 0) {
                throw new Error('Cannot delete course with existing applications');
            }
            // Remove lecturer assignments
            yield lecturerCourseRepository.delete({ courseId });
            // Delete the course
            const result = yield courseRepository.delete(courseId);
            const success = result.affected ? result.affected > 0 : false;
            console.log('Course deleted:', courseId, 'Success:', success);
            return success;
        }),
        // Lecturer assignment
        assignLecturerToCourse: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { lecturerId, courseId }) {
            const lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
            const lecturerIdInt = parseInt(lecturerId);
            const courseIdInt = parseInt(courseId);
            // Verify lecturer exists
            const lecturer = yield userRepository.findOne({
                where: { id: lecturerIdInt, type: User_1.UserType.LECTURER }
            });
            if (!lecturer) {
                throw new Error('Lecturer not found');
            }
            // Verify course exists
            const course = yield courseRepository.findOne({
                where: { id: courseIdInt }
            });
            if (!course) {
                throw new Error('Course not found');
            }
            // Check if assignment already exists
            const existingAssignment = yield lecturerCourseRepository.findOne({
                where: { lecturerId: lecturerIdInt, courseId: courseIdInt }
            });
            if (existingAssignment) {
                if (existingAssignment.isActive) {
                    throw new Error('Lecturer is already assigned to this course');
                }
                else {
                    // Reactivate existing assignment
                    existingAssignment.isActive = true;
                    const savedAssignment = yield lecturerCourseRepository.save(existingAssignment);
                    console.log('Lecturer-course assignment reactivated:', lecturer.name, '->', course.courseCode);
                    return lecturerCourseRepository.findOne({
                        where: { id: savedAssignment.id },
                        relations: ['lecturer', 'course']
                    });
                }
            }
            const lecturerCourse = lecturerCourseRepository.create({
                lecturerId: lecturerIdInt,
                courseId: courseIdInt,
                isActive: true
            });
            const savedAssignment = yield lecturerCourseRepository.save(lecturerCourse);
            console.log('Lecturer assigned to course:', lecturer.name, '->', course.courseCode);
            // Load relations for response
            return lecturerCourseRepository.findOne({
                where: { id: savedAssignment.id },
                relations: ['lecturer', 'course']
            });
        }),
        removeLecturerFromCourse: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { lecturerId, courseId }) {
            const lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
            const result = yield lecturerCourseRepository.delete({
                lecturerId: parseInt(lecturerId),
                courseId: parseInt(courseId)
            });
            const success = result.affected ? result.affected > 0 : false;
            console.log('Lecturer removed from course:', lecturerId, '->', courseId, 'Success:', success);
            return success;
        }),
        // Enhanced User management with real-time notifications
        blockUser: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const userId = parseInt(id);
            // Get user before blocking
            const user = yield userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            // Check if user already blocked
            if (user.isBlocked) {
                return user;
            }
            // Check if user has applications to determine if notification is needed
            const hasApplications = yield checkUserHasApplications(userId);
            // Block the user
            yield userRepository.update(userId, { isBlocked: true });
            const blockedUser = yield userRepository.findOne({ where: { id: userId } });
            if (blockedUser && hasApplications) {
                // Get assigned lecturers for targeted notifications
                const assignedLecturers = yield getUserAssignedLecturers(userId);
                // Publish availability change for real-time updates
                const availabilityUpdate = {
                    tutorId: blockedUser.id.toString(),
                    tutorName: blockedUser.name,
                    isAvailable: false,
                    message: `${blockedUser.name} has been blocked by administration and is no longer available for hiring`,
                    timestamp: new Date().toISOString(),
                    reason: 'blocked'
                };
                publishCandidateAvailabilityChange(availabilityUpdate);
                console.log('User blocked and availability notification sent:', {
                    userId: blockedUser.id,
                    userName: blockedUser.name,
                    assignedLecturers: assignedLecturers.length,
                    hasApplications
                });
            }
            return blockedUser;
        }),
        unblockUser: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const userId = parseInt(id);
            // Get user before unblocking
            const user = yield userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            // Check if user was actually blocked
            if (!user.isBlocked) {
                return user;
            }
            // Check if user has applications
            const hasApplications = yield checkUserHasApplications(userId);
            // Unblock the user
            yield userRepository.update(userId, { isBlocked: false });
            const unblockedUser = yield userRepository.findOne({ where: { id: userId } });
            if (unblockedUser && hasApplications) {
                // Get assigned lecturers for targeted notifications
                const assignedLecturers = yield getUserAssignedLecturers(userId);
                // Publish availability change for real-time updates
                const availabilityUpdate = {
                    tutorId: unblockedUser.id.toString(),
                    tutorName: unblockedUser.name,
                    isAvailable: true,
                    message: `${unblockedUser.name} has been unblocked and is now available for hiring`,
                    timestamp: new Date().toISOString(),
                    reason: 'unblocked'
                };
                publishCandidateAvailabilityChange(availabilityUpdate);
                console.log('User unblocked and availability notification sent:', {
                    userId: unblockedUser.id,
                    userName: unblockedUser.name,
                    assignedLecturers: assignedLecturers.length,
                    hasApplications
                });
            }
            return unblockedUser;
        }),
        // Manual candidate unavailability (for testing/admin use)
        markCandidateUnavailable: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id, reason }) {
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const userId = parseInt(id);
            const user = yield userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            const hasApplications = yield checkUserHasApplications(userId);
            if (hasApplications) {
                const availabilityUpdate = {
                    tutorId: user.id.toString(),
                    tutorName: user.name,
                    isAvailable: false,
                    message: reason || `${user.name} has been marked as temporarily unavailable`,
                    timestamp: new Date().toISOString(),
                    reason: 'manual_unavailable'
                };
                publishCandidateAvailabilityChange(availabilityUpdate);
                console.log('Candidate manually marked unavailable:', {
                    userId: user.id,
                    userName: user.name,
                    reason
                });
            }
            return user;
        })
    },
    Subscription: {
        candidateAvailabilityChanged: {
            subscribe: () => {
                console.log('New subscription to candidate availability changes');
                return pubsub.asyncIterator([CANDIDATE_AVAILABILITY_CHANGED]);
            }
        }
    }
};
//# sourceMappingURL=resolvers.js.map