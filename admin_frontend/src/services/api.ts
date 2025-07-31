import { gql } from "@apollo/client";
import { client } from "./apollo-client";

// Type definitions
interface CourseInput {
  courseCode: string;
  name: string;
  description: string;
  semester: string;
  year: number;
  isActive: boolean;
}

interface CandidateAvailabilityData {
  tutorId: string;
  tutorName: string;
  isAvailable: boolean;
  message: string;
}

// GraphQL Queries
const ADMIN_LOGIN = gql`
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password)
  }
`;

const GET_COURSES = gql`
  query GetCourses($semester: String, $year: Int) {
    getCourses(semester: $semester, year: $year) {
      id
      courseCode
      name
      description
      semester
      year
      isActive
    }
  }
`;

const GET_LECTURERS = gql`
  query GetLecturers {
    getLecturers {
      id
      name
      email
      type
    }
  }
`;

const GET_LECTURER_COURSES = gql`
  query GetLecturerCourses($lecturerId: ID!) {
    getLecturerCourses(lecturerId: $lecturerId) {
      id
      lecturer {
        id
        name
        email
      }
      course {
        id
        courseCode
        name
        semester
        year
      }
    }
  }
`;

const GET_CANDIDATES_BY_COURSE = gql`
  query GetCandidatesByCourse($courseId: ID!) {
    getCandidatesByCourse(courseId: $courseId) {
      id
      tutor {
        id
        name
        email
        isBlocked
      }
      course {
        id
        courseCode
        name
      }
      status
      role
    }
  }
`;

const GET_CANDIDATES_WITH_MULTIPLE_COURSES = gql`
  query GetCandidatesWithMultipleCourses {
    getCandidatesWithMultipleCourses {
      id
      name
      email
      isBlocked
    }
  }
`;

const GET_CANDIDATES_WITHOUT_COURSES = gql`
  query GetCandidatesWithoutCourses {
    getCandidatesWithoutCourses {
      id
      name
      email
      isBlocked
    }
  }
`;

// GraphQL Mutations
const CREATE_COURSE = gql`
  mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
      id
      courseCode
      name
      description
      semester
      year
      isActive
    }
  }
`;

const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: CourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      courseCode
      name
      description
      semester
      year
      isActive
    }
  }
`;

const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

const ASSIGN_LECTURER_TO_COURSE = gql`
  mutation AssignLecturerToCourse($lecturerId: ID!, $courseId: ID!) {
    assignLecturerToCourse(lecturerId: $lecturerId, courseId: $courseId) {
      id
      lecturer {
        id
        name
      }
      course {
        id
        name
      }
    }
  }
`;

const REMOVE_LECTURER_FROM_COURSE = gql`
  mutation RemoveLecturerFromCourse($lecturerId: ID!, $courseId: ID!) {
    removeLecturerFromCourse(lecturerId: $lecturerId, courseId: $courseId)
  }
`;

const BLOCK_USER = gql`
  mutation BlockUser($id: ID!) {
    blockUser(id: $id) {
      id
      name
      email
      isBlocked
    }
  }
`;

const UNBLOCK_USER = gql`
  mutation UnblockUser($id: ID!) {
    unblockUser(id: $id) {
      id
      name
      email
      isBlocked
    }
  }
`;

// GraphQL Subscription
const CANDIDATE_AVAILABILITY_CHANGED = gql`
  subscription OnCandidateAvailabilityChanged {
    candidateAvailabilityChanged {
      tutorId
      tutorName
      isAvailable
      message
    }
  }
`;

// Service methods
export const apiService = {
  // Authentication
  login: async (email: string, password: string) => {
    const { data } = await client.mutate({
      mutation: ADMIN_LOGIN,
      variables: { email, password },
    });
    return data.adminLogin;
  },

  // Course Management
  getCourses: async (semester?: string, year?: number) => {
    const { data } = await client.query({
      query: GET_COURSES,
      variables: { semester, year },
    });
    return data.getCourses;
  },

  createCourse: async (courseInput: CourseInput) => {
    const { data } = await client.mutate({
      mutation: CREATE_COURSE,
      variables: { input: courseInput },
    });
    return data.createCourse;
  },

  updateCourse: async (id: string, courseInput: CourseInput) => {
    const { data } = await client.mutate({
      mutation: UPDATE_COURSE,
      variables: { id, input: courseInput },
    });
    return data.updateCourse;
  },

  deleteCourse: async (id: string) => {
    const { data } = await client.mutate({
      mutation: DELETE_COURSE,
      variables: { id },
    });
    return data.deleteCourse;
  },

  // Lecturer Management
  getLecturers: async () => {
    const { data } = await client.query({
      query: GET_LECTURERS,
    });
    return data.getLecturers;
  },

  getLecturerCourses: async (lecturerId: string) => {
    const { data } = await client.query({
      query: GET_LECTURER_COURSES,
      variables: { lecturerId },
    });
    return data.getLecturerCourses;
  },

  assignLecturerToCourse: async (lecturerId: string, courseId: string) => {
    const { data } = await client.mutate({
      mutation: ASSIGN_LECTURER_TO_COURSE,
      variables: { lecturerId, courseId },
    });
    return data.assignLecturerToCourse;
  },

  removeLecturerFromCourse: async (lecturerId: string, courseId: string) => {
    const { data } = await client.mutate({
      mutation: REMOVE_LECTURER_FROM_COURSE,
      variables: { lecturerId, courseId },
    });
    return data.removeLecturerFromCourse;
  },

  // Candidate Management
  getCandidatesByCourse: async (courseId: string) => {
    const { data } = await client.query({
      query: GET_CANDIDATES_BY_COURSE,
      variables: { courseId },
    });
    return data.getCandidatesByCourse;
  },

  getCandidatesWithMultipleCourses: async () => {
    const { data } = await client.query({
      query: GET_CANDIDATES_WITH_MULTIPLE_COURSES,
    });
    return data.getCandidatesWithMultipleCourses;
  },

  getCandidatesWithoutCourses: async () => {
    const { data } = await client.query({
      query: GET_CANDIDATES_WITHOUT_COURSES,
    });
    return data.getCandidatesWithoutCourses;
  },

  blockUser: async (id: string) => {
    const { data } = await client.mutate({
      mutation: BLOCK_USER,
      variables: { id },
    });
    return data.blockUser;
  },

  unblockUser: async (id: string) => {
    const { data } = await client.mutate({
      mutation: UNBLOCK_USER,
      variables: { id },
    });
    return data.unblockUser;
  },

  // Subscription for candidate availability changes
  subscribeToCandidateAvailability: (callback: (data: CandidateAvailabilityData) => void) => {
    return client.subscribe({
      query: CANDIDATE_AVAILABILITY_CHANGED,
    }).subscribe({
      next: ({ data }) => callback(data.candidateAvailabilityChanged),
      error: (error) => console.error('Subscription error:', error),
    });
  },
};
