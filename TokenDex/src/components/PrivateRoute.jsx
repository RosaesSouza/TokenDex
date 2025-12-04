import React from 'react'
import { Navigate } from 'react-router-dom'
import { getUser } from '../services/authService'

export default function PrivateRoute({ children }) {
  const user = getUser()
  if (!user) {
    return <Navigate to="/start" replace />
  }
  return children
}
