import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './premium.css'
import './luxury.css'
import './autos-refinement.css'
import AdminPage from './admin/AdminPage.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import Autos from './AutosLive.jsx'
import AutosAdmin from './admin/AutosAdmin.jsx'
import FloatingEnquiry from './components/FloatingEnquiry.jsx'

const pathname = window.location.pathname
const isAutosAdminRoute = pathname === '/admin/autos' || pathname.startsWith('/admin/autos/')
const isPropertyAdminRoute = pathname === '/admin/properties' || pathname.startsWith('/admin/properties/')
const isAdminRoute = pathname === '/admin'
const isAutosRoute = pathname === '/autos' || pathname.startsWith('/autos/')
const isPublicPropertyRoute = !isAdminRoute && !isPropertyAdminRoute && !isAutosAdminRoute && !isAutosRoute

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAutosAdminRoute ? (
      <AutosAdmin />
    ) : isPropertyAdminRoute ? (
      <AdminPage />
    ) : isAdminRoute ? (
      <AdminDashboard />
    ) : isAutosRoute ? (
      <Autos />
    ) : (
      <>
        <App />
        {isPublicPropertyRoute && <FloatingEnquiry />}
      </>
    )}
  </StrictMode>,
)
