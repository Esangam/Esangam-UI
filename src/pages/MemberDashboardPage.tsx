import React, { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from '../state/AuthContext'
import '../styles/memberDashboard.css'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

type Loan = {
  id: number
  amount: number
  status: string
  baseRate: number
  overdueRate: number
  approvalDate?: string
  dueDate?: string
}

type Announcement = {
  id: number
  title: string
  message: string
  createdAt: string
}

type InterestRate = {
  baseRate: number
  overdueRate: number
}

const MemberDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [interest, setInterest] = useState<InterestRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // NEW: loan request state
  const [requestAmount, setRequestAmount] = useState<string>('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [loanRes, annRes, rateRes] = await Promise.allSettled([
        apiClient.get('/loan/my'),
        apiClient.get('/announcement/list'),
        apiClient.get('/interest/current')
      ])

      if (loanRes.status === 'fulfilled') {
        setLoans(loanRes.value.data)
      } else {
        console.error(loanRes.reason)
      }

      if (annRes.status === 'fulfilled') {
        setAnnouncements(annRes.value.data)
      } else {
        console.error(annRes.reason)
      }

      if (rateRes.status === 'fulfilled') {
        setInterest(rateRes.value.data)
      } else {
        console.error(rateRes.reason)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load member dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // NEW: handler to request a loan -> POST /loan/request
  const handleRequestLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestError(null)
    setRequestSuccess(null)

    const amt = parseFloat(requestAmount)
    if (isNaN(amt) || amt <= 0) {
      setRequestError('Please enter a valid loan amount greater than 0')
      return
    }

    try {
      setRequestLoading(true)
      // call backend: POST /loan/request
      await apiClient.post('/loan/request', { amount: amt })
      setRequestSuccess('Loan request submitted successfully.')
      setRequestAmount('')

      // reload dashboard data to include new loan
      await loadData()
    } catch (err) {
      console.error(err)
      setRequestError('Failed to request loan. Please try again.')
    } finally {
      setRequestLoading(false)
    }
  }

    const totalToBePaid = useMemo(() => {
    if (!interest) return 0
    const baseRate = interest.baseRate

    return loans
      // consider only active/approved loans for total payable
      .filter((l) => l.status === 'APPROVED' || l.status === 'REQUESTED')
      .reduce((sum, l) => {
        const rate = l.baseRate || baseRate
        // same simple interest logic you used for chart: 1 year simple interest
        const simpleInterest = (l.amount * rate) / 100
        const finalAmount = l.amount + simpleInterest
        return sum + finalAmount
      }, 0)
  }, [loans, interest])

  const nextDueDate = useMemo(() => {
    const withDue = loans
      .filter((l) => l.dueDate && (l.status === 'APPROVED' || l.status === 'REQUESTED'))
      .map((l) => {
        const d = new Date(l.dueDate as string)
        return isNaN(d.getTime()) ? null : d
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime())

    return withDue.length > 0 ? withDue[0] : null
  }, [loans])


  const chartData = useMemo(() => {
    return loans.map((l, idx) => {
      const baseRate = l.baseRate || interest?.baseRate || 0
      const simpleInterest = l.amount * (baseRate / 100) * 1
      const finalAmount = l.amount + simpleInterest
      return {
        name: `L${l.id ?? idx + 1}`,
        principal: l.amount,
        finalAmount: parseFloat(finalAmount.toFixed(2))
      }
    })
  }, [loans, interest])

  if (loading) return <div>Loading your dashboard...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="member-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>
            Welcome{user?.societyName ? ` to ${user.societyName}` : ''} 👋
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Here you can see your loan summary, interest details, and Sangam updates.
          </p>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            background: '#f9fafb',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Refresh
        </button>
      </div>

      {/* NEW: Request Loan section */}
      <section style={{ ...card, marginBottom: '1rem' }}>
        <h3 style={cardTitle}>Request a New Loan</h3>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Enter the amount you want to request. The request will be sent to your Sangam admin for approval.
        </p>
        <form
          onSubmit={handleRequestLoan}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={requestAmount}
            onChange={(e) => setRequestAmount(e.target.value)}
            placeholder="Enter amount"
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem',
              flex: '0 0 180px'
            }}
          />
          <button
            type="submit"
            disabled={requestLoading}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: requestLoading ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              cursor: requestLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            {requestLoading ? 'Requesting...' : 'Request Loan'}
          </button>
          {requestError && (
            <span style={{ color: '#b91c1c', fontSize: '0.8rem' }}>{requestError}</span>
          )}
          {requestSuccess && (
            <span style={{ color: '#059669', fontSize: '0.8rem' }}>{requestSuccess}</span>
          )}
        </form>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard label="Total Loans" value={loans.length} />
        <StatCard
          label="Active Loans"
          value={loans.filter((l) => l.status === 'APPROVED' || l.status === 'REQUESTED').length}
        />
        <StatCard
          label="Base Interest Rate"
          value={(interest?.baseRate ?? 0) + '%'}
        />
        <StatCard
          label="Overdue Interest Rate"
          value={(interest?.overdueRate ?? 0) + '%'}
        />
          <StatCard
    label="Total Amount to be Paid"
    value={totalToBePaid.toFixed(2)}
  />
  <StatCard
    label="Next Due Date"
    value={nextDueDate ? nextDueDate.toLocaleDateString() : 'N/A'}
  />

      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <section style={card}>
          <h3 style={cardTitle}>Loan Summary Chart</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Shows principal vs final amount (approx, 1 year simple interest with base rate).
          </p>
          {chartData.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              No loans yet. Once you take a loan, you will see it here.
            </p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="principal" stroke="#8884d8" name="Principal" />
                  <Line type="monotone" dataKey="finalAmount" stroke="#82ca9d" name="Final Amount" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section style={card}>
          <h3 style={cardTitle}>Your Loans</h3>
          {loans.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              You have not requested any loans yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem'
                }}
              >
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <Th>ID</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Base Rate</Th>
                    <Th>Overdue Rate</Th>
                    <Th>Final Amount</Th>
                    <Th>Due Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l) => {
                    const baseRate = l.baseRate || interest?.baseRate || 0
                    const simpleInterest = l.amount * (baseRate / 100) * 1
                    const finalAmount = l.amount + simpleInterest
                    return (
                      <tr key={l.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <Td>{l.id}</Td>
                        <Td>{l.amount}</Td>
                        <Td>{l.status}</Td>
                        <Td>{l.baseRate || baseRate}%</Td>
                        <Td>{l.overdueRate || interest?.overdueRate || 0}%</Td>
                        <Td>{finalAmount.toFixed(2)}</Td>
                        <Td>{getDueDate()}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <section style={card}>
        <h3 style={cardTitle}>Sangam Announcements</h3>
        {announcements.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            No announcements yet.
          </p>
        ) : (
          <ul style={{ paddingLeft: '1rem' }}>
            {announcements.map((a) => (
              <li key={a.id} style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{a.message}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
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

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div
    style={{
      padding: '0.75rem 1rem',
      background: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}
  >
    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{value}</div>
  </div>
)

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{ textAlign: 'left', padding: '0.4rem' }}>{children}</th>
)

const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td style={{ padding: '0.4rem' }}>{children}</td>
)

const getDueDate = () => {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setDate(today.getDate() + 365);
  return nextYear.toLocaleDateString();
};


export default MemberDashboardPage
