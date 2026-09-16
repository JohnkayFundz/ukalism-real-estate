import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import properties from '../data/properties'
import autos from '../data/autos'
import EnquiryForm from './EnquiryForm'
import './MarketplaceEnquiryBridge.css'

function findActiveListing() {
  const propertyPage = document.querySelector('.property-details-page')
  if (propertyPage) {
    const title = propertyPage.querySelector('h1')?.textContent?.trim()
    const property = properties.find((item) => item.title === title)
    if (property) return { listingType: 'property', listingId: property.id, listingTitle: property.title }
  }

  const vehiclePage = document.querySelector('.autos-details-page')
  if (vehiclePage) {
    const title = vehiclePage.querySelector('h1')?.textContent?.trim()
    const vehicle = autos.find((item) => item.title === title)
    if (vehicle) return { listingType: 'vehicle', listingId: vehicle.id, listingTitle: vehicle.title }
  }

  return null
}

function MarketplaceEnquiryBridge() {
  const [listing, setListing] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const syncListing = () => {
      const next = findActiveListing()
      setListing((current) => next?.listingId === current?.listingId && next?.listingType === current?.listingType ? current : next)
      if (!next) setOpen(false)
    }

    const handleClick = (event) => {
      const trigger = event.target.closest('.details-whatsapp, .autos-primary')
      if (!trigger) return
      const next = findActiveListing()
      if (!next) return
      event.preventDefault()
      event.stopPropagation()
      setListing(next)
      setOpen(true)
    }

    syncListing()
    const observer = new MutationObserver(syncListing)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', handleClick, true)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  if (!listing) return null

  return (
    <>
      <button className="marketplace-enquiry-trigger" onClick={() => setOpen(true)}>
        Send Enquiry <ArrowRight size={17} />
      </button>

      {open && (
        <div className="marketplace-enquiry-overlay" role="dialog" aria-modal="true" aria-label="Send enquiry">
          <button className="marketplace-enquiry-backdrop" aria-label="Close enquiry" onClick={() => setOpen(false)} />
          <div className="marketplace-enquiry-modal">
            <button className="marketplace-enquiry-close" onClick={() => setOpen(false)} aria-label="Close enquiry"><X size={20} /></button>
            <div className="marketplace-enquiry-listing">
              <span>{listing.listingType === 'vehicle' ? 'Ukalism Autos' : 'Ukalism Real Estate'}</span>
              <strong>{listing.listingTitle}</strong>
            </div>
            <EnquiryForm {...listing} compact />
          </div>
        </div>
      )}
    </>
  )
}

export default MarketplaceEnquiryBridge
