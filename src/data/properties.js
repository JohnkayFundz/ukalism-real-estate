import { supabase } from '../lib/supabase'

const fallbackProperties = [
  {
    id: 1,
    title: 'Luxury 4-Bedroom Detached Duplex',
    location: 'Lekki Phase 1, Lagos',
    type: 'For Sale',
    category: 'House',
    price: '₦185,000,000',
    beds: 4,
    baths: 5,
    area: '450 sqm',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=90',
    ],
    video_url: null,
    description:
      'A premium residential property concept designed for families seeking generous living spaces, contemporary finishes and a comfortable environment in Lekki Phase 1. This demonstration listing showcases the type of property information Ukalism Real Estate can present to prospective clients.',
    features: [
      'Detached duplex',
      '4 spacious bedrooms',
      '5 bathrooms',
      'Large living and dining areas',
      'Modern fitted kitchen',
      'Private parking space',
      'Secure residential environment',
      '450 sqm land size',
    ],
  },
  {
    id: 2,
    title: 'Modern 3-Bedroom Apartment',
    location: 'Ikoyi, Lagos',
    type: 'For Rent',
    category: 'Apartment',
    price: '₦12,000,000 / year',
    beds: 3,
    baths: 3,
    area: '220 sqm',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=90',
    ],
    video_url: null,
    description:
      'A contemporary apartment concept for clients looking for comfortable city living in Ikoyi. The demonstration listing highlights modern interiors, practical living spaces and a convenient location close to business, lifestyle and leisure destinations.',
    features: [
      '3 spacious bedrooms',
      '3 bathrooms',
      'Modern fitted kitchen',
      'Spacious living room',
      'Contemporary finishes',
      'Secure residential environment',
      'Prime Ikoyi location',
      '220 sqm',
    ],
  },
  {
    id: 3,
    title: 'Premium Residential Land',
    location: 'Sangotedo, Lagos',
    type: 'For Sale',
    category: 'Land',
    price: '₦45,000,000',
    beds: null,
    baths: null,
    area: '600 sqm',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=90',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=90',
    ],
    video_url: null,
    description:
      'A residential land demonstration listing in Sangotedo for buyers considering future development or long-term property investment. The listing illustrates how Ukalism Real Estate can present land opportunities and guide prospective buyers through their next enquiry.',
    features: [
      '600 sqm residential land',
      'Suitable for residential development',
      'Growing neighbourhood',
      'Accessible location',
      'Investment potential',
      'Suitable for family home',
    ],
  },
]

let properties = fallbackProperties

try {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('id', { ascending: true })

  if (!error && Array.isArray(data) && data.length) {
    properties = data
  }
} catch (error) {
  console.warn('Using local property fallback:', error)
}

export default properties
