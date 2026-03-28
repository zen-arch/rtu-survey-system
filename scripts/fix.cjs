const fs = require('fs')

let content = fs.readFileSync('src/pages/PublicSurvey.jsx', 'utf8')

const idx = content.indexOf('averageRating = (')
console.log('Found at index:', idx)
console.log('Context:', content.substring(idx-20, idx+20))

const newCalc = `averageRating = (() => {
    if (customQuestions && customQuestions.length > 0) {
      const ratingAnswers = customQuestions
        .filter(q => q.type === 'rating')
        .map(q => Number(customAnswers[q.id] || 0))
      if (ratingAnswers.length > 0) {
        return (ratingAnswers.reduce((sum, val) => sum + val, 0) / ratingAnswers.length).toFixed(1)
      }
      return '5.0'
    }
    return ((ratings.overallSatisfaction + ratings.staffProfessionalism + ratings.speedEfficiency + ratings.cleanlinessComfort + ratings.recommendation) / 5).toFixed(1)
  })()`

// Find the full averageRating declaration
const startIdx = content.indexOf('const averageRating = (')
const endIdx = content.indexOf('.toFixed(1)', startIdx) + '.toFixed(1)'.length

if (startIdx === -1) {
  console.log('ERROR: Could not find const averageRating!')
} else {
  console.log('Replacing from', startIdx, 'to', endIdx)
  const before = content.substring(0, startIdx + 6) // keep 'const '
  const after = content.substring(endIdx)
  content = before + newCalc + after
  fs.writeFileSync('src/pages/PublicSurvey.jsx', content, 'utf8')
  console.log('Done!')
}