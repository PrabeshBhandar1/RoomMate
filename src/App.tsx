import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/listings/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ListingDetails from './pages/listings/ListingDetails'
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import AddListing from './pages/listings/AddListing'
import EditListing from './pages/listings/EditListing'
import Chat from './pages/chat/Chat'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-listing"
              element={
                <ProtectedRoute requiredRole="owner">
                  <AddListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute requiredRole="owner">
                  <EditListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App