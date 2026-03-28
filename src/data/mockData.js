// RTU Client Satisfaction Survey - Mock Data
// Contains 50+ realistic survey responses spread across offices, client types, and dates

// RTU Offices/Services
export const OFFICES = [
  "Cashier", 
  "Registrar", 
  "Clinic", 
  "MIC/MISO", 
  "SAASU", 
  "BAO", 
  "SFAU"
];

// Client Types
export const CLIENT_TYPES = [
  "Student", 
  "Faculty", 
  "Staff", 
  "Visitor"
];

// Sample feedback comments
const FEEDBACKS = [
  "The staff was very helpful and accommodating.",
  "Long waiting time but service was good.",
  "Excellent service! Will come again.",
  "Process was smooth and efficient.",
  "Staff could be more friendly.",
  "Very satisfied with the assistance provided.",
  "Need improvement in response time.",
  "Great experience overall.",
  "The line was too long.",
  "Professional and courteous staff.",
  "Could use more seating areas.",
  "Very responsive to inquiries.",
  "Satisfied with the outcome.",
  "Would recommend to others.",
  "Need better signage for offices.",
  "Quick and hassle-free process.",
  "Staff was knowledgeable.",
  "Had to wait for over an hour.",
  "Good customer service.",
  "Process needs to be digitized more."
];

// Helper function to generate random date within last 6 months
const getRandomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime).toISOString();
};

// Helper function to generate random ID
const generateId = (index) => {
  return `SR-${String(index + 1).padStart(3, '0')}`;
};

