import { useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './EnquiryForm.css'

const initialForm = { name: '', phone: '', email: '', message: '' }

function EnquiryForm({ listingType, listingId, listingTitle, compact = false }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }

    setStatus('submitting')
    const { error: insertError } = await supabase.from('enquiries').insert({
      listing_type: listingType,
      listing_id: Number(listingId),
      listing_title: listingTitle,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      message: form.message.trim(),
    })

    if (insertError) {
      console.error(insertError)
      setError('We could not submit your enquiry. Please try again or contact the agent directly.')
      setStatus('idle')
      return
    }

    setForm(initialForm)
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className={`enquiry-success ${compact ? 'compact' : ''}`}>
        <CheckCircle2 size={30} />
        <h3>Enquiry received</h3>
        <p>Thank you. Ukalism will contact you about <strong>{listingTitle}</strong>.</p>
        <button onClick={() => setStatus('idle')}>Send another enquiry</button>
      </div>
    )
  }

  return (
    <form className={`enquiry-form ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <div className="enquiry-form-heading">
        <span>Direct enquiry</span>
        <h3>Interested in this {listingType}?</h3>
        <p>Send your details and we will follow up with you.</p>
      </div>
      <label>Name<input name="name" value={form.name} onChange={updateField} placeholder="Your full name" autoComplete="name" required /></label>
      <label>Phone<input name="phone" value={form.phone} onChange={updateField} placeholder="080..." autoComplete="tel" required /></label>
      <label>Email <span>(optional)</span><input name="email" value={form.email} onChange={updateField} placeholder="you@example.com" type="email" autoComplete="email" /></label>
      <label>Message<textarea name="message" value={form.message} onChange={updateField} placeholder={`I am interested in ${listingTitle}...`} rows={4} /></label>
      {error && <p className="enquiry-error" role="alert">{error}</p>}
      <button className="enquiry-submit" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? <><Loader2 size={17} className="enquiry-spinner" /> Sending...</> : <><Send size={17} /> Send Enquiry</>}
      </button>
    </form>
  )
}

export default EnquiryForm
