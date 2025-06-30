import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-teal-600" />
              <span className="text-lg font-semibold text-gray-900">
                MindfulSpace
              </span>
            </div>
            <p className="text-sm text-gray-600">
              A compassionate mental health companion focused on your privacy, safety, and wellbeing.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>HIPAA-Compliant & Encrypted</span>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/crisis" 
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Phone className="h-4 w-4" />
                  <span>Crisis Support</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/resources" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Mental Health Resources
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Privacy & Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/data-protection" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Data Protection
                </Link>
              </li>
              <li>
                <Link 
                  to="/accessibility" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Our Mission
                </Link>
              </li>
              <li>
                <Link 
                  to="/approach" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Our Approach
                </Link>
              </li>
              <li>
                <Link 
                  to="/research" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Research & Ethics
                </Link>
              </li>
              <li>
                <Link 
                  to="/professionals" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  For Professionals
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2024 MindfulSpace. All rights reserved.
            </p>
            
            <div className="text-sm text-gray-500 text-center md:text-right">
              <p className="mb-1">
                <strong>Crisis Resources:</strong>
              </p>
              <p>
                National Suicide Prevention Lifeline: <strong>988</strong>
              </p>
              <p>
                Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong>
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> MindfulSpace is not a replacement for professional mental health care. 
              If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}