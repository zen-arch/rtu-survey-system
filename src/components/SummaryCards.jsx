import { Users, Star, Building2, ThumbsUp, ThumbsDown } from 'lucide-react'

/**
 * SummaryCards Component
 * Displays key metrics: total responses, average rating, offices evaluated, satisfaction percentage
 */
function SummaryCards({ 
  totalResponses, 
  averageRating, 
  officeCount, 
  satisfiedPercent, 
  unsatisfiedPercent 
}) {
  const cards = [
    {
      label: 'Total Responses',
      value: totalResponses,
      icon: Users,
      iconBg: '#0033A0',
      iconColor: '#FFD700'
    },
    {
      label: 'Overall Satisfaction',
      value: `${averageRating}/5`,
      icon: Star,
      iconBg: '#FFD700',
      iconColor: '#0033A0'
    },
    {
      label: 'Offices Evaluated',
      value: officeCount,
      icon: Building2,
      iconBg: '#0033A0',
      iconColor: '#FFD700'
    },
    {
      label: 'Satisfaction Rate',
      value: `${satisfiedPercent}%`,
      icon: ThumbsUp,
      iconBg: '#FFD700',
      iconColor: '#0033A0'
    }
  ]

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="summary-card fade-in"
          style={{ 
            animationDelay: `${index * 0.1}s`,
            border: '1px solid #E0E7FF'
          }}
        >
          <div className="summary-card-header">
            <span className="summary-card-label">{card.label}</span>
            <div 
              className="summary-card-icon"
              style={{ 
                backgroundColor: `${card.iconBg}20`,
                color: card.iconColor
              }}
            >
              <card.icon size={24} />
            </div>
          </div>
          <div className="summary-card-value">{card.value}</div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards

