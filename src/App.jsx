import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CarFront,
  Check,
  ChevronDown,
  Home,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import fallbackProperties from './data/properties'
import './App.css'
import './home-autos.css'

const WHATSAPP_NUMBER = '2349041367161'

const videoFrameStyle = {
  width: '100%',
  aspectRatio: '16 / 9',
  display: 'block',
  border: 0,
  borderRadius: '18px',
  background: '#111',
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [location, setLocation] = useState('Any Location')
  const [propertyType, setPropertyType] = useState('Any Property')
  const [listingType, setListingType] = useState('All')
  const [currentImage, setCurrentImage] = useState(0)
  const [autos, setAutos] = useState([])
  const [autosLoading, setAutosLoading] = useState(true)
  const [properties, setProperties] = useState(fallbackProperties)
  const [propertiesLoading, setPropertiesLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase
      .from('properties')
      .select('*')
      .eq('is_demo', false)
      .order('id', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (!error && Array.isArray(data)) setProperties(data)
        setPropertiesLoading(false)
      })
      .catch(() => {
        if (active) setPropertiesLoading(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    supabase
      .from('vehicles')
      .select('id,title,make,model,year,condition,price,location,mileage,transmission,fuel_type,body_type,images,cover_image')
      .order('id', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!active) return
        setAutos(data || [])
        setAutosLoading(false)
      })
    return () => { active = false }
  }, [])

  const openProperty = (property) => {
    setSelectedProperty(property)
    setCurrentImage(0)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeProperty = () => {
    setSelectedProperty(null)
    setCurrentImage(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openAutos = () => {
    setMenuOpen(false)
    window.location.href = '/autos'
  }

  const getImages = (property) => {
    if (property?.images?.length) return property.images
    if (property?.image) return [property.image]
    return []
  }

  const nextImage = () => {
    const images = getImages(selectedProperty)
    if (!images.length) return
    setCurrentImage((previous) => (previous + 1) % images.length)
  }

  const previousImage = () => {
    const images = getImages(selectedProperty)
    if (!images.length) return
    setCurrentImage((previous) => (previous - 1 + images.length) % images.length)
  }

  const locationOptions = [...new Set(properties.map((property) => property.location).filter(Boolean))]

  const filteredProperties = properties.filter((property) => {
    const locationMatches =
      location === 'Any Location' ||
      property.location.toLowerCase().includes(location.toLowerCase())
    const propertyMatches = propertyType === 'Any Property' || property.category === propertyType
    const listingMatches = listingType === 'All' || property.type === listingType
    return locationMatches && propertyMatches && listingMatches
  })

  const hasActiveFilters =
    location !== 'Any Location' ||
    propertyType !== 'Any Property' ||
    listingType !== 'All'

  const clearFilters = () => {
    setLocation('Any Location')
    setPropertyType('Any Property')
    setListingType('All')
  }

  const scrollToSection = (id) => {
    setSelectedProperty(null)
    setMenuOpen(false)
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const sendWhatsApp = (property = null) => {
    const message = property
      ? `Hello Ukalism Properties & Autos, I am interested in the ${property.title} in ${property.location}. Please provide more information.`
      : 'Hello Ukalism Properties & Autos, I would like to enquire about your available properties.'
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (selectedProperty) {
    const images = getImages(selectedProperty)

    return (
      <div className="app">
        <header className="property-navbar">
          <button className="back-brand" onClick={closeProperty}>
            <span className="brand-mark">U</span>
            <span><strong>UKALISM</strong><small>PROPERTIES & AUTOS</small></span>
          </button>
          <button className="details-back" onClick={closeProperty}>
            <ArrowLeft size={18} /> Back to Properties
          </button>
        </header>

        <main className="property-details-page">
          <div className="details-container">
            <button className="mobile-back-button" onClick={closeProperty}>
              <ArrowLeft size={18} /> Back to Properties
            </button>

            <div className="details-gallery">
              <div className="details-image">
                {images.length > 0 && <img src={images[currentImage]} alt={selectedProperty.title} />}
                <span className="details-badge">{selectedProperty.type}</span>
                {images.length > 1 && (
                  <>
                    <button className="gallery-arrow gallery-arrow-left" onClick={previousImage} aria-label="Previous property image"><ArrowLeft size={20} /></button>
                    <button className="gallery-arrow gallery-arrow-right" onClick={nextImage} aria-label="Next property image"><ArrowRight size={20} /></button>
                    <div className="gallery-counter">{currentImage + 1} / {images.length}</div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="gallery-thumbnails">
                  {images.map((image, index) => (
                    <button key={`${image}-${index}`} className={`gallery-thumbnail ${currentImage === index ? 'active' : ''}`} onClick={() => setCurrentImage(index)}>
                      <img src={image} alt={`${selectedProperty.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="details-content">
              <div className="details-main">
                <div className="details-location"><MapPin size={18} />{selectedProperty.location}</div>
                <h1>{selectedProperty.title}</h1>
                <div className="details-price">{selectedProperty.price}</div>

                <div className="details-stats">
                  {selectedProperty.beds !== null && (
                    <div><BedDouble size={21} /><span><strong>{selectedProperty.beds}</strong><small>Bedrooms</small></span></div>
                  )}
                  {selectedProperty.baths !== null && (
                    <div><Home size={20} /><span><strong>{selectedProperty.baths}</strong><small>Bathrooms</small></span></div>
                  )}
                  <div><Building2 size={20} /><span><strong>{selectedProperty.area}</strong><small>Property Area</small></span></div>
                </div>

                <section className="details-section">
                  <h2>About This Property</h2>
                  <p>{selectedProperty.description}</p>
                </section>

                {selectedProperty.video_url && (
                  <section className="details-section property-video-section">
                    <h2>Property Video Tour</h2>
                    <div className="property-video-frame">
                      <video
                        src={selectedProperty.video_url}
                        controls
                        playsInline
                        preload="metadata"
                        style={videoFrameStyle}
                        aria-label={`Video tour of ${selectedProperty.title}`}
                      />
                    </div>
                  </section>
                )}

                <section className="details-section">
                  <h2>Property Features</h2>
                  <div className="feature-grid">
                    {selectedProperty.features.map((feature) => (
                      <div className="feature-item" key={feature}><Check size={17} /><span>{feature}</span></div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="details-sidebar">
                <div className="inspection-card">
                  <div className="inspection-icon"><ShieldCheck size={25} /></div>
                  <h3>Interested in this property?</h3>
                  <p>Speak directly with Ukalism Properties & Autos to request more information or arrange a property inspection.</p>
                  <button className="details-whatsapp" onClick={() => sendWhatsApp(selectedProperty)}>WhatsApp Agent <ArrowRight size={18} /></button>
                  <a className="details-call" href="tel:+2349041367161"><Phone size={18} />Call Agent</a>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <button className="brand" onClick={() => scrollToSection('home')}>
            <span className="brand-mark">U</span>
            <span className="brand-text"><strong>UKALISM</strong><small>PROPERTIES & AUTOS</small></span>
          </button>

          <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
            <button onClick={() => scrollToSection('home')}>Home</button>
            <button onClick={() => scrollToSection('properties')}>Properties</button>
            <button onClick={openAutos}>Autos</button>
            <button onClick={() => scrollToSection('services')}>Services</button>
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={() => scrollToSection('contact')}>Contact</button>
          </nav>

          <button className="nav-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <button className="nav-cta" onClick={() => sendWhatsApp()}>Contact Agent <ArrowRight size={17} /></button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-eyebrow"><Sparkles size={16} />Property & Vehicle Opportunities in Lagos</div>
            <h1>Find the Right Property.<br /><span>Or Your Next Vehicle. Move With Confidence.</span></h1>
            <p>Explore carefully selected properties for sale and rent, plus vehicle opportunities across Lagos. Get direct support to help you make a confident decision.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="hero-button" onClick={() => scrollToSection('properties')}>Explore Properties <ArrowRight size={19} /></button>
              <button className="hero-button" onClick={openAutos}>Explore Autos <CarFront size={19} /></button>
            </div>
          </div>
          <div className="hero-search">
            <div className="search-field"><MapPin size={19} /><div><label>Location</label><select value={location} onChange={(event) => setLocation(event.target.value)}><option>Any Location</option>{locationOptions.map((item) => <option key={item}>{item}</option>)}</select></div><ChevronDown size={16} /></div>
            <div className="search-divider" />
            <div className="search-field"><Home size={19} /><div><label>Property Type</label><select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}><option>Any Property</option><option>House</option><option>Apartment</option><option>Land</option></select></div><ChevronDown size={16} /></div>
            <button className="search-button" onClick={() => scrollToSection('properties')}><Search size={19} />Search</button>
          </div>
        </section>

        <section className="trust-strip">
          <div><ShieldCheck size={25} /><span><strong>Trusted Service</strong>Personal guidance from search to decision</span></div>
          <div><Building2 size={25} /><span><strong>Quality Opportunities</strong>Carefully selected property options</span></div>
          <div><Phone size={25} /><span><strong>Direct Support</strong>Speak directly with our property and vehicle team</span></div>
        </section>

        <section className="section services-section" id="opportunities">
          <div className="section-heading centered">
            <span className="section-eyebrow">Explore Ukalism</span>
            <h2>Properties & Autos, In One Place</h2>
            <p>Whether you're looking for a home, land or a vehicle, start with the opportunity that matches what you need.</p>
          </div>
          <div className="services-grid">
            <button className="service-card" onClick={() => scrollToSection('properties')} style={{ textAlign: 'left', cursor: 'pointer' }}>
              <div className="service-icon"><Building2 size={23} /></div>
              <h3>Explore Properties</h3>
              <p>Browse selected homes, apartments and land opportunities for sale and rent across Lagos.</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '12px', fontWeight: 600 }}>View Properties <ArrowRight size={16} /></span>
            </button>
            <button className="service-card" onClick={openAutos} style={{ textAlign: 'left', cursor: 'pointer' }}>
              <div className="service-icon"><CarFront size={23} /></div>
              <h3>Explore Autos</h3>
              <p>Discover available vehicle opportunities with details on condition, mileage, price and location.</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '12px', fontWeight: 600 }}>View Autos <ArrowRight size={16} /></span>
            </button>
          </div>
        </section>

        <section className="section properties-section" id="properties">
          <div className="section-heading">
            <div><span className="section-eyebrow">Featured Properties</span><h2>Explore Selected Properties</h2></div>
            <p>Browse selected homes, apartments and land opportunities across Lagos. When you find something that interests you, speak directly with our agent for availability, pricing and next steps.</p>
          </div>

          <div className="listing-filters">
            <div className="listing-filter-group">
              <button className={listingType === 'All' ? 'listing-filter active' : 'listing-filter'} onClick={() => setListingType('All')}>All Properties</button>
              <button className={listingType === 'For Sale' ? 'listing-filter active' : 'listing-filter'} onClick={() => setListingType('For Sale')}>For Sale</button>
              <button className={listingType === 'For Rent' ? 'listing-filter active' : 'listing-filter'} onClick={() => setListingType('For Rent')}>For Rent</button>
            </div>
            {hasActiveFilters && <button className="clear-filters" onClick={clearFilters}>Clear Filters <X size={15} /></button>}
          </div>

          <div className="property-results-bar"><span><strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available</span>{hasActiveFilters && <span className="filtered-label">Filtered results</span>}</div>

          {propertiesLoading ? (
            <div className="no-results"><Search size={30} /><h3>Loading properties</h3><p>We're loading the latest available property opportunities.</p></div>
          ) : filteredProperties.length > 0 ? (
            <div className="property-grid">
              {filteredProperties.map((property) => {
                const image = property.images?.[0] || property.image
                return (
                  <article className="property-card" key={property.id}>
                    <div className="property-image">
                      <img src={image} alt={property.title} />
                      <span className="property-badge">{property.type}</span>
                      <button className="property-image-button" onClick={() => openProperty(property)}><span className="view-property-label">View Property</span><ArrowRight size={18} /></button>
                    </div>
                    <div className="property-card-body">
                      <span className="property-category">{property.category}</span>
                      <h3>{property.title}</h3>
                      <div className="property-location"><MapPin size={15} />{property.location}</div>
                      <div className="property-card-bottom"><strong>{property.price}</strong><button className="property-details-button" onClick={() => openProperty(property)}>Details <ArrowRight size={15} /></button></div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="no-results"><Search size={30} /><h3>No properties found</h3><p>Try changing the location, property type or listing filter.</p><button className="outline-button" onClick={clearFilters}>Clear Filters</button></div>
          )}
        </section>

        <section className="section home-autos-section" id="featured-autos">
          <div className="section-heading">
            <div><span className="section-eyebrow">Featured Autos</span><h2>Selected Vehicle Opportunities</h2></div>
            <p>Explore vehicles currently published by Ukalism Properties & Autos. New vehicles added through the private admin portal appear here automatically.</p>
          </div>

          {autosLoading ? (
            <div className="home-autos-grid" aria-label="Loading vehicle inventory">
              {[1, 2, 3].map((item) => <div className="home-auto-card home-auto-skeleton" key={item}><div /><span /><strong /><small /></div>)}
            </div>
          ) : autos.length ? (
            <div className="home-autos-grid">
              {autos.map((vehicle) => { const coverImage = vehicle.cover_image || (vehicle.images?.length ? vehicle.images[vehicle.images.length - 1] : null); return (
                <article className="home-auto-card" key={vehicle.id}>
                  <div className="home-auto-image">
                    {coverImage ? <img src={coverImage} alt={vehicle.title} loading="lazy" /> : <CarFront size={42} />}
                    <span>{vehicle.condition || 'Available'}</span>
                  </div>
                  <div className="home-auto-body">
                    <div className="home-auto-meta"><span>{vehicle.year}</span><span>{vehicle.body_type}</span></div>
                    <h3>{vehicle.title}</h3>
                    <div className="home-auto-location"><MapPin size={14} />{vehicle.location}</div>
                    <strong className="home-auto-price">{vehicle.price}</strong>
                    <button className="outline-button home-auto-button" onClick={openAutos}>View Vehicle <ArrowRight size={16} /></button>
                  </div>
                </article>
              )})}
            </div>
          ) : (
            <div className="no-results home-autos-empty"><CarFront size={30} /><h3>Vehicle inventory coming soon</h3><p>Our latest vehicle opportunities will appear here as they are published.</p><button className="outline-button" onClick={openAutos}>Explore Autos <ArrowRight size={16} /></button></div>
          )}
        </section>

        <section className="section services-section" id="services">
          <div className="section-heading centered"><span className="section-eyebrow">What We Do</span><h2>Real Estate & Vehicle Support Made Simpler</h2><p>Whether you're buying, renting or exploring your next vehicle opportunity, Ukalism Properties & Autos provides straightforward guidance from your first enquiry to your next decision.</p></div>
          <div className="services-grid">
            <div className="service-card"><div className="service-icon"><Search size={23} /></div><h3>Property Search</h3><p>Tell us your preferred location, property type and budget, and we'll help you identify suitable options.</p></div>
            <div className="service-card"><div className="service-icon"><Building2 size={23} /></div><h3>Property Sales</h3><p>Explore available properties and receive direct guidance as you evaluate your purchase options.</p></div>
            <div className="service-card"><div className="service-icon"><Home size={23} /></div><h3>Property Rentals</h3><p>Find residential rental opportunities that fit your location, lifestyle and budget.</p></div>
            <div className="service-card"><div className="service-icon"><CarFront size={23} /></div><h3>Vehicle Opportunities</h3><p>Explore available autos with key details and speak directly with the team about your preferred vehicle.</p></div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="about-image"><img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=85" alt="Modern Lagos property" /></div>
          <div className="about-content">
            <span className="section-eyebrow">About Ukalism</span>
            <h2>More Than Properties.<br />We Help You Move Forward.</h2>
            <p>Ukalism Properties & Autos helps individuals, families and buyers discover property and vehicle opportunities that match their goals in Lagos. We believe important purchase decisions should be clear, personal and well-informed, which is why we provide direct support throughout the process.</p>
            <div className="about-checks">
              <div><Check size={17} />Professional and personal service</div>
              <div><Check size={17} />Opportunities selected with your needs in mind</div>
              <div><Check size={17} />Direct client support</div>
            </div>
            <button className="outline-button" onClick={() => sendWhatsApp()}>Speak With Our Team <ArrowRight size={18} /></button>
          </div>
        </section>

        <section className="cta-section" id="contact">
          <div><span className="section-eyebrow">Let's Find Your Next Opportunity</span><h2>Looking for a Property or Vehicle?</h2><p>Tell us what you're looking for, where you want to be and your preferred budget. Let's help you take the next step with confidence.</p></div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="cta-button" onClick={() => scrollToSection('properties')}>View Properties <ArrowRight size={19} /></button>
            <button className="cta-button" onClick={openAutos}>View Autos <CarFront size={19} /></button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <button className="brand" onClick={() => scrollToSection('home')}><span className="brand-mark">U</span><span className="brand-text"><strong>UKALISM</strong><small>PROPERTIES & AUTOS</small></span></button>
            <p>Property and vehicle opportunities across Lagos, Nigeria.</p>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <a href="tel:+2349041367161"><Phone size={16} />+234 904 136 7161</a>
            <a href="mailto:Sundayu676@gmail.com">Sundayu676@gmail.com</a>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Ukalism Properties & Autos.</span><span>More Than Properties. We Help You Move Forward.</span></div>
      </footer>
    </div>
  )
}

export default App