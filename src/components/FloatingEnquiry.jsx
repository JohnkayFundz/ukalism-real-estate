import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import EnquiryForm from './EnquiryForm'
import './FloatingEnquiry.css'

function FloatingEnquiry() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="floating-enquiry-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open property enquiry form"
      >
        <MessageSquare size={19} />
        <span>Send an Enquiry</span>
      </button>

      {open && (
        <div className="floating-enquiry-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <div className="floating-enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="floating-enquiry-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="floating-enquiry-header">
              <div>
                <span>Direct contact</span>
                <h2 id="floating-enquiry-title">Tell Us What You’re Looking For</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close enquiry form"><X size={20} /></button>
            </div>
            <EnquiryForm
              listingType="General Property Enquiry"
              listingId={0}
              listingTitle="your preferred property"
              compact
            />
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingEnquiry
