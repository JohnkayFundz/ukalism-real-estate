import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './premium.css'
import AdminPage from './admin/AdminPage.jsx'
import Autos from './Autos.jsx'
import AutosAdmin from './admin/AutosAdmin.jsx'
import EnquiriesAdmin from './admin/EnquiriesAdmin.jsx'
import MarketplaceEnquiryBridge from './components/MarketplaceEnquiryBridge.jsx'

const pathname = window.location.pathname
const isAutosAdminRoute = pathname === '/admin/autos' || pathname.startsWith('/admin/autos/')
const isEnquiriesAdminRoute = pathname === '/admin/enquiries' || pathname.startsWith('/admin/enquiries/')
const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
const isAutosRoute = pathname === '/autos' || pathname.startsWith('/autos/')

const page = isAutosAdminRoute
  ? <AutosAdmin />
  : isEnquiriesAdminRoute
    ? <EnquiriesAdmin />
    : isAdminRoute
      ? <AdminPage />
      : isAutosRoute
        ? <Autos />
        : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page}
    <MarketplaceEnquiryBridge />
  </StrictMode>,
)
