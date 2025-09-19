import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">About Coupon Assessment</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
            <p className="text-gray-700 mb-4">
              This is a full-stack MERN (MongoDB, Express.js, React, Node.js) application designed 
              for coupon management and assessment. The project demonstrates modern web development 
              practices and technologies.
            </p>
            <p className="text-gray-700">
              Built with performance, scalability, and user experience in mind, this application 
              provides a solid foundation for any coupon-related business logic.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Frontend</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• React 18 with Hooks</li>
                  <li>• Vite for fast development</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• React Router for navigation</li>
                  <li>• Axios for API calls</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Backend</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Node.js runtime</li>
                  <li>• Express.js framework</li>
                  <li>• MongoDB database</li>
                  <li>• JWT authentication</li>
                  <li>• RESTful API design</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              to="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
