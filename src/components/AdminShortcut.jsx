import { CarFront, LayoutDashboard } from 'lucide-react'
import './AdminShortcut.css'

function AdminShortcut() {
  return (
    <div className="admin-shortcuts" aria-label="Admin shortcuts">
      <a className="admin-shortcut" href="/admin" aria-label="Open admin dashboard">
        <LayoutDashboard size={17} />
        <span>Admin Dashboard</span>
      </a>
      <a className="admin-shortcut admin-shortcut-secondary" href="/admin/autos" aria-label="Open autos inventory">
        <CarFront size={17} />
        <span>Autos Inventory</span>
      </a>
    </div>
  )
}

export default AdminShortcut
