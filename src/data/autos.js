import { supabase } from '../lib/supabase'

const fallbackAutos = [
  {
    id: 1,
    title: '2021 Toyota Highlander XLE',
    make: 'Toyota',
    model: 'Highlander XLE',
    year: 2021,
    condition: 'Foreign Used',
    price: '₦41,999,998',
    location: 'Lagos, Nigeria',
    mileage: 85000,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    body_type: 'SUV',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85'],
    video_url: null,
    description: 'A practical premium SUV concept for families and executives looking for comfort, space and everyday usability in Lagos.',
    features: ['Automatic transmission', 'Petrol engine', 'Spacious cabin', 'Premium interior', 'Reverse camera'],
  },
  {
    id: 2,
    title: '2020 Toyota Camry XSE',
    make: 'Toyota',
    model: 'Camry XSE',
    year: 2020,
    condition: 'Foreign Used',
    price: '₦28,000,000',
    location: 'Lagos, Nigeria',
    mileage: 34000,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    body_type: 'Sedan',
    images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=85'],
    video_url: null,
    description: 'A clean executive sedan concept with a comfortable cabin, modern styling and strong everyday road presence.',
    features: ['Automatic transmission', 'Petrol engine', 'Leather interior', 'Touchscreen display', 'Parking sensors'],
  },
  {
    id: 3,
    title: '2019 Honda Accord Sport',
    make: 'Honda',
    model: 'Accord Sport',
    year: 2019,
    condition: 'Nigerian Used',
    price: '₦18,700,000',
    location: 'Lagos, Nigeria',
    mileage: 45000,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    body_type: 'Sedan',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=85'],
    video_url: null,
    description: 'A polished sedan concept suited to buyers looking for a balanced mix of comfort, performance and value.',
    features: ['Automatic transmission', 'Petrol engine', 'Sport trim', 'Touchscreen display', 'Alloy wheels'],
  },
]

let autos = fallbackAutos

try {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('id', { ascending: true })

  if (!error && Array.isArray(data) && data.length) {
    autos = data
  }
} catch (error) {
  console.warn('Using local auto fallback:', error)
}

export default autos
