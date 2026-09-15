import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
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
import { useState } from 'react'
import properties from './data/properties'
import './App.css'

const WHATSAPP_NUMBER = '2349041367161'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [location, setLocation] = useState('Any Location')
  const [propertyType, setPropertyType] = useState('Any Property')
  const [listingType, setListingType] = useState('All')
  const [currentImage, setCurrentImage] = useState(0)

  const openProperty = (property) => {
    setSelectedProperty(property)
    setCurrentImage(0)
    setMenuOpen(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const closeProperty = () => {
    setSelectedProperty(null)
    setCurrentImage(0)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const getImages = (property) => {
    if (property?.images?.length) {
      return property.images
    }

    if (property?.image) {
      return [property.image]
    }

    return []
  }

  const nextImage = () => {
    const images = getImages(selectedProperty)

    if (!images.length) {
      return
    }

    setCurrentImage(
      (previous) => (previous + 1) % images.length,
    )
  }

  const previousImage = () => {
    const images = getImages(selectedProperty)

    if (!images.length) {
      return
    }

    setCurrentImage(
      (previous) =>
        (previous - 1 + images.length) % images.length,
    )
  }

  const filteredProperties = properties.filter((property) => {
    const locationMatches =
      location === 'Any Location' ||
      property.location
        .toLowerCase()
        .includes(location.toLowerCase())

    const propertyMatches =
      propertyType === 'Any Property' ||
      property.category === propertyType

    const listingMatches =
      listingType === 'All' ||
      property.type === listingType

    return (
      locationMatches &&
      propertyMatches &&
      listingMatches
    )
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

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 50)
  }

  const sendWhatsApp = (property = null) => {
    const message = property
      ? `Hello Ukalism Real Estate, I am interested in the ${property.title} in ${property.location}. Please provide more information.`
      : 'Hello Ukalism Real Estate, I would like to enquire about your available properties.'

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`

    window.open(url, '_blank')
  }

  /*
   * PROPERTY DETAILS PAGE
   */
  if (selectedProperty) {
    const images = getImages(selectedProperty)

    return (
      <div className="app">
        <header className="property-navbar">
          <button
            className="back-brand"
            onClick={closeProperty}
          >
            <span className="brand-mark">U</span>

            <span>
              <strong>UKALISM</strong>
              <small>REAL ESTATE</small>
            </span>
          </button>

          <button
            className="details-back"
            onClick={closeProperty}
          >
            <ArrowLeft size={18} />
            Back to Properties
          </button>
        </header>

        <main className="property-details-page">
          <div className="details-container">
            <button
              className="mobile-back-button"
              onClick={closeProperty}
            >
              <ArrowLeft size={18} />
              Back to Properties
            </button>

            <div className="details-gallery">
              <div className="details-image">
                {images.length > 0 && (
                  <img
                    src={images[currentImage]}
                    alt={selectedProperty.title}
                  />
                )}

                <span className="details-badge">
                  {selectedProperty.type}
                </span>

                {images.length > 1 && (
                  <>
                    <button
                      className="gallery-arrow gallery-arrow-left"
                      onClick={previousImage}
                      aria-label="Previous property image"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <button
                      className="gallery-arrow gallery-arrow-right"
                      onClick={nextImage}
                      aria-label="Next property image"
                    >
                      <ArrowRight size={20} />
                    </button>

                    <div className="gallery-counter">
                      {currentImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="gallery-thumbnails">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      className={`gallery-thumbnail ${
                        currentImage === index
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setCurrentImage(index)
                      }
                    >
                      <img
                        src={image}
                        alt={`${selectedProperty.title} ${
                          index + 1
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="details-content">
              <div className="details-main">
                <div className="details-location">
                  <MapPin size={18} />
                  {selectedProperty.location}
                </div>

                <h1>{selectedProperty.title}</h1>

                <div className="details-price">
                  {selectedProperty.price}
                </div>

                <div className="details-stats">
                  {selectedProperty.beds !== null && (
                    <div>
                      <BedDouble size={21} />

                      <span>
                        <strong>
                          {selectedProperty.beds}
                        </strong>

                        <small>Bedrooms</small>
                      </span>
                    </div>
                  )}

                  {selectedProperty.baths !== null && (
                    <div>
                      <Home size={20} />

                      <span>
                        <strong>
                          {selectedProperty.baths}
                        </strong>

                        <small>Bathrooms</small>
                      </span>
                    </div>
                  )}

                  <div>
                    <Building2 size={20} />

                    <span>
                      <strong>
                        {selectedProperty.area}
                      </strong>

                      <small>Property Area</small>
                    </span>
                  </div>
                </div>

                <section className="details-section">
                  <h2>About This Property</h2>

                  <p>
                    {selectedProperty.description}
                  </p>
                </section>

                <section className="details-section">
                  <h2>Property Features</h2>

                  <div className="feature-grid">
                    {selectedProperty.features.map(
                      (feature) => (
                        <div
                          className="feature-item"
                          key={feature}
                        >
                          <Check size={17} />

                          <span>{feature}</span>
                        </div>
                      ),
                    )}
                  </div>
                </section>
              </div>

              <aside className="details-sidebar">
                <div className="inspection-card">
                  <div className="inspection-icon">
                    <ShieldCheck size={25} />
                  </div>

                  <h3>
                    Interested in this property?
                  </h3>

                  <p>
                    Speak directly with Ukalism Real
                    Estate to request more information
                    or arrange a property inspection.
                  </p>

                  <button
                    className="details-whatsapp"
                    onClick={() =>
                      sendWhatsApp(selectedProperty)
                    }
                  >
                    WhatsApp Agent
                    <ArrowRight size={18} />
                  </button>

                  <a
                    className="details-call"
                    href="tel:+2349041367161"
                  >
                    <Phone size={18} />
                    Call Agent
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /*
   * MAIN WEBSITE
   */
  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <button
            className="brand"
            onClick={() =>
              scrollToSection('home')
            }
          >
            <span className="brand-mark">U</span>

            <span className="brand-text">
              <strong>UKALISM</strong>
              <small>REAL ESTATE</small>
            </span>
          </button>

          <nav
            className={
              menuOpen
                ? 'nav-links open'
                : 'nav-links'
            }
          >
            <button
              onClick={() =>
                scrollToSection('home')
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                scrollToSection('properties')
              }
            >
              Properties
            </button>

            <button
              onClick={() =>
                scrollToSection('services')
              }
            >
              Services
            </button>

            <button
              onClick={() =>
                scrollToSection('about')
              }
            >
              About
            </button>

            <button
              onClick={() =>
                scrollToSection('contact')
              }
            >
              Contact
            </button>
          </nav>

          <button
            className="nav-menu"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

          <button
            className="nav-cta"
            onClick={() => sendWhatsApp()}
          >
            Contact Agent
            <ArrowRight size={17} />
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="hero-eyebrow">
              <Sparkles size={16} />
              Trusted Real Estate Solutions in Lagos
            </div>

            <h1>
              Find a Place
              <br />
              <span>You Can Call Home.</span>
            </h1>

            <p>
              Discover carefully selected properties
              for sale and rent across Lagos.
              Professional guidance from search to
              closing.
            </p>

            <button
              className="hero-button"
              onClick={() =>
                scrollToSection('properties')
              }
            >
              Explore Properties
              <ArrowRight size={19} />
            </button>
          </div>

          <div className="hero-search">
            <div className="search-field">
              <MapPin size={19} />

              <div>
                <label>Location</label>

                <select
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                >
                  <option>Any Location</option>
                  <option>Lekki</option>
                  <option>Ikoyi</option>
                  <option>Sangotedo</option>
                </select>
              </div>

              <ChevronDown size={16} />
            </div>

            <div className="search-divider" />

            <div className="search-field">
              <Home size={19} />

              <div>
                <label>Property Type</label>

                <select
                  value={propertyType}
                  onChange={(event) =>
                    setPropertyType(event.target.value)
                  }
                >
                  <option>Any Property</option>
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Land</option>
                </select>
              </div>

              <ChevronDown size={16} />
            </div>

            <button
              className="search-button"
              onClick={() =>
                scrollToSection('properties')
              }
            >
              <Search size={19} />
              Search
            </button>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="trust-strip">
          <div>
            <ShieldCheck size={25} />

            <span>
              <strong>Trusted Service</strong>
              Professional real estate guidance
            </span>
          </div>

          <div>
            <Building2 size={25} />

            <span>
              <strong>Quality Properties</strong>
              Carefully selected opportunities
            </span>
          </div>

          <div>
            <Phone size={25} />

            <span>
              <strong>Direct Support</strong>
              Speak directly with our agent
            </span>
          </div>
        </section>

        {/* PROPERTIES */}
        <section
          className="section properties-section"
          id="properties"
        >
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">
                Featured Properties
              </span>

              <h2>Explore Our Properties</h2>
            </div>

            <p>
              Browse selected homes, apartments and
              land opportunities available in some
              of Lagos' most desirable locations.
            </p>
          </div>

          <div className="listing-filters">
            <div className="listing-filter-group">
              <button
                className={
                  listingType === 'All'
                    ? 'listing-filter active'
                    : 'listing-filter'
                }
                onClick={() =>
                  setListingType('All')
                }
              >
                All Properties
              </button>

              <button
                className={
                  listingType === 'For Sale'
                    ? 'listing-filter active'
                    : 'listing-filter'
                }
                onClick={() =>
                  setListingType('For Sale')
                }
              >
                For Sale
              </button>

              <button
                className={
                  listingType === 'For Rent'
                    ? 'listing-filter active'
                    : 'listing-filter'
                }
                onClick={() =>
                  setListingType('For Rent')
                }
              >
                For Rent
              </button>
            </div>

            {hasActiveFilters && (
              <button
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
                <X size={15} />
              </button>
            )}
          </div>

          <div className="property-results-bar">
            <span>
              <strong>
                {filteredProperties.length}
              </strong>{' '}
              {filteredProperties.length === 1
                ? 'Property'
                : 'Properties'}{' '}
              Available
            </span>

            {hasActiveFilters && (
              <span className="filtered-label">
                Filtered results
              </span>
            )}
          </div>

          {filteredProperties.length > 0 ? (
            <div className="property-grid">
              {filteredProperties.map((property) => {
                const image =
                  property.images?.[0] ||
                  property.image

                return (
                  <article
                    className="property-card"
                    key={property.id}
                  >
                    <div className="property-image">
                      <img
                        src={image}
                        alt={property.title}
                      />

                      <span className="property-badge">
                        {property.type}
                      </span>

                      <button
                        className="property-image-button"
                        onClick={() =>
                          openProperty(property)
                        }
                      >
                        <span className="view-property-label">
                          View Property
                        </span>

                        <ArrowRight size={18} />
                      </button>
                    </div>

                    <div className="property-card-body">
                      <span className="property-category">
                        {property.category}
                      </span>

                      <h3>{property.title}</h3>

                      <div className="property-location">
                        <MapPin size={15} />
                        {property.location}
                      </div>

                      <div className="property-card-bottom">
                        <strong>
                          {property.price}
                        </strong>

                        <button
                          className="property-details-button"
                          onClick={() =>
                            openProperty(property)
                          }
                        >
                          Details
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="no-results">
              <Search size={30} />

              <h3>No properties found</h3>

              <p>
                Try changing the location, property
                type or listing filter.
              </p>

              <button
                className="outline-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* SERVICES */}
        <section
          className="section services-section"
          id="services"
        >
          <div className="section-heading centered">
            <span className="section-eyebrow">
              What We Do
            </span>

            <h2>Real Estate Made Simple</h2>

            <p>
              From finding the right property to making
              a confident decision, Ukalism Real Estate
              is here to guide you.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <Search size={23} />
              </div>

              <h3>Property Search</h3>

              <p>
                Find suitable properties based on your
                location, budget and lifestyle needs.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <Building2 size={23} />
              </div>

              <h3>Property Sales</h3>

              <p>
                Explore property opportunities and
                receive guidance throughout the buying
                process.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <Home size={23} />
              </div>

              <h3>Property Rentals</h3>

              <p>
                Discover comfortable residential spaces
                available for rent across Lagos.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <ShieldCheck size={23} />
              </div>

              <h3>Real Estate Guidance</h3>

              <p>
                Get direct professional support when
                evaluating your next property
                opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          className="section about-section"
          id="about"
        >
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=85"
              alt="Modern Lagos property"
            />
          </div>

          <div className="about-content">
            <span className="section-eyebrow">
              About Ukalism
            </span>

            <h2>
              More Than Properties...
              <br />
              We Build Futures.
            </h2>

            <p>
              Ukalism Real Estate helps individuals and
              families find property opportunities that
              match their goals. Our approach is built
              around trust, transparency and personal
              service.
            </p>

            <div className="about-checks">
              <div>
                <Check size={17} />
                Trusted and professional service
              </div>

              <div>
                <Check size={17} />
                Carefully selected properties
              </div>

              <div>
                <Check size={17} />
                Direct client support
              </div>
            </div>

            <button
              className="outline-button"
              onClick={() => sendWhatsApp()}
            >
              Speak With Our Agent
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* CTA */}
        <section
          className="cta-section"
          id="contact"
        >
          <div>
            <span className="section-eyebrow">
              Let's Find Your Next Property
            </span>

            <h2>
              Ready to Make Your Next Move?
            </h2>

            <p>
              Tell us what you're looking for and let's
              help you find the right property.
            </p>
          </div>

          <button
            className="cta-button"
            onClick={() => sendWhatsApp()}
          >
            Contact Ukalism
            <ArrowRight size={19} />
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <button
              className="brand"
              onClick={() =>
                scrollToSection('home')
              }
            >
              <span className="brand-mark">U</span>

              <span className="brand-text">
                <strong>UKALISM</strong>
                <small>REAL ESTATE</small>
              </span>
            </button>

            <p>
              Trusted Real Estate Solutions in Lagos,
              Nigeria.
            </p>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>

            <a href="tel:+2349041367161">
              <Phone size={16} />
              +234 904 136 7161
            </a>

            <a href="mailto:Sundayu676@gmail.com">
              Sundayu676@gmail.com
            </a>

            <span>Lagos, Nigeria</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Ukalism Real
            Estate.
          </span>

          <span>
            More Than Properties... We Build Futures.
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App