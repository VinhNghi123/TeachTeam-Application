import { PubSub } from 'graphql-subscriptions';
import { AppDataSource } from '../data-source';
import { User, UserType } from '../entity/User';
import { Course } from '../entity/Course';
import { LecturerCourse } from '../entity/LecturerCourse';
import { Application, ApplicationStatus } from '../entity/Application';
import { Not, In } from 'typeorm';

interface LoginInput {
  email: string;
  password: string;
}

interface CourseFilter {
  semester?: string;
  year?: number;
}

interface CourseInput {
  courseCode: string;
  name: string;
  semester: string;
  year: number;
  description?: string;
  isActive?: boolean;
}

interface CandidateAvailabilityUpdate {
  tutorId: string;
  tutorName: string;
  isAvailable: boolean;
  message: string;
  timestamp: string;
  reason: 'blocked' | 'unblocked' | 'system_unavailable' | 'manual_unavailable';
}

// PubSub instance for GraphQL subscriptions
const pubsub = new PubSub();

// Constants for subscription topics
const CANDIDATE_AVAILABILITY_CHANGED = 'CANDIDATE_AVAILABILITY_CHANGED';

// Helper function to publish candidate availability changes
const publishCandidateAvailabilityChange = (update: CandidateAvailabilityUpdate) => {
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
const checkUserHasApplications = async (userId: number): Promise<boolean> => {
  const applicationRepository = AppDataSource.getRepository(Application);
  const applications = await applicationRepository.find({
    where: { tutorId: userId }
  });
  return applications.length > 0;
};

// Helper function to get user's assigned lecturers (for targeted notifications)
const getUserAssignedLecturers = async (userId: number): Promise<number[]> => {
  const applicationRepository = AppDataSource.getRepository(Application);
  const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
  
  // Get courses the user applied to
  const applications = await applicationRepository.find({
    where: { tutorId: userId },
    select: ['courseId']
  });
  
  const courseIds = applications.map(app => app.courseId);
  
  if (courseIds.length === 0) return [];
  
  // Get lecturers assigned to those courses
  const lecturerCourses = await lecturerCourseRepository.find({
    where: { courseId: In(courseIds), isActive: true },
    select: ['lecturerId']
  });
  
  return [...new Set(lecturerCourses.map(lc => lc.lecturerId))];
};

export const resolvers = {
  Query: {
    // Admin authentication
    getCandidates: async () => {
      const userRepository = AppDataSource.getRepository(User);
      return userRepository.find({
        where: { type: UserType.TUTOR },
        order: { name: 'ASC' }
      });
    },

    getCourses: async (_: unknown, { semester, year }: CourseFilter) => {
      const courseRepository = AppDataSource.getRepository(Course);
      const query = courseRepository.createQueryBuilder('course');

      if (semester) {
        query.andWhere('course.semester = :semester', { semester });
      }
      if (year) {
        query.andWhere('course.year = :year', { year });
      }

      return query.orderBy('course.courseCode', 'ASC').getMany();
    },

    getLecturers: async () => {
      const userRepository = AppDataSource.getRepository(User);
      return userRepository.find({
        where: { type: UserType.LECTURER },
        order: { name: 'ASC' }
      });
    },

    getLecturerCourses: async (_: unknown, { lecturerId }: { lecturerId: string }) => {
      const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
      return lecturerCourseRepository.find({
        where: { 
          lecturerId: parseInt(lecturerId),
          isActive: true 
        },
        relations: ['lecturer', 'course'],
        order: { course: { courseCode: 'ASC' } }
      });
    },

    getCandidatesByCourse: async (_: unknown, { courseId }: { courseId: string }) => {
      const applicationRepository = AppDataSource.getRepository(Application);
      const applications = await applicationRepository.find({
        where: { 
          courseId: parseInt(courseId),
          status: ApplicationStatus.SELECTED
        },
        relations: ['tutor', 'course'],
        order: { tutor: { name: 'ASC' } }
      });
      
      // Map availability for GraphQL enum compatibility and add blocked status
      return applications.map(app => ({
        ...app,
        availability: app.availability === 'full-time' ? 'full_time'
          : app.availability === 'part-time' ? 'part_time'
          : app.availability,
        role: app.role === 'lab-assistant' ? 'lab_assistant'
          : app.role,
        isUnavailable: app.tutor.isBlocked // Add unavailability indicator
      }));
    },

    getCandidatesWithMultipleCourses: async () => {
      const applicationRepository = AppDataSource.getRepository(Application);
      
      // Get tutors who have been selected for more than 3 courses
      const result = await applicationRepository
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

      const userRepository = AppDataSource.getRepository(User);
      const tutorIds = result.map(r => r.tutorId);
      
      return userRepository.find({
        where: { 
          id: In(tutorIds),
          type: UserType.TUTOR 
        },
        order: { name: 'ASC' }
      });
    },

    getCandidatesWithoutCourses: async () => {
      const userRepository = AppDataSource.getRepository(User);
      const applicationRepository = AppDataSource.getRepository(Application);

      // Get all tutors who have been selected for at least one course
      const selectedTutors = await applicationRepository
        .createQueryBuilder('application')
        .select('DISTINCT application.tutorId', 'tutorId')
        .where('application.status = :status', { status: 'selected' })
        .getRawMany();

      const selectedTutorIds = selectedTutors.map(t => t.tutorId);

      // Get all tutors who have applications but were never selected
      const allApplicants = await applicationRepository
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
          id: In(unselectedTutorIds),
          type: UserType.TUTOR
        },
        order: { name: 'ASC' }
      });
    }
  },

  Mutation: {
    // Admin login
    adminLogin: async (_: unknown, { email, password }: LoginInput) => {
      // Simple admin authentication - in production, use proper password hashing
      if (email === 'admin' && password === 'admin') {
        // Return a simple token
        return 'admin-auth-token-' + Date.now();
      }
      throw new Error('Invalid admin credentials');
    },

    // Course management
    createCourse: async (_: unknown, { input }: { input: CourseInput }) => {
      const courseRepository = AppDataSource.getRepository(Course);
      
      // Check if course code already exists
      const existingCourse = await courseRepository.findOne({
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
        isActive: input.isActive ?? true
      });
      
      const savedCourse = await courseRepository.save(course);
      
      console.log('Course created:', savedCourse.courseCode);
      return savedCourse;
    },

    updateCourse: async (_: unknown, { id, input }: { id: string, input: CourseInput }) => {
      const courseRepository = AppDataSource.getRepository(Course);
      const courseId = parseInt(id);
      
      const course = await courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if course code is being changed and if it already exists
      if (input.courseCode !== course.courseCode) {
        const existingCourse = await courseRepository.findOne({
          where: { courseCode: input.courseCode }
        });
        
        if (existingCourse) {
          throw new Error('Course code already exists');
        }
      }

      await courseRepository.update(courseId, {
        courseCode: input.courseCode,
        name: input.name,
        description: input.description,
        semester: input.semester,
        year: input.year,
        isActive: input.isActive ?? course.isActive
      });
      
      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } });
      console.log('Course updated:', updatedCourse?.courseCode);
      return updatedCourse;
    },

    deleteCourse: async (_: unknown, { id }: { id: string }) => {
      const courseRepository = AppDataSource.getRepository(Course);
      const applicationRepository = AppDataSource.getRepository(Application);
      const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
      
      const courseId = parseInt(id);
      
      // Check if course has applications
      const applications = await applicationRepository.find({
        where: { courseId }
      });
      
      if (applications.length > 0) {
        throw new Error('Cannot delete course with existing applications');
      }
      
      // Remove lecturer assignments
      await lecturerCourseRepository.delete({ courseId });
      
      // Delete the course
      const result = await courseRepository.delete(courseId);
      const success = result.affected ? result.affected > 0 : false;
      
      console.log('Course deleted:', courseId, 'Success:', success);
      return success;
    },

    // Lecturer assignment
    assignLecturerToCourse: async (_: unknown, { lecturerId, courseId }: { lecturerId: string, courseId: string }) => {
      const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
      const userRepository = AppDataSource.getRepository(User);
      const courseRepository = AppDataSource.getRepository(Course);
      
      const lecturerIdInt = parseInt(lecturerId);
      const courseIdInt = parseInt(courseId);
      
      // Verify lecturer exists
      const lecturer = await userRepository.findOne({
        where: { id: lecturerIdInt, type: UserType.LECTURER }
      });
      if (!lecturer) {
        throw new Error('Lecturer not found');
      }
      
      // Verify course exists
      const course = await courseRepository.findOne({
        where: { id: courseIdInt }
      });
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Check if assignment already exists
      const existingAssignment = await lecturerCourseRepository.findOne({
        where: { lecturerId: lecturerIdInt, courseId: courseIdInt }
      });
      
      if (existingAssignment) {
        if (existingAssignment.isActive) {
          throw new Error('Lecturer is already assigned to this course');
        } else {
          // Reactivate existing assignment
          existingAssignment.isActive = true;
          const savedAssignment = await lecturerCourseRepository.save(existingAssignment);
          
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
      
      const savedAssignment = await lecturerCourseRepository.save(lecturerCourse);
      
      console.log('Lecturer assigned to course:', lecturer.name, '->', course.courseCode);
      
      // Load relations for response
      return lecturerCourseRepository.findOne({
        where: { id: savedAssignment.id },
        relations: ['lecturer', 'course']
      });
    },

    removeLecturerFromCourse: async (_: unknown, { lecturerId, courseId }: { lecturerId: string, courseId: string }) => {
      const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
      const result = await lecturerCourseRepository.delete({
        lecturerId: parseInt(lecturerId),
        courseId: parseInt(courseId)
      });
      
      const success = result.affected ? result.affected > 0 : false;
      console.log('Lecturer removed from course:', lecturerId, '->', courseId, 'Success:', success);
      return success;
    },

    // Enhanced User management with real-time notifications
    blockUser: async (_: unknown, { id }: { id: string }) => {
      const userRepository = AppDataSource.getRepository(User);
      const userId = parseInt(id);
      
      // Get user before blocking
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user already blocked
      if (user.isBlocked) {
        return user;
      }
      
      // Check if user has applications to determine if notification is needed
      const hasApplications = await checkUserHasApplications(userId);
      
      // Block the user
      await userRepository.update(userId, { isBlocked: true });
      const blockedUser = await userRepository.findOne({ where: { id: userId } });
      
      if (blockedUser && hasApplications) {
        // Get assigned lecturers for targeted notifications
        const assignedLecturers = await getUserAssignedLecturers(userId);
        
        // Publish availability change for real-time updates
        const availabilityUpdate: CandidateAvailabilityUpdate = {
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
    },

    unblockUser: async (_: unknown, { id }: { id: string }) => {
      const userRepository = AppDataSource.getRepository(User);
      const userId = parseInt(id);
      
      // Get user before unblocking
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user was actually blocked
      if (!user.isBlocked) {
        return user;
      }
      
      // Check if user has applications
      const hasApplications = await checkUserHasApplications(userId);
      
      // Unblock the user
      await userRepository.update(userId, { isBlocked: false });
      const unblockedUser = await userRepository.findOne({ where: { id: userId } });
      
      if (unblockedUser && hasApplications) {
        // Get assigned lecturers for targeted notifications
        const assignedLecturers = await getUserAssignedLecturers(userId);
        
        // Publish availability change for real-time updates
        const availabilityUpdate: CandidateAvailabilityUpdate = {
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
    },

    // Manual candidate unavailability (for testing/admin use)
    markCandidateUnavailable: async (_: unknown, { id, reason }: { id: string, reason?: string }) => {
      const userRepository = AppDataSource.getRepository(User);
      const userId = parseInt(id);
      
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      
      const hasApplications = await checkUserHasApplications(userId);
      
      if (hasApplications) {
        const availabilityUpdate: CandidateAvailabilityUpdate = {
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
    }
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