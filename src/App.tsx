// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';
import { Anonymous } from './pages/auth/Anonymous';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { MoodHistory } from './pages/MoodHistory';
import { Insights } from './pages/Insights';
import { CopingTools } from './pages/CopingTools';
import { PeerSupport } from './pages/PeerSupport';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAnonymous, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user && !isAnonymous) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAnonymous, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user || isAnonymous) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            
            {/* Auth Routes */}
            <Route path="register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="anonymous" element={
              <PublicRoute>
                <Anonymous />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Placeholder routes for future implementation */}
            <Route path="checkin" element={
              <ProtectedRoute>
                <CheckIn />
              </ProtectedRoute>
            } />
            
            <Route path="mood-history" element={
              <ProtectedRoute>
                <MoodHistory />
              </ProtectedRoute>
            } />
            
            <Route path="tools" element={
              <ProtectedRoute>
                <CopingTools />
              </ProtectedRoute>
            } />
            
            <Route path="support" element={
              <ProtectedRoute>
                <PeerSupport />
              </ProtectedRoute>
            } />
            
            <Route path="insights" element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } />
            
            <Route path="settings" element={
              <ProtectedRoute>
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                  <p className="text-gray-600">Privacy settings and account management coming soon</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Crisis Support - Always accessible */}
            <Route path="crisis" element={
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-900 mb-4">Crisis Support</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-red-900 mb-4">Immediate Help Available</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-red-800">National Suicide Prevention Lifeline</h3>
                      <p className="text-red-700">Call or text: <strong>988</strong></p>
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Crisis Text Line</h3>
                      <p className="text-red-700">Text <strong>HOME</strong> to <strong>741741</strong></p>
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Emergency Services</h3>
                      <p className="text-red-700">Call <strong>911</strong> for immediate emergency assistance</p>
                    </div>
                  </div>
                </div>
              </div>
            } />
            
            {/* Static pages placeholders */}
            <Route path="resources" element={
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Mental Health Resources</h1>
                <p className="text-gray-600">Comprehensive resource library coming soon</p>
              </div>
            } />
            
            <Route path="about" element={
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">About MindfulSpace</h1>
                <p className="text-gray-600">Learn about our mission and approach to mental health support</p>
              </div>
            } />
            
            <Route path="privacy" element={
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-600">Detailed privacy policy coming soon</p>
              </div>
            } />
            
            <Route path="terms" element={
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-600">Terms of service coming soon</p>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
