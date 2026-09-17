import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  MapPin,
  Search,
  Settings2,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { supabase } from './lib/supabase'
import fallbackAutos from './data/autos'
import './autos.css'

const WHATSAPP_NUMBER = '2349041367161'
const conditions = ['All Conditions', 'Brand New', 'Foreign Used', 'Nigerian Used']
const bodyTypes = ['All Body Types', 'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Van', 'Truck', 'Bus', 'Motorcycle']
const transmissions = ['All Transmissions', 'Automatic', 'Manual', 'CVT', 'AMT']
const fuels = ['All Fuel Types', 'Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric']
const PAGE_SIZE = 6

const parsePrice = (value) => Number(String(value || '').replace(/[^0-9.]/g, '')) || 0

const formatShortNaira = (value) => {
  const amount = Number(value) || 0
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1).replace('.0', '')}B`
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}K`
  return `₦${amount.toLocaleString('en-NG')}`
}

function AutosLive() {
  const [autos, setAutos] = useState(fallbackAutos)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [condition, setCondition] = useState('All Conditions')
  const [bodyType, setBodyType] = useState('All Body Types')
  const [transmission, setTransmission] = useState('All Transmissions')
  const [fuel, setFuel] = useState('All Fuel Types')
  const [make, setMake] = useState('All Makes')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [quickFilter, setQuickFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        if (data?.length) setAutos(data)
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  const priceBounds = useMemo(() => {
    const prices = autos.map((auto) => parsePrice(auto.price)).filter(Boolean)
    const min = prices.length ? Math.floor(Math.min(...prices) / 1_000_000) * 1_000_000 : 0
    const max = prices.length ? Math.ceil(Math.max(...prices) / 1_000_000) * 1_000_000 : 100_000_000
    return { min, max: Math.max(max, min + 1_000_000) }
  }, [autos])

  useEffect(() => {
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
  }, [priceBounds.min, priceBounds.max])

  const makes = useMemo(() => ['All Makes', ...new Set(autos.map((auto) => auto.make).filter(Boolean))], [autos])

  const filtered = useMemo(() => autos.filter((auto) => {
    const haystack = `${auto.title} ${auto.make} ${auto.model} ${auto.location}`.toLowerCase()
    const price = parsePrice(auto.price)
    const queryMatch = !query || haystack.includes(query.toLowerCase())
    const quickMatch = quickFilter === 'All'
      || (quickFilter === 'Luxury Sedans' && auto.body_type === 'Sedan' && price >= 20_000_000)
      || (quickFilter === 'Family SUVs' && auto.body_type === 'SUV')
      || (quickFilter === 'Commercial' && ['Van', 'Truck', 'Bus'].includes(auto.body_type))

    return queryMatch && quickMatch &&
      (make === 'All Makes' || auto.make === make) &&
      (condition === 'All Conditions' || auto.condition === condition) &&
      (bodyType === 'All Body Types' || auto.body_type === bodyType) &&
      (transmission === 'All Transmissions' || auto.transmission === transmission) &&
      (fuel === 'All Fuel Types' || auto.fuel_type === fuel) &&
      price >= minPrice && price <= maxPrice
  }), [autos, query, make, condition, bodyType, transmission, fuel, minPrice, maxPrice, quickFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visibleAutos = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [query, make, condition, bodyType, transmission, fuel, minPrice, maxPrice, quickFilter])

  const clearFilters = () => {
    setQuery('')
    setMake('All Makes')
    setCondition('All Conditions')
    setBodyType('All Body Types')
    setTransmission('All Transmissions')
    setFuel('All Fuel Types')
    setQuickFilter('All')
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
    setFilterOpen(false)
  }

  const openVehicle = (vehicle) => {
    setSelected(vehicle)
    setCurrentImage(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sendWhatsApp = (vehicle = selected) => {
    const message = vehicle
      ? `Hello Ukalism Properties & Autos, I am interested in the ${vehicle.title} in ${vehicle.location}. Please provide more information.`
      : 'Hello Ukalism Properties & Autos, I would like to enquire about available vehicles.'
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (selected) {
    const images = selected.images || []
    return (
      <div className="autos-page autos-details-page">
        <header className="autos-header">
          <button className="autos-brand" onClick={() => setSelected(null)} aria-label="Back to Ukalism Autos">
            <span>U</span><strong>UKALISM</strong><small>AUTOS</small>
          </button>
          <button className="autos-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Back to Autos</button>
        </header>

        <main className="autos-details-shell">
          <button className="autos-mobile-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Back to Autos</button>
          <div className="vehicle-gallery">
            <div className="vehicle-hero-image">
              {images[0] && <img src={images[currentImage]} alt={selected.title} loading="eager" />}
              <span className="video-pill"><BadgeCheck size={14} /> Listing information</span>
              {images.length > 1 && <>
                <button onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)} className="gallery-nav left" aria-label="Previous vehicle image"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentImage((currentImage + 1) % images.length)} className="gallery-nav right" aria-label="Next vehicle image"><ChevronRight size={20} /></button>
              </>}
            </div>
            {images.length > 1 && <div className="vehicle-thumbs" aria-label="Vehicle image gallery">
              {images.map((image, index) => <button className={index === currentImage ? 'active' : ''} key={`${image}-${index}`} onClick={() => setCurrentImage(index)} aria-label={`Show image ${index + 1}`}><img src={image} alt="" loading="lazy" /></button>)}
            </div>}
          </div>

          <div className="vehicle-details-grid">
            <section>
              <div className="vehicle-location"><MapPin size={17} /> {selected.location}</div>
              <h1>{selected.title}</h1>
              <div className="vehicle-price">{selected.price}</div>
              <div className="vehicle-spec-grid">
                <div><strong>{selected.year}</strong><span>Year</span></div>
                <div><strong>{Number(selected.mileage || 0).toLocaleString()} km</strong><span>Mileage</span></div>
                <div><strong>{selected.transmission}</strong><span>Transmission</span></div>
                <div><strong>{selected.fuel_type}</strong><span>Fuel</span></div>
                <div><strong>{selected.body_type}</strong><span>Body type</span></div>
                <div><strong>{selected.condition}</strong><span>Condition</span></div>
              </div>

              {selected.video_url && <section className="vehicle-section"><h2>Vehicle Video Tour</h2><video className="vehicle-video" src={selected.video_url} controls playsInline preload="metadata" /></section>}
              <section className="vehicle-section"><h2>About This Vehicle</h2><p>{selected.description}</p></section>
              <section className="vehicle-section"><h2>Features</h2><div className="vehicle-features">{(selected.features || []).map((feature) => <span key={feature}>{feature}</span>)}</div></section>
            </section>

            <aside className="vehicle-contact-card">
              <div className="contact-card-icon"><BadgeCheck size={24} /></div>
              <h2>Interested in this vehicle?</h2>
              <p>Contact Ukalism Properties & Autos for availability, inspection details, additional photos and next steps.</p>
              <button onClick={() => sendWhatsApp()} className="autos-primary">WhatsApp Seller <ArrowRight size={17} /></button>
              <a href="tel:+2349041367161" className="autos-secondary">Call +234 904 136 7161</a>
            </aside>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="autos-page">
      <header className="autos-header">
        <a className="autos-brand" href="/" aria-label="Ukalism Properties & Autos home"><span>U</span><strong>UKALISM</strong><small>AUTOS</small></a>
        <a className="autos-realestate" href="/">Real Estate <ArrowRight size={15} /></a>
      </header>

      <main>
        <section className="autos-hero">
          <div className="autos-hero-content">
            <span className="autos-eyebrow">Ukalism Properties & Autos</span>
            <h1>Vehicles Worth Looking Twice At.</h1>
            <p>Explore selected vehicle opportunities with clear specifications, transparent listing information and direct support from enquiry to inspection.</p>
            <div className="autos-hero-trust"><BadgeCheck size={17} /> Listing information presented clearly</div>
          </div>
        </section>

        <section className="autos-search-wrap" aria-label="Vehicle search and filters">
          <div className="autos-search-bar">
            <Search size={20} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search make, model or vehicle..." aria-label="Search vehicles" />
          </div>

          <div className="quick-filter-row" role="group" aria-label="Quick vehicle filters">
            {['All', 'Luxury Sedans', 'Family SUVs', 'Commercial'].map((item) => (
              <button key={item} className={quickFilter === item ? 'quick-filter active' : 'quick-filter'} onClick={() => setQuickFilter(item)}>{item}</button>
            ))}
          </div>

          <button className="mobile-filter-trigger" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen}>
            <SlidersHorizontal size={17} /> {filterOpen ? 'Hide filters' : 'More filters'} <span>{filtered.length} matches</span>
          </button>

          <div className={`autos-filter-grid ${filterOpen ? 'mobile-open' : ''}`}>
            <label>Make<select value={make} onChange={(event) => setMake(event.target.value)}>{makes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Condition<select value={condition} onChange={(event) => setCondition(event.target.value)}>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Body type<select value={bodyType} onChange={(event) => setBodyType(event.target.value)}>{bodyTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Transmission<select value={transmission} onChange={(event) => setTransmission(event.target.value)}>{transmissions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Fuel type<select value={fuel} onChange={(event) => setFuel(event.target.value)}>{fuels.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="price-range-control">
              <div className="range-heading"><span>Budget</span><strong>{formatShortNaira(minPrice)} — {formatShortNaira(maxPrice)}</strong></div>
              <input type="range" min={priceBounds.min} max={priceBounds.max} step={1_000_000} value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 1_000_000))} aria-label="Minimum vehicle price" />
              <input type="range" min={priceBounds.min} max={priceBounds.max} step={1_000_000} value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 1_000_000))} aria-label="Maximum vehicle price" />
            </div>
            <button className="autos-clear" onClick={clearFilters}><X size={16} /> Clear filters</button>
          </div>
        </section>

        <section className="autos-listings">
          <div className="autos-listings-heading">
            <div><span className="autos-eyebrow">Available Vehicles</span><h2>Explore Autos</h2></div>
            <span>{loading ? 'Loading inventory…' : <><strong>{filtered.length}</strong> {filtered.length === 1 ? 'vehicle' : 'vehicles'}</>}</span>
          </div>

          {loading ? (
            <div className="autos-grid" aria-label="Loading vehicles">
              {Array.from({ length: 6 }).map((_, index) => <div className="auto-skeleton" key={index}><div className="skeleton-image" /><div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line wide" /></div>)}
            </div>
          ) : visibleAutos.length ? (
            <>
              <div className="autos-grid">
                {visibleAutos.map((vehicle, index) => (
                  <article className="auto-card" key={vehicle.id}>
                    <button className="auto-image" onClick={() => openVehicle(vehicle)} aria-label={`View ${vehicle.title}`}>
                      {vehicle.images?.[0] && <img src={vehicle.images[0]} alt={vehicle.title} loading={index < 3 ? 'eager' : 'lazy'} />}
                      <span>{vehicle.condition || 'Verified Listing'}</span>
                      {index === 0 && <em className="featured-badge">Featured</em>}
                    </button>
                    <div className="auto-card-body">
                      <div className="auto-meta"><span>{vehicle.year}</span><span>{vehicle.body_type}</span></div>
                      <h3>{vehicle.title}</h3>
                      <div className="auto-location"><MapPin size={14} /> {vehicle.location}</div>
                      <div className="auto-specs">
                        <span><Gauge size={14} /> {Number(vehicle.mileage || 0).toLocaleString()} km</span>
                        <span><Settings2 size={14} /> {vehicle.transmission}</span>
                        <span><Fuel size={14} /> {vehicle.fuel_type}</span>
                      </div>
                      <div className="auto-card-footer"><strong>{vehicle.price}</strong><button onClick={() => openVehicle(vehicle)}>View details <ArrowRight size={15} /></button></div>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && <nav className="autos-pagination" aria-label="Vehicle pagination">
                <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ArrowLeft size={16} /></button>
                <span>Page <strong>{page}</strong> of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ArrowRight size={16} /></button>
              </nav>}
            </>
          ) : (
            <div className="autos-empty"><Search size={30} /><h3>No vehicles found matching your filters</h3><p>Try another make, body type, budget or vehicle specification.</p><button onClick={clearFilters} className="autos-secondary">Reset search</button></div>
          )}
        </section>
      </main>

      <button className="mobile-bottom-filter" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={17} /> Filter vehicles <span>{filtered.length}</span></button>
    </div>
  )
}

export default AutosLive
