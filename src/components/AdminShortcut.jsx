import { LayoutDashboard } from 'lucide-react'
import './AdminShortcut.css'

function AdminShortcut() {
  return (
    <a className="admin-shortcut" href="/admin" aria-label="Open admin dashboard">
      <LayoutDashboard size={17} />
      <span>Admin Dashboard</span>
    </a>
  )
}

export default AdminShortcut
