import React from 'react';

const About: React.FC = () => {
  return (
    <main>
      <div className="max-w-6xl mx-auto px-6">
        {/* Title Section */}
        <h1 className="text-4xl font-extrabold text-center text-grey mb-8">About TeachTeam</h1>

        {/* Mission Section */}
        <section className="bg-gradient-to-r from-blue-100 to-blue-50 p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-4">
            TeachTeam was created to streamline the process of hiring qualified tutors for courses
            offered at the School of Computer Science. Our platform connects qualified tutor applicants
            with lecturers looking for teaching assistants, creating an efficient and transparent hiring process.
          </p>
          <p className="text-lg text-gray-700">
            By providing a centralized system for tutor applications and selections, we help universities
            find the best teaching talent while giving students and graduates opportunities to share their
            knowledge and gain valuable teaching experience.
          </p>
        </section>

        {/* How It Works Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-center text-grey mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Tutor Applicants */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <h3 className="text-xl font-medium text-blue-700 mb-4">For Tutor Applicants</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Create an account with your academic credentials</li>
                <li>List your skills and previous teaching experience</li>
                <li>Apply for courses that match your expertise</li>
                <li>Specify your availability (part-time or full-time)</li>
                <li>Track the status of your applications</li>
              </ul>
            </div>

            {/* For Lecturers */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <h3 className="text-xl font-medium text-blue-700 mb-4">For Lecturers</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Browse qualified applicants for your courses</li>
                <li>View detailed profiles including skills and experience</li>
                <li>Select and rank preferred candidates</li>
                <li>Add comments to applicant profiles</li>
                <li>Search and filter applications to find the perfect match</li>
                <li>View statistics to optimize your selection process</li>
              </ul>
            </div>
          </div>
        </section>

       {/* Benefits Section */}
<section className="p-8 mb-8">
  <div className="container mx-auto px-6">
    <h2 className="text-3xl font-semibold text-center mb-6 text-grey-700">Benefits</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Benefit 1 */}
      <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <h3 className="text-lg font-medium text-blue-700 mb-3">Efficient Selection</h3>
        <p className="text-gray-600">
          Streamlined process saves time for both lecturers and applicants, with an intuitive interface for managing applications.
        </p>
      </div>

      {/* Benefit 2 */}
      <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <h3 className="text-lg font-medium text-blue-700 mb-3">Better Matches</h3>
        <p className="text-gray-600">
          Find tutors with the perfect skill set for your course needs, improving teaching quality and student experience.
        </p>
      </div>

      {/* Benefit 3 */}
      <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <h3 className="text-lg font-medium text-blue-700 mb-3">Transparency</h3>
        <p className="text-gray-600">
          Clear application status updates and feedback improve communication between all parties involved.
        </p>
      </div>
    </div>
  </div>
</section>


      </div>
    </main>
  );
};

export default About;
