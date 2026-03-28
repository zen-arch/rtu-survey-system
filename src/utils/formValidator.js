/**
 * Form Validation Utilities
 * Reusable validation functions for forms
 */

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates required field
 * @param {any} value - Value to check
 * @returns {boolean} - True if value exists and is not empty
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * Validates minimum length
 * @param {string} value - Value to check
 * @param {number} minLength - Minimum length required
 * @returns {boolean} - True if value meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength
}

/**
 * Validates maximum length
 * @param {string} value - Value to check
 * @param {number} maxLength - Maximum length allowed
 * @returns {boolean} - True if value is within limit
 */
export const hasMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength
}

/**
 * Validates minimum value (for ratings)
 * @param {number} value - Value to check
 * @param {number} minValue - Minimum value required
 * @returns {boolean} - True if value meets minimum
 */
export const hasMinValue = (value, minValue) => {
  return value !== null && value !== undefined && Number(value) >= minValue
}

/**
 * Validates maximum value
 * @param {number} value - Value to check
 * @param {number} maxValue - Maximum value allowed
 * @returns {boolean} - True if value is within limit
 */
export const hasMaxValue = (value, maxValue) => {
  return value !== null && value !== undefined && Number(value) <= maxValue
}

/**
 * Validates survey form step 1 (Respondent Info)
 * @param {object} formData - Form data object
 * @returns {object} - Object with field errors
 */
export const validateSurveyStep1 = (formData) => {
  const errors = {}

  // Client Type validation
  if (!isRequired(formData.clientType)) {
    errors.clientType = 'Please select your role'
  }

  // Office validation
  if (!isRequired(formData.office)) {
    errors.office = 'Please select an office'
  }

  // Name validation (if not anonymous)
  if (!formData.anonymous && !isRequired(formData.name)) {
    errors.name = 'Name is required'
  }

  // Email validation (if not anonymous)
  if (!formData.anonymous) {
    if (!isRequired(formData.email)) {
      errors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
  }

  return errors
}

/**
 * Validates survey form step 2 (Ratings)
 * @param {number[]} ratings - Array of rating values
 * @returns {object} - Object with field errors
 */
export const validateSurveyStep2 = (ratings) => {
  const errors = {}

  if (!ratings || ratings.length === 0) {
    errors.general = 'Please provide ratings for all questions'
    return errors
  }

  ratings.forEach((rating, index) => {
    if (!hasMinValue(rating, 1)) {
      errors[`rating${index}`] = 'Please rate this question'
    }
  })

  return errors
}

/**
 * Validates survey form step 3 (Feedback)
 * @param {object} formData - Form data object
 * @returns {object} - Object with field errors
 */
export const validateSurveyStep3 = (formData) => {
  const errors = {}

  // Visit Type validation
  if (!isRequired(formData.visitType)) {
    errors.visitType = 'Please select your visit type'
  }

  // Comments validation (optional but check max length)
  if (formData.comments && formData.comments.length > 500) {
    errors.comments = 'Comments cannot exceed 500 characters'
  }

  return errors
}

/**
 * Validates login form
 * @param {object} credentials - Username and password
 * @returns {object} - Object with field errors
 */
export const validateLogin = (credentials) => {
  const errors = {}

  if (!isRequired(credentials.username)) {
    errors.username = 'Username is required'
  }

  if (!isRequired(credentials.password)) {
    errors.password = 'Password is required'
  }

  return errors
}

/**
 * Validates survey builder form
 * @param {object} survey - Survey data object
 * @returns {object} - Object with field errors
 */
export const validateSurveyBuilder = (survey) => {
  const errors = {}

  // Title validation
  if (!isRequired(survey.title)) {
    errors.title = 'Survey title is required'
  } else if (!hasMinLength(survey.title, 5)) {
    errors.title = 'Title must be at least 5 characters'
  }

  // Office validation
  if (!isRequired(survey.targetOffice)) {
    errors.targetOffice = 'Please select a target office'
  }

  // At least one question required
  if (!survey.questions || survey.questions.length === 0) {
    errors.questions = 'Please add at least one question'
  }

  // Validate each question
  if (survey.questions) {
    survey.questions.forEach((question, index) => {
      if (!isRequired(question.text)) {
        errors[`question${index}`] = 'Question text is required'
      }
    })
  }

  return errors
}

/**
 * Checks if form has any errors
 * @param {object} errors - Object containing field errors
 * @returns {boolean} - True if there are no errors
 */
export const hasNoErrors = (errors) => {
  return Object.keys(errors).length === 0
}

export default {
  isValidEmail,
  isRequired,
  hasMinLength,
  hasMaxLength,
  hasMinValue,
  hasMaxValue,
  validateSurveyStep1,
  validateSurveyStep2,
  validateSurveyStep3,
  validateLogin,
  validateSurveyBuilder,
  hasNoErrors
}

