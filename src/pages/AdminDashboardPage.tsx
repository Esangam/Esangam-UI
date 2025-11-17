import React, { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from '../state/AuthContext'
import '../styles/adminDashboard.css'

type Member = {
  mobileNumber: string
  firstName: string
  lastName: string
  fullName: string
  role: string
}

type Loan = {
  id: number
  name: string
  amount: number
  status: string
  baseRate: number
  overdueRate: number
}

type Announcement = {
  id: number
  title: string
  message: string
  createdAt: string
}

type Dashboard = {
  societyName: string
  societyDescription: string
  members: Member[]
  loans: Loan[]
  announcements: Announcement[]
  baseRate: number
  overdueRate: number
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newMember, setNewMember] = useState({
    mobile: '',
    firstName: '',
    lastName: '',
    password: ''
  })

  const [interestBase, setInterestBase] = useState('')
  const [interestOverdue, setInterestOverdue] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementMsg, setAnnouncementMsg] = useState('')

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/dashboard')
      setDashboard(res.data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const createMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dashboard) return
    try {
      await apiClient.post('/member/create', {
        ...newMember
      })
      setNewMember({ mobile: '', firstName: '', lastName: '', password: '' })
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to create member')
    }
  }

  const approveLoan = async (id: number) => {
    try {
      await apiClient.post('/loan/approve', { loanId: id })
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to approve loan')
    }
  }

  const rejectLoan = async (id: number) => {
    try {
      await apiClient.post('/loan/reject', { loanId: id })
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to reject loan')
    }
  }

  const updateInterest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post('/interest/update', {
        baseRate: parseFloat(interestBase),
        overdueRate: parseFloat(interestOverdue)
      })
      setInterestBase('')
      setInterestOverdue('')
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to update interest')
    }
  }

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post('/announcement/post', {
        title: announcementTitle,
        message: announcementMsg
      })
      setAnnouncementTitle('')
      setAnnouncementMsg('')
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to post announcement')
    }
  }

  if (loading) return <div>Loading dashboard...</div>
  if (!dashboard) return <div>{error || 'No data'}</div>

  return (
    <div className="admin-dashboard">
      <h2 style={{ marginBottom: '0.25rem' }}>
        Welcome to <span style={{ color: '#2563eb' }}>{dashboard.societyName}</span>
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        {dashboard.societyDescription || 'Sangam Admin Dashboard'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard label="Members" value={dashboard.members.length} />
        <StatCard label="Pending Loans" value={dashboard.loans.filter((l) => l.status === 'REQUESTED').length} />
        <StatCard label="Base Interest Rate" value={`${dashboard.baseRate || 0}%`} />
        <StatCard label="Overdue Rate" value={`${dashboard.overdueRate || 0}%`} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <section style={card}>
          <h3 style={cardTitle}>Add Member</h3>
          <form onSubmit={createMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Input label="Mobile" value={newMember.mobile} onChange={(v) => setNewMember((m) => ({ ...m, mobile: v }))} />
            <Input label="First Name" value={newMember.firstName} onChange={(v) => setNewMember((m) => ({ ...m, firstName: v }))} />
            <Input label="Last Name" value={newMember.lastName} onChange={(v) => setNewMember((m) => ({ ...m, lastName: v }))} />
            <Input label="Password" type="password" value={newMember.password} onChange={(v) => setNewMember((m) => ({ ...m, password: v }))} />
            <button style={primaryButton} type="submit">Create Member</button>
          </form>
        </section>

        <section style={card}>
          <h3 style={cardTitle}>Interest Settings</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Current: {dashboard.baseRate || 0}% base, {dashboard.overdueRate || 0}% overdue
          </p>
          <form onSubmit={updateInterest} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Input label="Base Rate (%)" value={interestBase} onChange={setInterestBase} />
            <Input label="Overdue Rate (%)" value={interestOverdue} onChange={setInterestOverdue} />
            <button style={primaryButton} type="submit">Update Rates</button>
          </form>
        </section>

        <section style={card}>
          <h3 style={cardTitle}>Announcements</h3>
          <form onSubmit={postAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Input label="Title" value={announcementTitle} onChange={setAnnouncementTitle} />
            <label style={{ fontSize: '0.8rem' }}>Message</label>
            <textarea
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
            <button style={primaryButton} type="submit">Post Announcement</button>
          </form>
        </section>
      </div>

      <section style={card}>
        <h3 style={cardTitle}>Loan Requests</h3>
        {dashboard.loans.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No loan requests.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={th}>ID</th>
                <th style={th}>Name</th>
                <th style={th}>Amount</th>
                <th style={th}>Status</th>
                <th style={th}>Base Rate</th>
                <th style={th}>Overdue Rate</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.loans.map((l) => (
                <tr key={l.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={td}>{l.id}</td>
                  <td style={td}>{l.name}</td>
                  <td style={td}>{l.amount}</td>
                  <td style={td}>{l.status}</td>
                  <td style={td}>{l.baseRate || '-'}</td>
                  <td style={td}>{l.overdueRate || '-'}</td>
                  <td style={td}>
                    {l.status === 'REQUESTED' && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button style={smallButton} onClick={() => approveLoan(l.id)}>Approve</button>
                        <button style={smallDangerButton} onClick={() => rejectLoan(l.id)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

const card: React.CSSProperties = {
  padding: '1rem',
  background: '#ffffff',
  borderRadius: '0.75rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
}

const cardTitle: React.CSSProperties = {
  fontSize: '1rem',
  marginBottom: '0.5rem'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '0.9rem'
}

const primaryButton: React.CSSProperties = {
  marginTop: '0.25rem',
  padding: '0.4rem 0.75rem',
  borderRadius: '999px',
  border: 'none',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '0.85rem',
  cursor: 'pointer'
}

const smallButton: React.CSSProperties = {
  padding: '0.2rem 0.5rem',
  borderRadius: '999px',
  border: 'none',
  background: '#16a34a',
  color: '#ffffff',
  fontSize: '0.75rem',
  cursor: 'pointer'
}

const smallDangerButton: React.CSSProperties = {
  padding: '0.2rem 0.5rem',
  borderRadius: '999px',
  border: 'none',
  background: '#dc2626',
  color: '#ffffff',
  fontSize: '0.75rem',
  cursor: 'pointer'
}

const th: React.CSSProperties = { textAlign: 'left', padding: '0.4rem' }
const td: React.CSSProperties = { padding: '0.4rem' }

const Input: React.FC<{
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
}> = ({ label, type = 'text', value, onChange }) => (
  <div>
    <label style={{ fontSize: '0.8rem' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  </div>
)

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div style={{ ...card, padding: '0.75rem 1rem' }}>
    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{value}</div>
  </div>
)

export default AdminDashboardPage
