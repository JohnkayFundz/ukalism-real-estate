import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Fuel, Gauge, MapPin, Play, Search, Settings2, X } from 'lucide-react'
import { supabase } from './lib/supabase'
import fallbackAutos from './data/autos'
import './autos.css'

const WHATSAPP_NUMBER = '2349041367161'
const conditions = ['All Conditions', 'Brand New', 'Foreign Used', 'Nigerian Used']
const bodyTypes = ['All Body Types', 'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Van', 'Truck', 'Bus', 'Motorcycle']
const transmissions = ['All Transmissions', 'Automatic', 'Manual', 'CVT', 'AMT']
const fuels = ['All Fuel Types', 'Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric']

function AutosLive() {
  const [autos, setAutos] = useState(fallbackAutos)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [condition, setCondition] = useState('All Conditions')
  const [bodyType, setBodyType] = useState('All Body Types')
  const [transmission, setTransmission] = useState('All Transmissions')
  const [fuel, setFuel] = useState('All Fuel Types')
  const [make, setMake] = useState('All Makes')
  const [selected, setSelected] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    let active = true
    supabase.from('vehicles').select('*').order('id', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (!error && data?.length) setAutos(data)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const makes = useMemo(() => ['All Makes', ...new Set(autos.map((auto) => auto.make).filter(Boolean))], [autos])
  const filtered = useMemo(() => autos.filter((auto) => {
    const haystack = `${auto.title} ${auto.make} ${auto.model} ${auto.location}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) &&
      (make === 'All Makes' || auto.make === make) &&
      (condition === 'All Conditions' || auto.condition === condition) &&
      (bodyType === 'All Body Types' || auto.body_type === bodyType) &&
      (transmission === 'All Transmissions' || auto.transmission === transmission) &&
      (fuel === 'All Fuel Types' || auto.fuel_type === fuel)
  }), [autos, query, make, condition, bodyType, transmission, fuel])

  const clearFilters = () => { setQuery(''); setMake('All Makes'); setCondition('All Conditions'); setBodyType('All Body Types'); setTransmission('All Transmissions'); setFuel('All Fuel Types') }
  const openVehicle = (vehicle) => { setSelected(vehicle); setCurrentImage(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const sendWhatsApp = (vehicle = selected) => {
    const message = vehicle ? `Hello Ukalism Properties & Autos, I am interested in the ${vehicle.title} in ${vehicle.location}. Please provide more information.` : 'Hello Ukalism Properties & Autos, I would like to enquire about available vehicles.'
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (selected) {
    const images = selected.images || []
    return <div className="autos-page autos-details-page"><header className="autos-header"><button className="autos-brand" onClick={() => setSelected(null)}><span>U</span><strong>UKALISM</strong><small>AUTOS</small></button><button className="autos-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Back to Autos</button></header><main className="autos-details-shell"><button className="autos-mobile-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Back to Autos</button><div className="vehicle-gallery"><div className="vehicle-hero-image">{images[0] && <img src={images[currentImage]} alt={selected.title} />}{selected.is_demo && <span className="video-pill">Demo Listing</span>}{selected.video_url && <span className="video-pill"><Play size={14} /> Video tour</span>}{images.length > 1 && <><button onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)} className="gallery-nav left"><ArrowLeft size={20} /></button><button onClick={() => setCurrentImage((currentImage + 1) % images.length)} className="gallery-nav right"><ArrowRight size={20} /></button></>}</div>{images.length > 1 && <div className="vehicle-thumbs">{images.map((image, index) => <button className={index === currentImage ? 'active' : ''} key={`${image}-${index}`} onClick={() => setCurrentImage(index)}><img src={image} alt={`${selected.title} ${index + 1}`} /></button>)}</div>}</div><div className="vehicle-details-grid"><section><div className="vehicle-location"><MapPin size={17} /> {selected.location}</div><h1>{selected.title}</h1><div className="vehicle-price">{selected.price}</div><div className="vehicle-spec-grid"><div><strong>{selected.year}</strong><span>Year</span></div><div><strong>{Number(selected.mileage || 0).toLocaleString()} km</strong><span>Mileage</span></div><div><strong>{selected.transmission}</strong><span>Transmission</span></div><div><strong>{selected.fuel_type}</strong><span>Fuel</span></div><div><strong>{selected.body_type}</strong><span>Body type</span></div><div><strong>{selected.condition}</strong><span>Condition</span></div></div>{selected.video_url && <section className="vehicle-section"><h2>Vehicle Video Tour</h2><video className="vehicle-video" src={selected.video_url} controls playsInline preload="metadata" /></section>}<section className="vehicle-section"><h2>About This Vehicle</h2><p>{selected.description}</p></section><section className="vehicle-section"><h2>Features</h2><div className="vehicle-features">{(selected.features || []).map((feature) => <span key={feature}>{feature}</span>)}</div></section></section><aside className="vehicle-contact-card"><div className="contact-card-icon"><Gauge size={24} /></div><h2>Interested in this vehicle?</h2><p>{selected.is_demo ? 'This is a demonstration listing. Contact Ukalism Properties & Autos when verified inventory is available.' : 'Contact Ukalism Properties & Autos for availability, additional photos, inspection details and next steps.'}</p><button onClick={() => sendWhatsApp()} className="autos-primary">WhatsApp Seller <ArrowRight size={17} /></button><a href="tel:+2349041367161" className="autos-secondary">Call +234 904 136 7161</a></aside></div></main></div>
  }

  return <div className="autos-page"><header className="autos-header"><a className="autos-brand" href="/"><span>U</span><strong>UKALISM</strong><small>AUTOS</small></a><a className="autos-realestate" href="/">Real Estate <ArrowRight size={15} /></a></header><main><section className="autos-hero"><div className="autos-hero-content"><span className="autos-eyebrow">Ukalism Properties & Autos</span><h1>Find Your Next Vehicle With Confidence.</h1><p>Explore selected vehicle opportunities. Demo inventory is clearly marked and can be replaced by verified listings from the admin dashboard.</p></div></section><section className="autos-search-wrap"><div className="autos-search-bar"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search make, model or vehicle..." /></div><div className="autos-filter-grid"><label>Make<select value={make} onChange={(event) => setMake(event.target.value)}>{makes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Condition<select value={condition} onChange={(event) => setCondition(event.target.value)}>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Body type<select value={bodyType} onChange={(event) => setBodyType(event.target.value)}>{bodyTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Transmission<select value={transmission} onChange={(event) => setTransmission(event.target.value)}>{transmissions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Fuel type<select value={fuel} onChange={(event) => setFuel(event.target.value)}>{fuels.map((item) => <option key={item}>{item}</option>)}</select></label><button className="autos-clear" onClick={clearFilters}><X size={16} /> Clear filters</button></div></section><section className="autos-listings"><div className="autos-listings-heading"><div><span className="autos-eyebrow">Available Vehicles</span><h2>Explore Autos</h2></div><span>{loading ? 'Loading inventory…' : <><strong>{filtered.length}</strong> {filtered.length === 1 ? 'vehicle' : 'vehicles'}</>}</span></div>{filtered.length ? <div className="autos-grid">{filtered.map((vehicle) => <article className="auto-card" key={vehicle.id}><button className="auto-image" onClick={() => openVehicle(vehicle)}>{vehicle.images?.[0] && <img src={vehicle.images[0]} alt={vehicle.title} />}{vehicle.is_demo && <span>Demo Listing</span>}{!vehicle.is_demo && <span>{vehicle.condition}</span>}</button><div className="auto-card-body"><div className="auto-meta"><span>{vehicle.year}</span><span>{vehicle.body_type}</span></div><h3>{vehicle.title}</h3><div className="auto-location"><MapPin size={14} /> {vehicle.location}</div><div className="auto-specs"><span><Gauge size={14} /> {Number(vehicle.mileage || 0).toLocaleString()} km</span><span><Settings2 size={14} /> {vehicle.transmission}</span><span><Fuel size={14} /> {vehicle.fuel_type}</span></div><div className="auto-card-footer"><strong>{vehicle.price}</strong><button onClick={() => openVehicle(vehicle)}>View details <ArrowRight size={15} /></button></div></div></article>)}</div> : <div className="autos-empty"><Search size={30} /><h3>No vehicles found</h3><p>Try another make, condition or vehicle specification.</p><button onClick={clearFilters} className="autos-secondary">Clear filters</button></div>}</section></main></div>
}

export default AutosLive
