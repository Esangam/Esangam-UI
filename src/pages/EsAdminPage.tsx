import React, { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import '../styles/esAdmin.css'

type Society = {
  id: number
  name: string
  description: string
}

const EsAdminPage: React.FC = () => {
  const [societies, setSocieties] = useState<Society[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [societyName, setSocietyName] = useState('')
  const [description, setDescription] = useState('')
  const [adminMobile, setAdminMobile] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')

  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSocieties = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/society/all')
      setSocieties(res.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load societies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSocieties()
  }, [])

  const createSociety = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!societyName.trim() || !adminMobile.trim() || !firstName.trim() || !password.trim()) {
      setError('Please fill all required fields')
      return
    }
    try {
      setCreating(true)
      await apiClient.post('/society/create', {
        societyName,
        description,
        adminMobile,
        firstName,
        lastName,
        password
      })
      setSuccess('Society and Admin created')
      setSocietyName('')
      setDescription('')
      setAdminMobile('')
      setFirstName('')
      setLastName('')
      setPassword('')
      await loadSocieties()
    } catch (err: any) {
      console.error(err)
      setError('Failed to create society/admin')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="esadmin-page">
      <h2 style={{ marginBottom: '0.5rem' }}>Esangam Admin</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Create societies and assign admins. ES_ADMIN does not handle loans.
      </p>

      <section
        style={{
          padding: '1rem',
          background: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem'
        }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Create Society + Admin</h3>
        {error && <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>}
        {success && <p style={{ color: '#15803d', fontSize: '0.85rem' }}>{success}</p>}
        <form
          onSubmit={createSociety}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' }}
        >
          <div>
            <label style={{ fontSize: '0.8rem' }}>Society Name*</label>
            <input
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem' }}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem' }}>Admin Mobile*</label>
            <input
              value={adminMobile}
              onChange={(e) => setAdminMobile(e.target.value)}
              style={inputStyle}
              maxLength={10}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem' }}>Admin First Name*</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem' }}>Admin Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem' }}>Admin Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                opacity: creating ? 0.7 : 1
              }}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </section>

      <section
        style={{
          padding: '1rem',
          background: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Existing Societies</h3>
        {loading ? (
          <p>Loading...</p>
        ) : societies.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No societies created yet.</p>
        ) : (
          <ul style={{ paddingLeft: '1rem' }}>
            {societies.map((s) => (
              <li key={s.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{s.name}</strong>{' '}
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{s.description}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '0.9rem'
}

export default EsAdminPage
