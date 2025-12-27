'use client'
import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img 
            src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1765728997/planzo-navbar-logo-black_vm2bqg.svg" 
            alt="Planzo Logo" 
            className="h-10"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Image */}
          <div className="flex justify-center">
            <img 
              src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1739126531/yjqbezhte7wvxqcqjwy8.png" 
              alt="404 Not Found" 
              className="w-full max-w-md h-auto"
            />
          </div>

          {/* Text Content */}
          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4 mt-3">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-800 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white text-blue-800 font-medium rounded-lg border-2 border-blue-700 hover:bg-indigo-50 transition-colors duration-200"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="py-6 text-center text-gray-500 text-sm">
        <p>Need help? <a href="/contact" className="text-indigo-600 hover:text-indigo-700 underline">Contact Support</a></p>
      </footer> */}
    </div>
  );
}