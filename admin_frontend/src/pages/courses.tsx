import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Layout from '../components/Layout';

interface Course {
  id: string;
  courseCode: string;
  name: string;
  description?: string;
  semester: string;
  year: number;
  isActive: boolean;
}

interface CourseInput {
  courseCode: string;
  name: string;
  description?: string;
  semester: string;
  year: number;
  isActive: boolean;
}

const GET_COURSES = gql`
  query GetCourses {
    getCourses {
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

export default function Courses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseInput>({
    courseCode: '',
    name: '',
    description: '',
    semester: '',
    year: new Date().getFullYear(),
    isActive: true,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { loading, error, data, refetch } = useQuery<{ getCourses: Course[] }>(GET_COURSES);
  const [createCourse, { loading: creating }] = useMutation<{ createCourse: Course }, { input: CourseInput }>(CREATE_COURSE);
  const [updateCourse, { loading: updating }] = useMutation<{ updateCourse: Course }, { id: string; input: CourseInput }>(UPDATE_COURSE);
  const [deleteCourse] = useMutation<{ deleteCourse: boolean }, { id: string }>(DELETE_COURSE);

  const validateCourseCode = (code: string): boolean => {
    const codeRegex = /^COSC[0-9]{4}$/;
    return codeRegex.test(code);
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    } else if (!validateCourseCode(formData.courseCode)) {
      newErrors.courseCode = 'Course code must be in format COSCxxxx (e.g., COSC2758)';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Course name must be at least 3 characters';
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.year || formData.year < new Date().getFullYear()) {
      newErrors.year = 'Year must be current year or later';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingCourse) {
        await updateCourse({
          variables: {
            id: editingCourse.id,
            input: formData,
          },
        });
      } else {
        await createCourse({
          variables: {
            input: formData,
          },
        });
      }
      handleCloseModal();
      refetch();
    } catch (error: unknown) {
      console.error('Error saving course:', error);
      if (error instanceof Error && (error.message.includes('duplicate') || error.message.includes('already exists'))) {
        setErrors({ courseCode: 'Course code already exists' });
      } else {
        alert(error instanceof Error ? error.message : 'Error saving course');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      name: '',
      description: '',
      semester: '',
      year: new Date().getFullYear(),
      isActive: true,
    });
    setErrors({});
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      name: course.name,
      description: course.description || '',
      semester: course.semester,
      year: course.year,
      isActive: course.isActive,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, courseName: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      try {
        await deleteCourse({
          variables: { id },
        });
        refetch();
      } catch (error: unknown) {
        console.error('Error deleting course:', error);
        alert(error instanceof Error ? error.message : 'Error deleting course. This course may have existing applications.');
      }
    }
  };

  const handleNewCourse = () => {
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      name: '',
      description: '',
      semester: '',
      year: new Date().getFullYear(),
      isActive: true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error.message}
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage courses available for the semester. Add, edit, or remove courses as needed.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={handleNewCourse}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Course
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.getCourses.map((course: Course, index: number) => (
                  <tr key={course.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.courseCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        {course.description && (
                          <div className="text-xs text-gray-500">{course.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          course.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id, course.name)}
                        className="inline-flex items-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-50"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-2 text-center">
                      {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
                        Course Code *
                      </label>
                      <input
                        type="text"
                        name="courseCode"
                        id="courseCode"
                        required
                        placeholder="e.g., COSC2758"
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 ${
                          errors.courseCode ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        value={formData.courseCode}
                        onChange={(e) => {
                          setFormData({ ...formData, courseCode: e.target.value.toUpperCase() });
                          if (errors.courseCode) {
                            setErrors({ ...errors, courseCode: '' });
                          }
                        }}
                      />
                      {errors.courseCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.courseCode}</p>
                      )}
                      {!errors.courseCode && (
                        <p className="mt-1 text-xs text-gray-500">Format: COSCxxxx (e.g., COSC2758)</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        placeholder="e.g., Full Stack Development"
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 ${
                          errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) {
                            setErrors({ ...errors, name: '' });
                          }
                        }}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        placeholder="Brief course description..."
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                          Semester *
                        </label>
                        <select
                          name="semester"
                          id="semester"
                          required
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                            errors.semester ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : ''
                          }`}
                          value={formData.semester}
                          onChange={(e) => {
                            setFormData({ ...formData, semester: e.target.value });
                            if (errors.semester) {
                              setErrors({ ...errors, semester: '' });
                            }
                          }}
                        >
                          <option value="">Select Semester</option>
                          <option value="Semester 1">Semester 1</option>
                          <option value="Semester 2">Semester 2</option>
                        </select>
                        {errors.semester && (
                          <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                          Year *
                        </label>
                        <input
                          type="number"
                          name="year"
                          id="year"
                          required
                          min={new Date().getFullYear()}
                          className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 ${
                            errors.year ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : ''
                          }`}
                          value={formData.year}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              year: parseInt(e.target.value),
                            });
                            if (errors.year) {
                              setErrors({ ...errors, year: '' });
                            }
                          }}
                        />
                        {errors.year && (
                          <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <span className="ml-2 text-sm text-gray-600">Active Course</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse space-x-3 space-x-reverse">
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating || updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingCourse ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingCourse ? 'Update Course' : 'Create Course'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}