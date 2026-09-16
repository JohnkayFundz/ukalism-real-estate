import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './premium.css'
import AdminPage from './admin/AdminPage.jsx'
import Autos from './Autos.jsx'

const pathname = window.location.pathname
const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
const isAutosRoute = pathname === '/autos' || pathname.startsWith('/autos/')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminPage /> : isAutosRoute ? <Autos /> : <App />}
  </StrictMode>,
)
