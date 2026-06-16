import React, { useState } from 'react';
import { Star } from 'lucide-react';

// interactive=true  → clickable stars for input
// interactive=false → display only
const StarRating = ({ value = 0, onChange, interactive = false, size = 20 }) => {
  const [hovered, setHovered] = useState(0);

  const display = interactive ? (hovered || value) : value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            size={size}
            className={
              star <= display
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
