import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Layout from '../components/Layout';

interface Lecturer {
  id: string;
  name: string;
  email: string;
  type: string;
}

interface Course {
  id: string;
  courseCode: string;
  name: string;
  semester: string;
  year: number;
}

interface LecturerCourse {
  id: string;
  lecturer: Lecturer;
  course: Course;
}

interface GetLecturersResponse {
  getLecturers: Lecturer[];
}

interface GetCoursesResponse {
  getCourses: Course[];
}

interface GetLecturerCoursesResponse {
  getLecturerCourses: LecturerCourse[];
}

interface AssignLecturerToCourseResponse {
  assignLecturerToCourse: LecturerCourse;
}

interface RemoveLecturerFromCourseResponse {
  removeLecturerFromCourse: boolean;
}

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

const GET_COURSES = gql`
  query GetCourses {
    getCourses {
      id
      courseCode
      name
      semester
      year
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
        courseCode
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

export default function Lecturers() {
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const { data: lecturersData, loading: lecturersLoading, error: lecturersError } = useQuery<GetLecturersResponse>(GET_LECTURERS);
  const { data: coursesData } = useQuery<GetCoursesResponse>(GET_COURSES);
  const { data: lecturerCoursesData, refetch: refetchLecturerCourses } = useQuery<GetLecturerCoursesResponse>(
    GET_LECTURER_COURSES,
    {
      variables: { lecturerId: selectedLecturer?.id || '' },
      skip: !selectedLecturer,
    }
  );

  const [assignLecturerToCourse] = useMutation<AssignLecturerToCourseResponse>(ASSIGN_LECTURER_TO_COURSE);
  const [removeLecturerFromCourse] = useMutation<RemoveLecturerFromCourseResponse>(REMOVE_LECTURER_FROM_COURSE);

  const handleAssignCourse = async () => {
    if (!selectedLecturer || !selectedCourseId) return;

    try {
      await assignLecturerToCourse({
        variables: {
          lecturerId: selectedLecturer.id,
          courseId: selectedCourseId,
        },
      });
      setIsAssignModalOpen(false);
      setSelectedCourseId('');
      refetchLecturerCourses();
    } catch (error) {
      console.error('Error assigning course:', error);
      alert('Error assigning course. This assignment may already exist.');
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!selectedLecturer) return;

    if (window.confirm('Are you sure you want to remove this course assignment?')) {
      try {
        await removeLecturerFromCourse({
          variables: {
            lecturerId: selectedLecturer.id,
            courseId,
          },
        });
        refetchLecturerCourses();
      } catch (error) {
        console.error('Error removing course:', error);
      }
    }
  };

  if (lecturersLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (lecturersError) return <div className="p-4"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Error: {lecturersError.message}</div></div>;

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Lecturer Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage lecturer assignments to courses for the semester.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lecturers List */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
              <h2 className="text-lg font-semibold text-white">Lecturers</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {lecturersData?.getLecturers.map((lecturer: Lecturer) => (
                  <div
                    key={lecturer.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedLecturer?.id === lecturer.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedLecturer(lecturer)}
                  >
                    <h3 className="font-semibold text-gray-900">{lecturer.name}</h3>
                    <p className="text-sm text-gray-600">{lecturer.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Assignments */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                {selectedLecturer ? `${selectedLecturer.name}'s Courses` : 'Course Assignments'}
              </h2>
              {selectedLecturer && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Assign Course
                </button>
              )}
            </div>
            <div className="p-6">
              {selectedLecturer ? (
                lecturerCoursesData?.getLecturerCourses && lecturerCoursesData.getLecturerCourses.length > 0 ? (
                  <div className="space-y-4">
                    {lecturerCoursesData.getLecturerCourses.map((assignment: LecturerCourse) => (
                      <div
                        key={assignment.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {assignment.course.courseCode} - {assignment.course.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {assignment.course.semester} {assignment.course.year}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveCourse(assignment.course.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">📚</div>
                    <p className="text-gray-500">No courses assigned yet</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">👆</div>
                  <p className="text-gray-500">Select a lecturer to view their course assignments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Course Modal */}
      {isAssignModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-50"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Assign Course to {selectedLecturer?.name}
                    </h3>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    id="course"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a course</option>
                    {coursesData?.getCourses
                      .filter((course: Course) => 
                        !lecturerCoursesData?.getLecturerCourses.some((lc: LecturerCourse) => lc.course.id === course.id)
                      )
                      .map((course: Course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseCode} - {course.name} ({course.semester} {course.year})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse space-x-3 space-x-reverse">
                <button
                  onClick={handleAssignCourse}
                  disabled={!selectedCourseId}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Course
                </button>
                <button
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedCourseId('');
                  }}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}