// Generate 50+ mock survey responses
export const mockSurveyData = [
  // Registrar - Multiple entries
  { id: generateId(0), office: "Registrar", clientType: "Student", rating: 4, feedback: FEEDBACKS[0], submittedAt: "2025-03-15T09:32:00", status: "Normal" },
  { id: generateId(1), office: "Registrar", clientType: "Student", rating: 5, feedback: FEEDBACKS[2], submittedAt: "2025-03-14T10:15:00", status: "Normal" },
  { id: generateId(2), office: "Registrar", clientType: "Faculty", rating: 3, feedback: FEEDBACKS[4], submittedAt: "2025-03-12T14:22:00", status: "Normal" },
  { id: generateId(3), office: "Registrar", clientType: "Staff", rating: 4, feedback: FEEDBACKS[5], submittedAt: "2025-03-10T11:45:00", status: "Normal" },
  { id: generateId(4), office: "Registrar", clientType: "Student", rating: 2, feedback: FEEDBACKS[8], submittedAt: "2025-03-08T13:20:00", status: "Flagged" },
  { id: generateId(5), office: "Registrar", clientType: "Visitor", rating: 4, feedback: FEEDBACKS[9], submittedAt: "2025-03-05T09:10:00", status: "Normal" },
  { id: generateId(6), office: "Registrar", clientType: "Student", rating: 5, feedback: FEEDBACKS[6], submittedAt: "2025-02-28T15:30:00", status: "Normal" },
  { id: generateId(7), office: "Registrar", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-02-25T10:00:00", status: "Normal" },
  
  // Cashier - Multiple entries
  { id: generateId(8), office: "Cashier", clientType: "Student", rating: 3, feedback: FEEDBACKS[3], submittedAt: "2025-03-14T08:45:00", status: "Normal" },
  { id: generateId(9), office: "Cashier", clientType: "Staff", rating: 4, feedback: FEEDBACKS[15], submittedAt: "2025-03-13T12:00:00", status: "Normal" },
  { id: generateId(10), office: "Cashier", clientType: "Student", rating: 2, feedback: FEEDBACKS[7], submittedAt: "2025-03-11T14:30:00", status: "Flagged" },
  { id: generateId(11), office: "Cashier", clientType: "Faculty", rating: 5, feedback: FEEDBACKS[16], submittedAt: "2025-03-09T09:20:00", status: "Normal" },
  { id: generateId(12), office: "Cashier", clientType: "Visitor", rating: 4, feedback: FEEDBACKS[17], submittedAt: "2025-03-07T11:15:00", status: "Normal" },
  { id: generateId(13), office: "Cashier", clientType: "Student", rating: 3, feedback: FEEDBACKS[18], submittedAt: "2025-02-26T10:40:00", status: "Normal" },
  { id: generateId(14), office: "Cashier", clientType: "Staff", rating: 4, feedback: FEEDBACKS[19], submittedAt: "2025-02-22T13:50:00", status: "Normal" },
  
  // Clinic - Multiple entries
  { id: generateId(15), office: "Clinic", clientType: "Student", rating: 5, feedback: FEEDBACKS[2], submittedAt: "2025-03-15T08:00:00", status: "Normal" },
  { id: generateId(16), office: "Clinic", clientType: "Staff", rating: 4, feedback: FEEDBACKS[5], submittedAt: "2025-03-12T09:30:00", status: "Normal" },
  { id: generateId(17), office: "Clinic", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-03-10T14:00:00", status: "Normal" },
  { id: generateId(18), office: "Clinic", clientType: "Student", rating: 3, feedback: FEEDBACKS[1], submittedAt: "2025-03-08T10:20:00", status: "Normal" },
  { id: generateId(19), office: "Clinic", clientType: "Visitor", rating: 5, feedback: FEEDBACKS[13], submittedAt: "2025-03-05T15:45:00", status: "Normal" },
  { id: generateId(20), office: "Clinic", clientType: "Student", rating: 2, feedback: FEEDBACKS[8], submittedAt: "2025-02-27T11:00:00", status: "Flagged" },
  { id: generateId(21), office: "Clinic", clientType: "Staff", rating: 4, feedback: FEEDBACKS[9], submittedAt: "2025-02-24T08:30:00", status: "Normal" },
  
  // MIC/MISO - Multiple entries
  { id: generateId(22), office: "MIC/MISO", clientType: "Student", rating: 4, feedback: FEEDBACKS[0], submittedAt: "2025-03-14T11:00:00", status: "Normal" },
  { id: generateId(23), office: "MIC/MISO", clientType: "Faculty", rating: 5, feedback: FEEDBACKS[6], submittedAt: "2025-03-11T13:30:00", status: "Normal" },
  { id: generateId(24), office: "MIC/MISO", clientType: "Staff", rating: 3, feedback: FEEDBACKS[4], submittedAt: "2025-03-09T09:45:00", status: "Normal" },
  { id: generateId(25), office: "MIC/MISO", clientType: "Student", rating: 4, feedback: FEEDBACKS[15], submittedAt: "2025-03-06T14:15:00", status: "Normal" },
  { id: generateId(26), office: "MIC/MISO", clientType: "Visitor", rating: 5, feedback: FEEDBACKS[13], submittedAt: "2025-03-03T10:30:00", status: "Normal" },
  { id: generateId(27), office: "MIC/MISO", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-02-28T12:00:00", status: "Normal" },
  { id: generateId(28), office: "MIC/MISO", clientType: "Student", rating: 3, feedback: FEEDBACKS[18], submittedAt: "2025-02-25T15:20:00", status: "Normal" },
  
  // SAASU - Multiple entries
  { id: generateId(29), office: "SAASU", clientType: "Student", rating: 4, feedback: FEEDBACKS[5], submittedAt: "2025-03-15T10:30:00", status: "Normal" },
  { id: generateId(30), office: "SAASU", clientType: "Staff", rating: 5, feedback: FEEDBACKS[2], submittedAt: "2025-03-13T14:00:00", status: "Normal" },
  { id: generateId(31), office: "SAASU", clientType: "Faculty", rating: 3, feedback: FEEDBACKS[1], submittedAt: "2025-03-10T09:15:00", status: "Normal" },
  { id: generateId(32), office: "SAASU", clientType: "Student", rating: 4, feedback: FEEDBACKS[19], submittedAt: "2025-03-07T11:45:00", status: "Normal" },
  { id: generateId(33), office: "SAASU", clientType: "Visitor", rating: 4, feedback: FEEDBACKS[9], submittedAt: "2025-03-04T13:00:00", status: "Normal" },
  { id: generateId(34), office: "SAASU", clientType: "Staff", rating: 2, feedback: FEEDBACKS[8], submittedAt: "2025-03-01T10:30:00", status: "Flagged" },
  { id: generateId(35), office: "SAASU", clientType: "Student", rating: 5, feedback: FEEDBACKS[13], submittedAt: "2025-02-26T15:10:00", status: "Normal" },
  { id: generateId(36), office: "SAASU", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-02-23T09:00:00", status: "Normal" },
  
  // BAO - Multiple entries
  { id: generateId(37), office: "BAO", clientType: "Student", rating: 3, feedback: FEEDBACKS[3], submittedAt: "2025-03-14T13:45:00", status: "Normal" },
  { id: generateId(38), office: "BAO", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[0], submittedAt: "2025-03-11T10:20:00", status: "Normal" },
  { id: generateId(39), office: "BAO", clientType: "Staff", rating: 5, feedback: FEEDBACKS[6], submittedAt: "2025-03-08T14:30:00", status: "Normal" },
  { id: generateId(40), office: "BAO", clientType: "Visitor", rating: 4, feedback: FEEDBACKS[9], submittedAt: "2025-03-05T11:00:00", status: "Normal" },
  { id: generateId(41), office: "BAO", clientType: "Student", rating: 2, feedback: FEEDBACKS[7], submittedAt: "2025-03-02T09:30:00", status: "Flagged" },
  { id: generateId(42), office: "BAO", clientType: "Staff", rating: 4, feedback: FEEDBACKS[15], submittedAt: "2025-02-27T12:45:00", status: "Normal" },
  { id: generateId(43), office: "BAO", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-02-24T10:15:00", status: "Normal" },
  
  // SFAU - Multiple entries
  { id: generateId(44), office: "SFAU", clientType: "Student", rating: 4, feedback: FEEDBACKS[5], submittedAt: "2025-03-15T12:00:00", status: "Normal" },
  { id: generateId(45), office: "SFAU", clientType: "Staff", rating: 3, feedback: FEEDBACKS[1], submittedAt: "2025-03-12T09:45:00", status: "Normal" },
  { id: generateId(46), office: "SFAU", clientType: "Faculty", rating: 5, feedback: FEEDBACKS[13], submittedAt: "2025-03-09T14:20:00", status: "Normal" },
  { id: generateId(47), office: "SFAU", clientType: "Visitor", rating: 4, feedback: FEEDBACKS[9], submittedAt: "2025-03-06T11:30:00", status: "Normal" },
  { id: generateId(48), office: "SFAU", clientType: "Student", rating: 4, feedback: FEEDBACKS[15], submittedAt: "2025-03-03T10:00:00", status: "Normal" },
  { id: generateId(49), office: "SFAU", clientType: "Staff", rating: 3, feedback: FEEDBACKS[18], submittedAt: "2025-02-28T13:15:00", status: "Normal" },
  { id: generateId(50), office: "SFAU", clientType: "Faculty", rating: 5, feedback: FEEDBACKS[16], submittedAt: "2025-02-25T09:30:00", status: "Normal" },
  { id: generateId(51), office: "SFAU", clientType: "Student", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-02-22T15:00:00", status: "Normal" },
  
  // Additional entries for variety
  { id: generateId(52), office: "Registrar", clientType: "Student", rating: 4, feedback: FEEDBACKS[9], submittedAt: "2025-02-20T10:30:00", status: "Normal" },
  { id: generateId(53), office: "Cashier", clientType: "Faculty", rating: 3, feedback: FEEDBACKS[1], submittedAt: "2025-02-18T14:00:00", status: "Normal" },
  { id: generateId(54), office: "Clinic", clientType: "Staff", rating: 5, feedback: FEEDBACKS[2], submittedAt: "2025-02-15T09:20:00", status: "Normal" },
  { id: generateId(55), office: "MIC/MISO", clientType: "Visitor", rating: 4, feedback: FEEDBACKS[5], submittedAt: "2025-02-12T11:45:00", status: "Normal" },
  { id: generateId(56), office: "BAO", clientType: "Student", rating: 3, feedback: FEEDBACKS[18], submittedAt: "2025-02-10T13:30:00", status: "Normal" },
  { id: generateId(57), office: "SAASU", clientType: "Faculty", rating: 4, feedback: FEEDBACKS[15], submittedAt: "2025-02-08T10:00:00", status: "Normal" },
  { id: generateId(58), office: "SFAU", clientType: "Staff", rating: 2, feedback: FEEDBACKS[8], submittedAt: "2025-02-05T14:45:00", status: "Flagged" },
  { id: generateId(59), office: "Registrar", clientType: "Visitor", rating: 5, feedback: FEEDBACKS[13], submittedAt: "2025-02-03T09:15:00", status: "Normal" },
  { id: generateId(60), office: "Cashier", clientType: "Student", rating: 4, feedback: FEEDBACKS[11], submittedAt: "2025-02-01T12:30:00", status: "Normal" }
];

// Export statistics functions
export const getTotalResponses = () => mockSurveyData.length;

export const getAverageRating = () => {
  const total = mockSurveyData.reduce((sum, item) => sum + item.rating, 0);
  return (total / mockSurveyData.length).toFixed(2);
};

export const getOfficeCount = () => OFFICES.length;

export const getSatisfactionPercentage = () => {
  const satisfied = mockSurveyData.filter(item => item.rating >= 4).length;
  return ((satisfied / mockSurveyData.length) * 100).toFixed(1);
};

export const getUnsatisfiedPercentage = () => {
  const unsatisfied = mockSurveyData.filter(item => item.rating <= 2).length;
  return ((unsatisfied / mockSurveyData.length) * 100).toFixed(1);
};

// Get satisfaction by office
export const getSatisfactionByOffice = () => {
  const officeData = OFFICES.map(office => {
    const officeResponses = mockSurveyData.filter(item => item.office === office);
    const avgRating = officeResponses.length > 0 
      ? (officeResponses.reduce((sum, item) => sum + item.rating, 0) / officeResponses.length).toFixed(2)
      : 0;
    return {
      office,
      averageRating: parseFloat(avgRating),
      count: officeResponses.length
    };
  });
  return officeData;
};

// Get client type distribution
export const getClientTypeDistribution = () => {
  return CLIENT_TYPES.map(type => {
    const count = mockSurveyData.filter(item => item.clientType === type).length;
    return { name: type, value: count };
  });
};

// Get satisfaction trend (monthly)
export const getSatisfactionTrend = () => {
  const monthlyData = {};
  
  mockSurveyData.forEach(item => {
    const date = new Date(item.submittedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, count: 0 };
    }
    monthlyData[monthKey].total += item.rating;
    monthlyData[monthKey].count += 1;
  });
  
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      averageRating: (data.total / data.count).toFixed(2),
      count: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Get low performing services (rating < 3)
export const getLowPerformingServices = () => {
  const lowRated = mockSurveyData.filter(item => item.rating < 3);
  const officeCounts = {};
  
  lowRated.forEach(item => {
    if (!officeCounts[item.office]) {
      officeCounts[item.office] = 0;
    }
    officeCounts[item.office]++;
  });
  
  return Object.entries(officeCounts)
    .map(([office, count]) => ({ office, count }))
    .sort((a, b) => b.count - a.count);
};

