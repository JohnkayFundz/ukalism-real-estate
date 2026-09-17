import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, CarFront, LogOut } from 'lucide-react'
import { ADMIN_EMAIL, supabase } from '../lib/supabase'
import './AdminPage.css'

function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()

  if (loading) return <div className="admin-loading">Loading admin portal…</div>

  if (!session) {
    window.location.href = '/admin/properties'
    return null
  }

  if (!isAdmin) {
    return (
      <main className="admin-shell admin-login-shell">
        <div className="admin-login-card">
          <div className="admin-brand-mark">U</div>
          <span className="admin-eyebrow">UKALISM PROPERTIES & AUTOS</span>
          <h1>Access denied</h1>
          <p>The signed-in account is not authorised to manage this website.</p>
          <button className="admin-primary-button" onClick={() => supabase.auth.signOut()}>
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
          <span className="admin-eyebrow">UKALISM PROPERTIES & AUTOS</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your property and vehicle inventory from one place.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-secondary-button" onClick={() => { window.location.href = '/' }}>
            <ArrowLeft size={17} /> Website
          </button>
          <button className="admin-secondary-button" onClick={() => supabase.auth.signOut()}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-dashboard-grid">
          <button className="admin-dashboard-card" onClick={() => { window.location.href = '/admin/properties' }}>
            <span className="admin-dashboard-icon"><Building2 size={30} /></span>
            <span className="admin-eyebrow">PROPERTY INVENTORY</span>
            <h2>Manage Properties</h2>
            <p>Add, edit, delete and upload photos or videos for property listings.</p>
            <span className="admin-dashboard-link">Open property management →</span>
          </button>

          <button className="admin-dashboard-card" onClick={() => { window.location.href = '/admin/autos' }}>
            <span className="admin-dashboard-icon"><CarFront size={30} /></span>
            <span className="admin-eyebrow">AUTO INVENTORY</span>
            <h2>Manage Autos</h2>
            <p>Add, edit, delete and upload photos or videos for vehicle listings.</p>
            <span className="admin-dashboard-link">Open auto management →</span>
          </button>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard
