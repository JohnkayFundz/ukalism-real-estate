import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Edit3,
  LogOut,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { ADMIN_EMAIL, supabase } from '../lib/supabase'
import './AdminPage.css'

const emptyForm = {
  title: '',
  location: '',
  type: 'For Sale',
  category: 'House',
  price: '',
  beds: '',
  baths: '',
  area: '',
  images: '',
  description: '',
  features: '',
}

const toLines = (value) =>
  Array.isArray(value) ? value.join('\n') : value || ''

const rowToForm = (property) => ({
  title: property.title || '',
  location: property.location || '',
  type: property.type || 'For Sale',
  category: property.category || 'House',
  price: property.price || '',
  beds: property.beds ?? '',
  baths: property.baths ?? '',
  area: property.area || '',
  images: toLines(property.images),
  description: property.description || '',
  features: toLines(property.features),
})

const formToRow = (form) => ({
  title: form.title.trim(),
  location: form.location.trim(),
  type: form.type,
  category: form.category,
  price: form.price.trim(),
  beds: form.beds === '' ? null : Number(form.beds),
  baths: form.baths === '' ? null : Number(form.baths),
  area: form.area.trim(),
  images: form.images
    .split(/\n|,/) 
    .map((item) => item.trim())
    .filter(Boolean),
  description: form.description.trim(),
  features: form.features
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean),
})

function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
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
    if (isAdmin) loadProperties()
  }, [isAdmin])

  const loadProperties = async () => {
    setError('')
    const { data, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setProperties(data || [])
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
    setProperties([])
    setEditingId(null)
    setForm(emptyForm)
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setMessage('')
    setError('')
  }

  const startEdit = (property) => {
    setEditingId(property.id)
    setForm(rowToForm(property))
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const payload = formToRow(form)

    if (!payload.title || !payload.location || !payload.price) {
      setSaving(false)
      setError('Title, location and price are required.')
      return
    }

    const query = editingId
      ? supabase.from('properties').update(payload).eq('id', editingId)
      : supabase.from('properties').insert(payload)

    const { error: saveError } = await query

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    setMessage(editingId ? 'Property updated successfully.' : 'Property added successfully.')
    setEditingId(null)
    setForm(emptyForm)
    await loadProperties()
  }

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Delete “${property.title}”? This cannot be undone.`,
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', property.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    if (editingId === property.id) cancelEdit()
    setMessage('Property deleted.')
    await loadProperties()
  }

  if (loading) {
    return <div className="admin-loading">Loading admin portal…</div>
  }

  if (!session) {
    return (
      <main className="admin-shell admin-login-shell">
        <div className="admin-login-card">
          <button className="admin-back" onClick={() => (window.location.href = '/')}>
            <ArrowLeft size={17} /> Back to website
          </button>

          <div className="admin-brand-mark">U</div>
          <span className="admin-eyebrow">UKALISM REAL ESTATE</span>
          <h1>Admin Portal</h1>
          <p>Sign in to manage published property listings.</p>

          {!ADMIN_EMAIL && (
            <div className="admin-alert error">
              Admin email is not configured. Add VITE_ADMIN_EMAIL to your environment.
            </div>
          )}

          {error && <div className="admin-alert error">{error}</div>}

          <form onSubmit={handleLogin} className="admin-form">
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

            <button className="admin-primary-button" disabled={authLoading || !ADMIN_EMAIL}>
              {authLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="admin-shell admin-login-shell">
        <div className="admin-login-card">
          <div className="admin-brand-mark">U</div>
          <span className="admin-eyebrow">UKALISM REAL ESTATE</span>
          <h1>Access denied</h1>
          <p>The signed-in account is not authorised to manage this website.</p>
          <button className="admin-primary-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">UKALISM REAL ESTATE</span>
          <h1>Property Management</h1>
          <p>Signed in as {session.user.email}</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-secondary-button" onClick={() => (window.location.href = '/')}>
            <ArrowLeft size={17} /> Website
          </button>
          <button className="admin-secondary-button" onClick={handleLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-toolbar">
          <div>
            <strong>{properties.length}</strong> published properties
          </div>
          <button className="admin-primary-button" onClick={startCreate}>
            <Plus size={18} /> Add property
          </button>
        </div>

        {message && <div className="admin-alert success"><Check size={17} /> {message}</div>}
        {error && <div className="admin-alert error">{error}</div>}

        <form className="property-editor" onSubmit={handleSave}>
          <div className="editor-heading">
            <div>
              <span className="admin-eyebrow">{editingId ? 'EDIT LISTING' : 'NEW LISTING'}</span>
              <h2>{editingId ? 'Edit property' : 'Add a property'}</h2>
            </div>
            {editingId && (
              <button type="button" className="icon-button" onClick={cancelEdit} aria-label="Cancel editing">
                <X size={19} />
              </button>
            )}
          </div>

          <div className="editor-grid">
            <label>
              Property title *
              <input value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
            </label>
            <label>
              Location *
              <input value={form.location} onChange={(e) => updateField('location', e.target.value)} required />
            </label>
            <label>
              Listing type
              <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
                <option>For Sale</option>
                <option>For Rent</option>
              </select>
            </label>
            <label>
              Property type
              <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                <option>House</option>
                <option>Apartment</option>
                <option>Land</option>
              </select>
            </label>
            <label>
              Price *
              <input value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="₦185,000,000" required />
            </label>
            <label>
              Area
              <input value={form.area} onChange={(e) => updateField('area', e.target.value)} placeholder="450 sqm" />
            </label>
            <label>
              Bedrooms
              <input type="number" min="0" value={form.beds} onChange={(e) => updateField('beds', e.target.value)} />
            </label>
            <label>
              Bathrooms
              <input type="number" min="0" value={form.baths} onChange={(e) => updateField('baths', e.target.value)} />
            </label>
          </div>

          <label>
            Image URLs
            <textarea rows="4" value={form.images} onChange={(e) => updateField('images', e.target.value)} placeholder="One image URL per line" />
          </label>

          <label>
            Description
            <textarea rows="5" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
          </label>

          <label>
            Features
            <textarea rows="5" value={form.features} onChange={(e) => updateField('features', e.target.value)} placeholder="One feature per line" />
          </label>

          <div className="editor-actions">
            {editingId && (
              <button type="button" className="admin-secondary-button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
            <button type="submit" className="admin-primary-button" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish property'}
            </button>
          </div>
        </form>

        <section className="admin-list">
          <div className="list-heading">
            <div>
              <span className="admin-eyebrow">LIVE INVENTORY</span>
              <h2>Published properties</h2>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="empty-state">No properties have been published yet.</div>
          ) : (
            <div className="property-admin-grid">
              {properties.map((property) => (
                <article className="property-admin-card" key={property.id}>
                  <div className="property-admin-image">
                    {property.images?.[0] && <img src={property.images[0]} alt={property.title} />}
                    <span>{property.type}</span>
                  </div>
                  <div className="property-admin-body">
                    <span>{property.location}</span>
                    <h3>{property.title}</h3>
                    <strong>{property.price}</strong>
                    <div className="property-admin-actions">
                      <button className="admin-secondary-button" onClick={() => startEdit(property)}>
                        <Edit3 size={16} /> Edit
                      </button>
                      <button className="admin-danger-button" onClick={() => handleDelete(property)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default AdminPage
