"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  type User {
    id: ID!
    name: String!
    email: String!
    type: UserType!
    profileBio: String
    isBlocked: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Course {
    id: ID!
    courseCode: String!
    name: String!
    description: String
    semester: String!
    year: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type LecturerCourse {
    id: ID!
    lecturer: User!
    course: Course!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Application {
    id: ID!
    tutor: User!
    course: Course!
    role: ApplicationRole!
    availability: AvailabilityType!
    relevantSkills: [String]
    academicCredentials: String!
    relevantExperience: [String]
    status: ApplicationStatus!
    ranking: Int
    comments: String
    createdAt: String!
    updatedAt: String!
  }

  enum UserType {
    tutor
    lecturer
    admin
  }

  enum ApplicationRole {
    tutor
    lab_assistant
  }

  enum AvailabilityType {
    full_time
    part_time
  }

  enum ApplicationStatus {
    pending
    selected
    rejected
  }

  type Query {
    # Admin queries
    getCandidates: [User!]!
    getCourses(semester: String, year: Int): [Course!]!
    getLecturers: [User!]!
    getLecturerCourses(lecturerId: ID!): [LecturerCourse!]!
    getCandidatesByCourse(courseId: ID!): [Application!]!
    getCandidatesWithMultipleCourses: [User!]!
    getCandidatesWithoutCourses: [User!]!
  }

  type Mutation {
    # Admin authentication
    adminLogin(email: String!, password: String!): String!

    # Course management
    createCourse(input: CourseInput!): Course!
    updateCourse(id: ID!, input: CourseInput!): Course! 
    deleteCourse(id: ID!): Boolean!

    # Lecturer assignment
    assignLecturerToCourse(lecturerId: ID!, courseId: ID!): LecturerCourse!
    removeLecturerFromCourse(lecturerId: ID!, courseId: ID!): Boolean!

    # User management
    blockUser(id: ID!): User!
    unblockUser(id: ID!): User!
    markCandidateUnavailable(id: ID!, reason: String): User!
  }

  type Subscription {
    candidateAvailabilityChanged: CandidateAvailabilityUpdate!
  }

  type CandidateAvailabilityUpdate {
    tutorId: ID!
    tutorName: String!
    isAvailable: Boolean!
    message: String!
  }

  input CourseInput {
    courseCode: String!
    name: String!
    description: String
    semester: String!
    year: Int!
    isActive: Boolean
  }
`;
//# sourceMappingURL=schema.js.map