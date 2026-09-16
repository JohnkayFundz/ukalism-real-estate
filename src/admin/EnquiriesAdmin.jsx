import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CarFront,
  Home,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { ADMIN_EMAIL, supabase } from '../lib/supabase'
import './EnquiriesAdmin.css'

const STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Replied',
  'Interested',
  'Viewing / Inspection',
  'Proposal / Negotiation',
  'Won',
  'Lost',
]

const statusClass = (status) =>
  status.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function EnquiriesAdmin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enquiries, setEnquiries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loadingData, setLoadingData] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isAdmin = useMemo(() => {
    if (!session?.user?.email || !ADMIN_EMAIL) return false
    return session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  }, [session])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return
        setSession(nextSession)
        setLoading(false)
      },
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadEnquiries()
  }, [isAdmin])

  const loadEnquiries = async () => {
    setLoadingData(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })

    setLoadingData(false)

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setEnquiries(data || [])
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setError('')
    setMessage('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setAuthLoading(false)

    if (loginError) {
      setError(loginError.message)
      return
    }

    setPassword('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setEnquiries([])
  }

  const handleStatusChange = async (enquiry, nextStatus) => {
    if (nextStatus === enquiry.status) return

    setUpdatingId(enquiry.id)
    setError('')
    setMessage('')

    const { data, error: updateError } = await supabase
      .from('enquiries')
      .update({ status: nextStatus })
      .eq('id', enquiry.id)
      .select()
      .single()

    setUpdatingId(null)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setEnquiries((current) =>
      current.map((item) => (item.id === enquiry.id ? data : item)),
    )
    setMessage(`Enquiry #${enquiry.id} moved to ${nextStatus}.`)
  }

  const handleDelete = async (enquiry) => {
    const confirmed = window.confirm(
      `Delete enquiry #${enquiry.id} from ${enquiry.name}? This cannot be undone.`,
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', enquiry.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setEnquiries((current) => current.filter((item) => item.id !== enquiry.id))
    setMessage(`Enquiry #${enquiry.id} deleted.`)
  }

  const filteredEnquiries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return enquiries.filter((enquiry) => {
      const matchesType = typeFilter === 'all' || enquiry.listing_type === typeFilter
      const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter
      const haystack = [
        enquiry.name,
        enquiry.phone,
        enquiry.email,
        enquiry.listing_title,
        enquiry.message,
        enquiry.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesType && matchesStatus && (!term || haystack.includes(term))
    })
  }, [enquiries, searchTerm, typeFilter, statusFilter])

  const counts = useMemo(() => ({
    total: enquiries.length,
    new: enquiries.filter((item) => item.status === 'New Lead').length,
    property: enquiries.filter((item) => item.listing_type === 'property').length,
    vehicle: enquiries.filter((item) => item.listing_type === 'vehicle').length,
  }), [enquiries])

  if (loading) {
    return <div className="enquiries-loading">Loading enquiries portal…</div>
  }

  if (!session) {
    return (
      <main className="enquiries-shell enquiries-login-shell">
        <div className="enquiries-login-card">
          <button className="enquiries-back" onClick={() => (window.location.href = '/admin')}>
            <ArrowLeft size={17} /> Back to admin
          </button>

          <div className="enquiries-brand-mark">U</div>
          <span className="enquiries-eyebrow">UKALISM MARKETPLACE</span>
          <h1>Enquiries</h1>
          <p>Sign in to view and manage property and vehicle leads.</p>

          {!ADMIN_EMAIL && (
            <div className="enquiries-alert error">Admin email is not configured.</div>
          )}
          {error && <div className="enquiries-alert error">{error}</div>}

          <form onSubmit={handleLogin} className="enquiries-login-form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button className="enquiries-primary" disabled={authLoading || !ADMIN_EMAIL}>
              {authLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="enquiries-shell enquiries-login-shell">
        <div className="enquiries-login-card">
          <div className="enquiries-brand-mark">U</div>
          <span className="enquiries-eyebrow">UKALISM MARKETPLACE</span>
          <h1>Access denied</h1>
          <p>The signed-in account is not authorised to manage enquiries.</p>
          <button className="enquiries-primary" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="enquiries-shell">
      <header className="enquiries-header">
        <div>
          <span className="enquiries-eyebrow">UKALISM MARKETPLACE</span>
          <h1>Enquiries & Leads</h1>
          <p>Manage customer interest from property and vehicle listings.</p>
        </div>
        <div className="enquiries-header-actions">
          <button className="enquiries-secondary" onClick={() => (window.location.href = '/admin')}>
            <ArrowLeft size={17} /> Properties
          </button>
          <button className="enquiries-secondary" onClick={handleLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </header>

      <section className="enquiries-content">
        <div className="enquiries-stats">
          <article><span>Total enquiries</span><strong>{counts.total}</strong></article>
          <article><span>New leads</span><strong>{counts.new}</strong></article>
          <article><span>Property</span><strong>{counts.property}</strong></article>
          <article><span>Vehicle</span><strong>{counts.vehicle}</strong></article>
        </div>

        {message && <div className="enquiries-alert success">{message}</div>}
        {error && <div className="enquiries-alert error">{error}</div>}

        <section className="enquiries-panel">
          <div className="enquiries-toolbar">
            <div className="enquiries-search">
              <Search size={17} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer, listing, phone or email…"
              />
            </div>

            <div className="enquiries-filters">
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">All types</option>
                <option value="property">Properties</option>
                <option value="vehicle">Vehicles</option>
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
              </select>
              <button
                className="enquiries-icon-button"
                onClick={loadEnquiries}
                disabled={loadingData}
                aria-label="Refresh enquiries"
              >
                <RefreshCw size={17} className={loadingData ? 'spinning' : ''} />
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="enquiries-empty">Loading enquiries…</div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="enquiries-empty">
              <strong>No enquiries found</strong>
              <span>Try changing your search or filters.</span>
            </div>
          ) : (
            <div className="enquiries-list">
              {filteredEnquiries.map((enquiry) => {
                const whatsappMessage = encodeURIComponent(
                  `Hi ${enquiry.name}, this is Ukalism regarding your enquiry for ${enquiry.listing_title}.`,
                )

                return (
                  <article className="enquiry-card" key={enquiry.id}>
                    <div className="enquiry-card-top">
                      <div className="enquiry-listing-type">
                        {enquiry.listing_type === 'vehicle' ? <CarFront size={16} /> : <Home size={16} />}
                        {enquiry.listing_type === 'vehicle' ? 'Vehicle' : 'Property'} enquiry
                      </div>
                      <span className={`enquiry-status ${statusClass(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </div>

                    <div className="enquiry-main">
                      <div className="enquiry-customer">
                        <h2>{enquiry.name}</h2>
                        <div className="enquiry-contact-links">
                          <a href={`tel:${enquiry.phone}`}><Phone size={15} /> {enquiry.phone}</a>
                          {enquiry.email && <a href={`mailto:${enquiry.email}`}><Mail size={15} /> {enquiry.email}</a>}
                        </div>
                      </div>
                      <div className="enquiry-listing">
                        <span>Interested in</span>
                        <strong>{enquiry.listing_title}</strong>
                        <small>Listing ID #{enquiry.listing_id}</small>
                      </div>
                    </div>

                    {enquiry.message && (
                      <div className="enquiry-message">
                        <span>Message</span>
                        <p>{enquiry.message}</p>
                      </div>
                    )}

                    <div className="enquiry-card-bottom">
                      <small>{formatDate(enquiry.created_at)}</small>
                      <div className="enquiry-actions">
                        <a
                          className="enquiries-action whatsapp"
                          href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={15} /> WhatsApp
                        </a>
                        <select
                          className="enquiry-status-select"
                          value={enquiry.status}
                          onChange={(event) => handleStatusChange(enquiry, event.target.value)}
                          disabled={updatingId === enquiry.id}
                        >
                          {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <button className="enquiries-action delete" onClick={() => handleDelete(enquiry)}>
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default EnquiriesAdmin
