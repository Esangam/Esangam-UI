import React, { useState } from 'react'
import { apiClient } from '../api/client'
import { useNavigate } from 'react-router-dom'

const BootstrapAdminPage: React.FC = () => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!mobileNumber.trim() || !password.trim()) {
      setMessage('Please enter mobile number and password')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    try {
      setLoading(true)

      // IMPORTANT: Call backend POST to create ES_ADMIN
      // Backend endpoint: POST /auth/bootstrap/create-admin
      const res = await apiClient.post(
        '/auth/bootstrap/create-admin',
        { mobileNumber, password },
        {
          // make sure no stale JWT is sent for bootstrap
          headers: { Authorization: '' }
        }
      )

      setMessage(res.data.message || 'ES_ADMIN created successfully. You can now login.')
    } catch (err: any) {
      console.error(err)
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to initialize ES_ADMIN (maybe already exists?)'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const goToLogin = () => {
    navigate('/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '1.5rem',
          borderRadius: '0.75rem',
          background: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
        }}
      >
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Initialize ES Admin
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
          This should be done only once after deployment. It creates the first{' '}
          <strong>ES_ADMIN</strong> account.
        </p>

        {message && (
          <div
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.85rem'
            }}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div>
            <label
              htmlFor="mobile"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}
            >
              Mobile Number
            </label>
            <input
              id="mobile"
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter admin mobile number"
              style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.9rem'
                    }}

            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter admin password"
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: loading ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create ES Admin'}
          </button>
        </form>

        <button
          type="button"
          onClick={goToLogin}
          style={{
            marginTop: '0.75rem',
            width: '100%',
            padding: '0.45rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#374151',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}

export default BootstrapAdminPage
