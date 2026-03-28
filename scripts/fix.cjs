const fs = require('fs')

let content = fs.readFileSync('src/components/ResultsTable.jsx', 'utf8')

const idx = content.indexOf('Ratings Breakdown')

// Find start of the array
const startIdx = content.indexOf("{[\r\n          { label: 'Overall Satisfaction'", idx)
console.log('Start found at:', startIdx)

if (startIdx !== -1) {
  // Find end - look for the closing pattern
  const endMarker = "        ))}\r\n      </div>"
  const endIdx = content.indexOf(endMarker, startIdx) + endMarker.length
  console.log('End found at:', endIdx)

  const newBlock = `{(() => {
          if (selectedResponse.custom_answers) {
            try {
              const customData = JSON.parse(selectedResponse.custom_answers)
              const questions = customData.questions || []
              const answers = customData.answers || {}
              return questions.map((q, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E0E7FF' }}>
                  <span style={{ fontSize: '14px', color: '#1A1A2E' }}>{q.text}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {q.type === 'rating' ? (
                      [1,2,3,4,5].map(star => (
                        <span key={star} style={{ color: star <= (answers[q.id] || 0) ? '#FFD700' : '#E0E7FF', fontSize: '18px' }}>★</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '14px', color: '#1A1A2E' }}>{answers[q.id] || 'N/A'}</span>
                    )}
                  </div>
                </div>
              ))
            } catch (e) { return null }
          } else {
            return [
              { label: 'Overall Satisfaction', value: selectedResponse.rating_overall },
              { label: 'Staff Professionalism', value: selectedResponse.rating_staff },
              { label: 'Speed & Efficiency', value: selectedResponse.rating_speed },
              { label: 'Cleanliness & Comfort', value: selectedResponse.rating_cleanliness },
              { label: 'Recommendation', value: selectedResponse.rating_recommendation }
            ].map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E0E7FF' }}>
                <span style={{ fontSize: '14px', color: '#1A1A2E' }}>{item.label}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ color: star <= (item.value || 0) ? '#FFD700' : '#E0E7FF', fontSize: '18px' }}>★</span>
                  ))}
                </div>
              </div>
            ))
          }
        })()}
      </div>`

  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx)
  fs.writeFileSync('src/components/ResultsTable.jsx', content, 'utf8')
  console.log('Done!')
} else {
  console.log('Still not found!')
}