import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Home: React.FC = () => {
  return (
    <main>
      {/* Find the Best Tutors Section */}
      <section className="py-10 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 mb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-4 text-grey">
                Find the Best Tutors for Your Courses
              </h1>
              <p className="text-lg mb-6 text-grey">
                TeachTeam helps universities streamline the process of hiring qualified tutors for courses offered at the School of Computer Science.
              </p>
              <div className="flex space-x-4">
                <Link href="/signin" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-md hover:from-blue-700 hover:to-blue-900 transition-all transform hover:scale-105">
                  Get Started
                </Link>
                <Link href="/about" className="bg-transparent text-primary px-6 py-2 rounded-md border-2 border-primary hover:bg-blue-100 transition-all transform hover:scale-105">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/pic1.jpg"
                alt="University campus"
                width={500}
                height={300}
                className="rounded-3xl shadow-lg max-w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gradient-to-r from-gray-100 to-white mb-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
            {/* For Tutor Applicants */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">For Tutor Applicants</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Sign in to access the application form</li>
                <li>Provide your academic credentials and teaching experience</li>
                <li>Select relevant courses to apply for in the current semester</li>
                <li>Specify availability (Part-time or Full-time)</li>
                <li>List relevant skills and past tutoring roles</li>
              </ul>
            </div>

            {/* For Lecturers */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">For Lecturers</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Browse and filter applicants based on course name, skills, or availability</li>
                <li>View detailed tutor profiles including credentials and skill sets</li>
                <li>Select and rank preferred candidates</li>
                <li>Leave comments and feedback on tutor profiles</li>
                <li>Use sorting tools to streamline the decision-making process</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-grey">Featured Courses Seeking Tutors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course 1 */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Computing Theory</h3>
              <p className="text-gray-700 mb-4">Introduction to computing theory and principles</p>
              <p className="text-gray-500">Semester: Semester 1, 2025</p>
            </div>

            {/* Course 2 */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Data Structures and Algorithms</h3>
              <p className="text-gray-700 mb-4">Advanced data structures and algorithm designs</p>
              <p className="text-gray-500">Semester: Semester 1, 2025</p>
            </div>

            {/* Course 3 */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Full Stack Development</h3>
              <p className="text-gray-700 mb-4">Web application development with modern frameworks</p>
              <p className="text-gray-500">Semester: Semester 1, 2025</p>
            </div>

            {/* Course 4 */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Further Web Programming</h3>
              <p className="text-gray-700 mb-4">Advanced web programming techniques and concepts</p>
              <p className="text-gray-500">Semester: Semester 1, 2025</p>
            </div>

            {/* Course 5 */}
            <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Database Systems</h3>
              <p className="text-gray-700 mb-4">Design and implementation of database systems</p>
              <p className="text-gray-500">Semester: Semester 1, 2025</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
