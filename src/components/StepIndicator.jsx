import { Check } from 'lucide-react'

/**
 * StepIndicator Component
 * Displays progress through multi-step forms
 * 
 * @param {number} currentStep - The current active step (1-based)
 * @param {string[]} steps - Array of step labels
 * @param {string} primaryColor - Primary blue color (#0033A0)
 * @param {string} accentColor - Accent gold color (#FFD700)
 */
function StepIndicator({ currentStep, steps, primaryColor = '#0033A0', accentColor = '#FFD700' }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = currentStep > stepNumber
        const isActive = currentStep === stepNumber
        const isPending = currentStep < stepNumber

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step Circle */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isCompleted 
                  ? primaryColor 
                  : isActive 
                    ? accentColor 
                    : '#E0E7FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted 
                  ? '#FFFFFF' 
                  : isActive 
                    ? primaryColor 
                    : '#adb5bd',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              {isCompleted ? <Check size={18} /> : stepNumber}
            </div>
            
            {/* Step Label */}
            <span
              style={{
                marginLeft: '8px',
                fontSize: '13px',
                color: isActive || isCompleted ? '#1A1A2E' : '#adb5bd',
                fontWeight: isActive ? '600' : '400',
                whiteSpace: 'nowrap'
              }}
            >
              {step}
            </span>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: isCompleted ? primaryColor : '#E0E7FF',
                  marginLeft: '8px',
                  transition: 'background-color 0.2s ease'
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator

