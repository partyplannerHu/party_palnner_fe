// Backend base URL for static files
const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Get full image URL from backend path
export const getImageUrl = (path) => {
  if (!path) return null;

  // If path is already a full URL (starts with http), return as is
  if (path.startsWith('http')) {
    return path;
  }

  // If path starts with /, prepend backend URL
  if (path.startsWith('/')) {
    return `${BACKEND_URL}${path}`;
  }

  // Otherwise, prepend backend URL with /
  return `${BACKEND_URL}/${path}`;
};

// Get placeholder image if no image provided
export const getPlaceholderImage = () => {
  return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80';
};
