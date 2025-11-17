import React from 'react'
import { Routes, Route, Navigate, Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from './state/AuthContext'
import LoginPage from './pages/LoginPage'
import EsAdminPage from './pages/EsAdminPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import MemberDashboardPage from './pages/MemberDashboardPage'
import { useNotifications } from './hooks/useNotifications'

import './styles/app.css'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const { messages, dismiss } = useNotifications()
  const navigate = useNavigate()

  return (
    <Box className="app-root">
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Box component="span" sx={{ color: 'primary.main' }}>Esangam</Box>
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
                ml: 0.5
              }}
            >
              Society
            </Box>
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
              {user.role === 'ES_ADMIN' && (
                <Button
                  size="small"
                  component={RouterLink}
                  to="/esadmin"
                  color="inherit"
                >
                  Sangams
                </Button>
              )}
              {user.role === 'ADMIN' && (
                <Button
                  size="small"
                  component={RouterLink}
                  to="/admin"
                  color="inherit"
                >
                  Admin Dashboard
                </Button>
              )}
              {user.role === 'MEMBER' && (
                <Button
                  size="small"
                  component={RouterLink}
                  to="/member"
                  color="inherit"
                >
                  My Dashboard
                </Button>
              )}
            </Stack>
          )}

          {user ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                {user.mobile} ({user.role}
                {user.societyName ? ` · ${user.societyName}` : ''})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={logout}
              >
                Logout
              </Button>
            </Stack>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="small"
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {messages.map((m) => (
        <Snackbar
          key={m.id}
          open
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={6000}
          onClose={() => dismiss(m.id)}
        >
          <Alert
            onClose={() => dismiss(m.id)}
            severity="info"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {m.text}
          </Alert>
        </Snackbar>
      ))}

      <Container className="app-content">
        {children}
      </Container>
    </Box>
  )
}

const ProtectedRoute: React.FC<{
  children: React.ReactNode
  roles?: ('ES_ADMIN' | 'ADMIN' | 'MEMBER')[]
}> = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

const HomePage: React.FC = () => {
  const { user } = useAuth()
  return (
    <div>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Welcome to Esangam
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 2 }}>
        Multi-society cooperative management platform.
      </Typography>
      {user ? (
        <Typography sx={{ color: 'text.secondary' }} variant="body2">
          You are logged in as <strong>{user.mobile}</strong> ({user.role}
          {user.societyName ? ` · ${user.societyName}` : ''})
        </Typography>
      ) : (
        <Typography sx={{ color: 'text.secondary' }} variant="body2">
          Please{' '}
          <Link component={RouterLink} to="/login">
            login
          </Link>{' '}
          to continue.
        </Typography>
      )}
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/esadmin"
        element={
          <AppLayout>
            <ProtectedRoute roles={['ES_ADMIN']}>
              <EsAdminPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <AppLayout>
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/member"
        element={
          <AppLayout>
            <ProtectedRoute roles={['MEMBER']}>
              <MemberDashboardPage />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
