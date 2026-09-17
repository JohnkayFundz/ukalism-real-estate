import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './premium.css'
import AdminPage from './admin/AdminPage.jsx'
import Autos from './Autos.jsx'
import AutosAdmin from './admin/AutosAdmin.jsx'
import FloatingEnquiry from './components/FloatingEnquiry.jsx'
import AdminShortcut from './components/AdminShortcut.jsx'

const pathname = window.location.pathname
const isAutosAdminRoute = pathname === '/admin/autos' || pathname.startsWith('/admin/autos/')
const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
const isAutosRoute = pathname === '/autos' || pathname.startsWith('/autos/')
const isPublicPropertyRoute = !isAdminRoute && !isAutosRoute && !isAutosAdminRoute

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAutosAdminRoute ? (
      <AutosAdmin />
    ) : isAdminRoute ? (
      <AdminPage />
    ) : isAutosRoute ? (
      <Autos />
    ) : (
      <>
        <App />
        {isPublicPropertyRoute && <FloatingEnquiry />}
        {isPublicPropertyRoute && <AdminShortcut />}
      </>
    )}
  </StrictMode>,
)
