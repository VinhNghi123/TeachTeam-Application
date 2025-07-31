import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Layout from '../components/Layout';

interface Tutor {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  courseCode: string;
  name: string;
  semester: string;
  year: string;
}

interface CandidateByCourse {
  id: string;
  tutor: Tutor;
  course: Course;
  role: 'tutor' | 'lab_assistant';
  availability: string;
  status: 'selected' | 'pending' | 'rejected';
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

const GET_CANDIDATES_BY_COURSE = gql`
  query GetCandidatesByCourse($courseId: ID!) {
    getCandidatesByCourse(courseId: $courseId) {
      id
      tutor {
        id
        name
        email
      }
      course {
        id
        courseCode
        name
      }
      role
      availability
      status
    }
  }
`;

const GET_CANDIDATES_WITH_MULTIPLE_COURSES = gql`
  query GetCandidatesWithMultipleCourses {
    getCandidatesWithMultipleCourses {
      id
      name
      email
    }
  }
`;

const GET_CANDIDATES_WITHOUT_COURSES = gql`
  query GetCandidatesWithoutCourses {
    getCandidatesWithoutCourses {
      id
      name
      email
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

export default function Reports() {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeTab, setActiveTab] = useState('byCourse');

  const { data: coursesData } = useQuery(GET_COURSES);
  const { data: candidatesByCourseData, loading: loadingByCourse } = useQuery(
    GET_CANDIDATES_BY_COURSE,
    {
      variables: { courseId: selectedCourseId },
      skip: !selectedCourseId || activeTab !== 'byCourse',
    }
  );

  const {
    data: multipleCoursesData,
    loading: loadingMultipleCourses,
  } = useQuery(GET_CANDIDATES_WITH_MULTIPLE_COURSES, {
    skip: activeTab !== 'multipleCourses',
  });

  const {
    data: noCoursesData,
    loading: loadingNoCourses,
  } = useQuery(GET_CANDIDATES_WITHOUT_COURSES, {
    skip: activeTab !== 'noCourses',
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'byCourse':
        return (
          <div>
            <div className="mb-6">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                id="course"
                name="course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="block w-full max-w-lg pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a course</option>
                {coursesData?.getCourses.map((course: Course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.name} ({course.semester} {course.year})
                  </option>
                ))}
              </select>
            </div>

            {loadingByCourse ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : candidatesByCourseData?.getCandidatesByCourse.length > 0 ? (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <h3 className="text-lg font-semibold text-white">
                    Selected Candidates ({candidatesByCourseData.getCandidatesByCourse.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Availability
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {candidatesByCourseData.getCandidatesByCourse.map((application: CandidateByCourse, index: number) => (
                        <tr key={application.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {application.tutor.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{application.tutor.name}</div>
                                <div className="text-sm text-gray-500">{application.tutor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              application.role === 'tutor' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {application.role === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="capitalize">{application.availability.replace('_', '-')}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              application.status === 'selected'
                                ? 'bg-green-100 text-green-800'
                                : application.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedCourseId ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-gray-400 text-4xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Found</h3>
                <p className="text-gray-500">No candidates have been selected for this course yet.</p>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-gray-400 text-4xl mb-4">👆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
                <p className="text-gray-500">Choose a course from the dropdown to view selected candidates.</p>
              </div>
            )}
          </div>
        );

      case 'multipleCourses':
        return (
          <div>
            {loadingMultipleCourses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : multipleCoursesData?.getCandidatesWithMultipleCourses.length > 0 ? (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600">
                  <h3 className="text-lg font-semibold text-white">
                    Candidates Selected for More Than 3 Courses ({multipleCoursesData.getCandidatesWithMultipleCourses.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {multipleCoursesData.getCandidatesWithMultipleCourses.map((candidate: Candidate, index: number) => (
                        <tr key={candidate.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {candidate.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              3+ Courses
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-gray-400 text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Overcommitted Candidates</h3>
                <p className="text-gray-500">No candidates have been selected for more than 3 courses.</p>
              </div>
            )}
          </div>
        );

      case 'noCourses':
        return (
          <div>
            {loadingNoCourses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : noCoursesData?.getCandidatesWithoutCourses.length > 0 ? (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    Candidates Not Selected for Any Courses ({noCoursesData.getCandidatesWithoutCourses.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {noCoursesData.getCandidatesWithoutCourses.map((candidate: Candidate, index: number) => (
                        <tr key={candidate.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {candidate.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Not Selected
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-gray-400 text-4xl mb-4">🎉</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Candidates Selected</h3>
                <p className="text-gray-500">Great! All candidates have been selected for at least one course.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 text-sm text-gray-700">
              View detailed reports about candidates and their course assignments.
            </p>
          </div>
        </div>

        <div className="mt-8">
          {/* Mobile Tab Selector */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="byCourse">Candidates by Course</option>
              <option value="multipleCourses">Candidates with 3+ Courses</option>
              <option value="noCourses">Candidates without Courses</option>
            </select>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('byCourse')}
                  className={`${
                    activeTab === 'byCourse'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                >
                  📚 Candidates by Course
                </button>
                <button
                  onClick={() => setActiveTab('multipleCourses')}
                  className={`${
                    activeTab === 'multipleCourses'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                >
                  🎯 Multiple Courses (3+)
                </button>
                <button
                  onClick={() => setActiveTab('noCourses')}
                  className={`${
                    activeTab === 'noCourses'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                >
                  ❌ No Courses
                </button>
              </nav>
            </div>
          </div>

          <div className="mt-8">
            {renderTabContent()}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {coursesData?.getCourses.length || 0}
                </div>
                <div className="text-sm text-gray-500">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {multipleCoursesData?.getCandidatesWithMultipleCourses.length || 0}
                </div>
                <div className="text-sm text-gray-500">Overcommitted Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {noCoursesData?.getCandidatesWithoutCourses.length || 0}
                </div>
                <div className="text-sm text-gray-500">Unselected Candidates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}