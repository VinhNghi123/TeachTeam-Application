import { useState, useEffect } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import Layout from '../components/Layout';

interface Candidate {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

interface AvailabilityUpdate {
  tutorId: string;
  tutorName: string;
  isAvailable: boolean;
  message: string;
}

interface GetCandidatesData {
  getCandidates: Candidate[];
}

interface CandidateAvailabilityChangedData {
  candidateAvailabilityChanged: AvailabilityUpdate;
}

const GET_CANDIDATES = gql`
  query GetCandidates {
    getCandidates {
      id
      name
      email
      isBlocked
    }
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

const CANDIDATE_AVAILABILITY_SUBSCRIPTION = gql`
  subscription OnCandidateAvailabilityChanged {
    candidateAvailabilityChanged {
      tutorId
      tutorName
      isAvailable
      message
    }
  }
`;

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityUpdates, setAvailabilityUpdates] = useState<AvailabilityUpdate[]>([]);
  
  const { data, loading, error, refetch } = useQuery<GetCandidatesData>(GET_CANDIDATES);
  const [blockUser] = useMutation(BLOCK_USER);
  const [unblockUser] = useMutation(UNBLOCK_USER);
  
  const { data: subscriptionData } = useSubscription<CandidateAvailabilityChangedData>(CANDIDATE_AVAILABILITY_SUBSCRIPTION);

  useEffect(() => {
    if (subscriptionData?.candidateAvailabilityChanged) {
      setAvailabilityUpdates((prev) => [
        subscriptionData.candidateAvailabilityChanged,
        ...prev,
      ].slice(0, 10)); // Keep only the last 10 updates
    }
  }, [subscriptionData]);

  const handleBlockUser = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to block ${name}?`)) {
      try {
        await blockUser({
          variables: { id },
        });
        refetch();
      } catch (error) {
        console.error('Error blocking user:', error);
        alert(error instanceof Error ? error.message : 'Error blocking user');
      }
    }
  };

  const handleUnblockUser = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to unblock ${name}?`)) {
      try {
        await unblockUser({
          variables: { id },
        });
        refetch();
      } catch (error) {
        console.error('Error unblocking user:', error);
        alert(error instanceof Error ? error.message : 'Error unblocking user');
      }
    }
  };

  const filteredCandidates = data?.getCandidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage candidates and their access to the system. Block or unblock candidates as needed.
            </p>
          </div>
        </div>

        {/* Real-time Availability Updates */}
        {availabilityUpdates.length > 0 && (
          <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Real-time Candidate Availability Updates
              </h2>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {availabilityUpdates.map((update, index) => (
                  <li key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${update.isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{update.tutorName}</p>
                          <p className="text-xs text-gray-500">{update.message}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        update.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {update.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Candidates Table */}
        <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
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
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate, index) => {
                    const hasAvailabilityUpdate = availabilityUpdates.some(
                      update => update.tutorId === candidate.id
                    );
                    const latestUpdate = availabilityUpdates.find(
                      update => update.tutorId === candidate.id
                    );
                    
                    return (
                      <tr 
                        key={candidate.id} 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                          hasAvailabilityUpdate && !latestUpdate?.isAvailable 
                            ? 'opacity-60 bg-red-50' 
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {candidate.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {candidate.name}
                                {hasAvailabilityUpdate && !latestUpdate?.isAvailable && (
                                  <svg className="w-4 h-4 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              {hasAvailabilityUpdate && !latestUpdate?.isAvailable && (
                                <div className="text-xs text-red-600 font-medium">
                                  Unavailable for hiring
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              candidate.isBlocked
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {candidate.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {candidate.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(candidate.id, candidate.name)}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(candidate.id, candidate.name)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-lg mb-2">👥</div>
                      <p className="text-gray-500">
                        {searchTerm ? 'No candidates found matching your search.' : 'No candidates found.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Candidates</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.getCandidates.filter((c) => !c.isBlocked).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Blocked Candidates</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.getCandidates.filter((c) => c.isBlocked).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data?.getCandidates.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}