// src/data.js

export const categories =  [
  { _id: '1', name: 'Venues', icon: '🏰', count: '45 providers' },
  { _id: '2', name: 'Photography', icon: '📸', count: '38 providers' },
  { _id: '3', name: 'Catering', icon: '🍽️', count: '52 providers' },
  { _id: '4', name: 'DJ', icon: '🎵', count: '29 providers' },
  { _id: '5', name: 'Decorations', icon: '✨', count: '41 providers' },
  { _id: '6', name: 'Invitations & Design', icon: '💌', count: '22 providers' },
  { _id: '7', name: 'The Grand Zaffe', icon: '🥁', count: '34 providers' },
  { _id: '8', name: 'Beauty', icon: '💄', count: '27 providers' },
];

export const listings = [
  {
    _id: '101',
    title: 'Luxury Garden Wedding Venue',
    category: 'Venues', 
    location: 'Amman, Jordan',
    price: 2500,
    hasFixedPrice: true,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    user: { name: 'Royal Halls', phone: '0790000001' }
  },
  {
    _id: '102',
    title: 'Professional Wedding Photography',
    category: 'Photography', 
    location: 'Amman, Jordan',
    price: 800,
    hasFixedPrice: true,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=800&q=80',
    user: { name: 'Lens Studio', phone: '0790000002' }
  },
  {
    _id: '103',
    title: 'Gourmet Catering Services',
    category: 'Catering', 
    location: 'Amman, Jordan',
    price: 45,
    hasFixedPrice: true,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
    user: { name: 'Tasty Bites', phone: '0790000003' }
  },
  {
    _id: '104',
    title: 'Custom Floral Decorations',
    category: 'Decorations', 
    location: 'Amman, Jordan',
    price: null,
    hasFixedPrice: false,
    rating: 4.9,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=800&q=80',
    user: { name: 'Dreamy Flowers', phone: '0790000004' }
  }
];