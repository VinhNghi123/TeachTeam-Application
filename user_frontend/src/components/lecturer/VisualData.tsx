// components/lecturer/VisualData.tsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService from '../../services/api';
import { Application } from '../../types/application';
import { Tutor } from '../../types/user';
import { Course } from '../../types/course';

interface VisualDataProps {
  assignedCourses: Course[];
}

interface ApplicationsByStatus {
  name: string;
  count: number;
  color: string;
}

interface ApplicationsByCourse {
  courseCode: string;
  courseName: string;
  totalApplications: number;
  selectedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
}

interface ApplicationsByRole {
  role: string;
  applications: number;
  selected: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    payload: {
      courseCode: string;
      courseName: string;
      pendingApplications: number;
      selectedApplications: number;
      rejectedApplications: number;
      totalApplications: number;
    };
  }>;
}

const VisualData: React.FC<VisualDataProps> = ({ assignedCourses }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [mostChosen, setMostChosen] = useState<{ tutor: Tutor | null, count: number }>({ tutor: null, count: 0 });
  const [leastChosen, setLeastChosen] = useState<{ tutor: Tutor | null, count: number }>({ tutor: null, count: 0 });
  const [notSelected, setNotSelected] = useState<Tutor[]>([]);
  const [roleStats, setRoleStats] = useState<{ tutors: number, labAssistants: number }>({ tutors: 0, labAssistants: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // New state for graph data
  const [applicationsByStatus, setApplicationsByStatus] = useState<ApplicationsByStatus[]>([]);
  const [applicationsByCourse, setApplicationsByCourse] = useState<ApplicationsByCourse[]>([]);
  const [applicationsByRole, setApplicationsByRole] = useState<ApplicationsByRole[]>([]);

  // Colors for charts
  const statusColors = {
    pending: '#fbbf24', // yellow-400
    selected: '#10b981', // green-500
    rejected: '#ef4444', // red-500
  };

  useEffect(() => {
    const roleColors = {
      tutor: '#3b82f6', // blue-500
      'lab-assistant': '#8b5cf6', // purple-500
    };

    const fetchData = async () => {
      try {
        const [applicationsResponse, usersResponse] = await Promise.all([
          apiService.get<Application[]>('/api/applications'),
          apiService.get<Tutor[]>('/api/users?type=tutor')
        ]);

        // Filter applications to only include assigned courses
        const filteredApplications = applicationsResponse.data.filter(app =>
          assignedCourses.some(course => course.id === Number(app.courseId))
        );

        setApplications(filteredApplications);
        
        // Calculate selection statistics
        const calculateStatistics = (apps: Application[]) => {
          // Count selections for each tutor
          const selectionCounts = new Map<number, number>();
          
          usersResponse.data.forEach(tutor => {
            const selectedCount = apps.filter(app => 
              app.tutorId === tutor.id && app.status === 'selected'
            ).length;
            
            selectionCounts.set(tutor.id, selectedCount);
          });
          
          // Find most chosen tutor
          let maxCount = 0;
          let maxTutorId = -1;
          selectionCounts.forEach((count, tutorId) => {
            if (count > maxCount) {
              maxCount = count;
              maxTutorId = tutorId;
            }
          });
          
          // Find least chosen tutor (among those who have at least one application)
          const applicantTutors = usersResponse.data.filter(tutor => 
            apps.some(app => app.tutorId === tutor.id)
          );
          
          let minCount = Infinity;
          let minTutorId = -1;
          
          applicantTutors.forEach(tutor => {
            const count = selectionCounts.get(tutor.id) || 0;
            if (count < minCount && apps.some(app => app.tutorId === tutor.id)) {
              minCount = count;
              minTutorId = tutor.id;
            }
          });
          
          // Find tutors with no selections
          const notSelectedTutors = usersResponse.data.filter(tutor => {
            const tutorApplications = apps.filter(app => app.tutorId === tutor.id);
            return tutorApplications.length > 0 && tutorApplications.every(app => app.status !== 'selected');
          });
          
          // Count selected applications by role
          const selectedApps = apps.filter(app => app.status === 'selected');
          const tutorCount = selectedApps.filter(app => app.role === 'tutor').length;
          const labAssistantCount = selectedApps.filter(app => app.role === 'lab-assistant').length;
          
          // Calculate graph data
          calculateGraphData(apps);
          
          // Update state
          setMostChosen({
            tutor: usersResponse.data.find(t => t.id === maxTutorId) || null,
            count: maxCount
          });
          
          setLeastChosen({
            tutor: usersResponse.data.find(t => t.id === minTutorId) || null,
            count: minCount === Infinity ? 0 : minCount
          });
          
          setNotSelected(notSelectedTutors);
          
          setRoleStats({
            tutors: tutorCount,
            labAssistants: labAssistantCount
          });
        };

        const calculateGraphData = (apps: Application[]) => {
          // Applications by status
          const statusCounts = {
            pending: apps.filter(app => app.status === 'pending').length,
            selected: apps.filter(app => app.status === 'selected').length,
            rejected: apps.filter(app => app.status === 'rejected').length,
          };

          const statusData: ApplicationsByStatus[] = [
            { name: 'Pending', count: statusCounts.pending, color: statusColors.pending },
            { name: 'Selected', count: statusCounts.selected, color: statusColors.selected },
            { name: 'Rejected', count: statusCounts.rejected, color: statusColors.rejected },
          ];

          setApplicationsByStatus(statusData);

          // Applications by course
          const courseData: ApplicationsByCourse[] = assignedCourses.map(course => {
            const courseApps = apps.filter(app => app.courseId === course.id);
            return {
              courseCode: course.courseCode,
              courseName: course.name,
              totalApplications: courseApps.length,
              selectedApplications: courseApps.filter(app => app.status === 'selected').length,
              pendingApplications: courseApps.filter(app => app.status === 'pending').length,
              rejectedApplications: courseApps.filter(app => app.status === 'rejected').length,
            };
          }).filter(data => data.totalApplications > 0); // Only show courses with applications

          setApplicationsByCourse(courseData);

          // Applications by role
          const roleData: ApplicationsByRole[] = [
            {
              role: 'Tutor',
              applications: apps.filter(app => app.role === 'tutor').length,
              selected: apps.filter(app => app.role === 'tutor' && app.status === 'selected').length,
              color: roleColors.tutor,
            },
            {
              role: 'Lab Assistant',
              applications: apps.filter(app => app.role === 'lab-assistant').length,
              selected: apps.filter(app => app.role === 'lab-assistant' && app.status === 'selected').length,
              color: roleColors['lab-assistant'],
            },
          ];

          setApplicationsByRole(roleData);
        };

        calculateStatistics(filteredApplications);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignedCourses, statusColors.pending, statusColors.rejected, statusColors.selected]);

  // Custom tooltip for charts
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].payload.courseCode}</p>
          <p className="text-sm text-gray-600">{payload[0].payload.courseName}</p>
          <p style={{ color: statusColors.pending }}>Pending: {payload[0].payload.pendingApplications}</p>
          <p style={{ color: statusColors.selected }}>Selected: {payload[0].payload.selectedApplications}</p>
          <p style={{ color: statusColors.rejected }}>Rejected: {payload[0].payload.rejectedApplications}</p>
          <p className="font-medium">Total: {payload[0].payload.totalApplications}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <h2 className="text-black text-2xl font-bold mb-6">Application Analytics Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-300 p-4 rounded-lg">
          <h3 className="text-black text-lg font-semibold mb-2">Most Selected Applicant</h3>
          {mostChosen.tutor ? (
            <div>
              <p className="text-black font-medium">{mostChosen.tutor.name}</p>
              <p className="text-gray-600 text-sm">{mostChosen.tutor.email}</p>
              <p className="mt-2">
                Selected for <span className="font-bold">{mostChosen.count}</span> courses
              </p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
        
        <div className="bg-yellow-200 p-4 rounded-lg">
          <h3 className="text-black text-lg font-semibold mb-2">Least Selected Applicant</h3>
          {leastChosen.tutor ? (
            <div>
              <p className="text-black font-medium">{leastChosen.tutor.name}</p>
              <p className="text-gray-600 text-sm">{leastChosen.tutor.email}</p>
              <p className="text-black mt-2">
                Selected for <span className="text-black font-bold">{leastChosen.count}</span> courses
              </p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
        
        <div className="bg-green-200 p-4 rounded-lg">
          <h3 className="text-black text-lg font-semibold mb-2">Not Selected Applicants</h3>
          {notSelected.length > 0 ? (
            <div>
              <p className="text-black font-medium">{notSelected.length} applicants</p>
              <p className="text-gray-600 text-sm">Have applications but no selections</p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Status Pie Chart */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-black text-lg font-semibold mb-4">Application Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={applicationsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count, percent }) => `${name}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {applicationsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total Applications: {applicationsByStatus.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-black text-lg font-semibold mb-4">Applications by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationsByRole}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="applications" fill="#93c5fd" name="Total Applications" />
              <Bar dataKey="selected" fill="#34d399" name="Selected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Applications by Course */}
      {applicationsByCourse.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-black text-lg font-semibold mb-4">Applications by Course</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={applicationsByCourse} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="courseCode" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{data.courseCode}</p>
                        <p className="text-sm text-gray-600">{data.courseName}</p>
                        <p style={{ color: statusColors.pending }}>Pending: {data.pendingApplications}</p>
                        <p style={{ color: statusColors.selected }}>Selected: {data.selectedApplications}</p>
                        <p style={{ color: statusColors.rejected }}>Rejected: {data.rejectedApplications}</p>
                        <p className="font-medium">Total: {data.totalApplications}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="pendingApplications" stackId="a" fill={statusColors.pending} name="Pending" />
              <Bar dataKey="selectedApplications" stackId="a" fill={statusColors.selected} name="Selected" />
              <Bar dataKey="rejectedApplications" stackId="a" fill={statusColors.rejected} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Selection progerss bar */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-black text-lg font-semibold mb-4">Selection Progress Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center h-8">
            <div className="text-black w-24 text-sm font-medium">Selected</div>
            <div className="flex-grow bg-gray-200 rounded-full h-6 overflow-hidden">
              {applications.length > 0 && (
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ 
                    width: `${(applications.filter(app => app.status === 'selected').length / applications.length) * 100}%` 
                  }}
                />
              )}
            </div>
            <div className="text-black font-bold w-12 text-right text-sm ml-2">
              {applications.filter(app => app.status === 'selected').length}
            </div>
          </div>
          
          <div className="flex items-center h-8">
            <div className="text-black w-24 text-sm font-medium">Pending</div>
            <div className="flex-grow bg-gray-200 rounded-full h-6 overflow-hidden">
              {applications.length > 0 && (
                <div 
                  className="bg-yellow-500 h-full transition-all duration-500" 
                  style={{ 
                    width: `${(applications.filter(app => app.status === 'pending').length / applications.length) * 100}%` 
                  }}
                />
              )}
            </div>
            <div className="text-black font-bold w-12 text-right text-sm ml-2">
              {applications.filter(app => app.status === 'pending').length}
            </div>
          </div>

          <div className="flex items-center h-8">
            <div className="text-black w-24 text-sm font-medium">Rejected</div>
            <div className="flex-grow bg-gray-200 rounded-full h-6 overflow-hidden">
              {applications.length > 0 && (
                <div 
                  className="bg-red-500 h-full transition-all duration-500" 
                  style={{ 
                    width: `${(applications.filter(app => app.status === 'rejected').length / applications.length) * 100}%` 
                  }}
                />
              )}
            </div>
            <div className="text-black font-bold w-12 text-right text-sm ml-2">
              {applications.filter(app => app.status === 'rejected').length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Roles Distribution (Legacy) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-300 p-4 rounded-lg">
          <h4 className="text-black text-md font-medium mb-2">Tutors Selected</h4>
          <div className="flex items-center">
            <div className="h-16 w-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
              {roleStats.tutors}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {applications.length > 0 
                  ? `${Math.round((roleStats.tutors / applications.length) * 100)}% of total applications` 
                  : '0% of total applications'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-300 p-4 rounded-lg">
          <h4 className="text-black text-md font-medium mb-2">Lab Assistants Selected</h4>
          <div className="flex items-center">
            <div className="h-16 w-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
              {roleStats.labAssistants}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {applications.length > 0 
                  ? `${Math.round((roleStats.labAssistants / applications.length) * 100)}% of total applications` 
                  : '0% of total applications'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualData;