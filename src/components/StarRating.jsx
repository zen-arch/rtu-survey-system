import { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * StarRating Component
 * Interactive star rating input for survey forms
 * 
 * @param {number} value - Current rating value (0-5)
 * @param {function} onChange - Callback when rating changes
 * @param {number} maxStars - Maximum number of stars (default: 5)
 * @param {string} size - Size of stars: 'small' | 'medium' | 'large'
 * @param {boolean} readonly - If true, stars are not clickable
 * @param {string} accentColor - Gold accent color (#FFD700)
 */
function StarRating({ 
  value = 0, 
  onChange, 
  maxStars = 5, 
  size = 'medium',
  readonly = false,
  accentColor = '#FFD700'
}) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    small: 20,
    medium: 28,
    large: 36
  }

  const starSize = sizes[size] || sizes.medium

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        gap: '4px',
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end'
      }}
    >
      {[...Array(maxStars)].map((_, index) => {
        const rating = maxStars - index
        const isFilled = rating <= (hoverValue || value)

        return (
          <Star
            key={rating}
            size={starSize}
            fill={isFilled ? accentColor : 'none'}
            stroke={isFilled ? accentColor : '#E0E7FF'}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              transition: 'transform 0.1s ease'
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * StarRatingDisplay Component
 * Non-interactive star rating display
 * 
 * @param {number} rating - Rating value to display (0-5)
 * @param {number} maxStars - Maximum number of stars (default: 5)
 * @param {string} size - Size of stars: 'small' | 'medium' | 'large'
 * @param {string} accentColor - Gold accent color (#FFD700)
 */
function StarRatingDisplay({ 
  rating = 0, 
  maxStars = 5, 
  size = 'medium',
  accentColor = '#FFD700'
}) {
  const sizes = {
    small: 16,
    medium: 20,
    large: 28
  }

  const starSize = sizes[size] || sizes.medium
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(maxStars)].map((_, index) => {
        const starNumber = index + 1
        const isFilled = starNumber <= fullStars
        const isHalfFilled = starNumber === fullStars + 1 && hasHalfStar

        return (
          <Star
            key={starNumber}
            size={starSize}
            fill={isFilled || isHalfFilled ? accentColor : 'none'}
            stroke={isFilled || isHalfFilled ? accentColor : '#E0E7FF'}
            style={{ opacity: isFilled || isHalfFilled ? 1 : 0.3 }}
          />
        )
      })}
    </div>
  )
}

export { StarRating, StarRatingDisplay }
export default StarRating

