// Mock data — used only for Admin dashboard demo
// Donor and NGO users are real accounts from the database

export const MOCK_USER_ADMIN = {
  _id: 'u_admin',
  name: 'Admin',
  email: 'admin@demo.com',
  role: 'admin',
};

export const MOCK_ADMIN_STATS = {
  totalMealsSaved: 12480,
  users: { total: 312, donors: 240, ngos: 72 },
  posts: { total: 184, active: 14, delivered: 138, expired: 32 },
  requests: { total: 160, delivered: 138 },
  donationsByDay: [
    { _id: '2025-04-17', count: 4, meals: 180 },
    { _id: '2025-04-18', count: 6, meals: 240 },
    { _id: '2025-04-19', count: 3, meals: 120 },
    { _id: '2025-04-20', count: 8, meals: 350 },
    { _id: '2025-04-21', count: 5, meals: 200 },
    { _id: '2025-04-22', count: 10, meals: 480 },
    { _id: '2025-04-23', count: 7, meals: 290 },
    { _id: '2025-04-24', count: 9, meals: 410 },
    { _id: '2025-04-25', count: 6, meals: 260 },
    { _id: '2025-04-26', count: 12, meals: 560 },
    { _id: '2025-04-27', count: 8, meals: 330 },
    { _id: '2025-04-28', count: 5, meals: 190 },
    { _id: '2025-04-29', count: 11, meals: 500 },
    { _id: '2025-04-30', count: 7, meals: 310 },
  ],
  mealsByType: [
    { _id: 'veg', count: 98, meals: 4200 },
    { _id: 'non-veg', count: 42, meals: 3100 },
    { _id: 'vegan', count: 28, meals: 1800 },
    { _id: 'mixed', count: 16, meals: 980 },
  ],
  topDonors: [
    { _id: 'd1', name: 'Grand Hotel Bengaluru', totalMealsSaved: 2100, totalDonations: 52, rating: 4.6 },
    { _id: 'd2', name: 'Mehta Caterers', totalMealsSaved: 1200, totalDonations: 34, rating: 4.8 },
    { _id: 'd3', name: 'Sharma Dhaba', totalMealsSaved: 890, totalDonations: 26, rating: 4.9 },
    { _id: 'd4', name: 'Sunita Reddy', totalMealsSaved: 340, totalDonations: 18, rating: 4.7 },
    { _id: 'd5', name: 'Priya Sharma', totalMealsSaved: 210, totalDonations: 9, rating: 4.5 },
  ],
  topNGOs: [
    { _id: 'n1', organization: 'Akshaya Patra', totalMealsSaved: 4200, totalPickups: 110, rating: 5.0 },
    { _id: 'n2', organization: 'Feed India Foundation', totalMealsSaved: 3400, totalPickups: 88, rating: 4.9 },
    { _id: 'n3', organization: 'Robin Hood Army BLR', totalMealsSaved: 2800, totalPickups: 72, rating: 4.8 },
    { _id: 'n4', organization: 'No Food Waste India', totalMealsSaved: 1900, totalPickups: 54, rating: 4.7 },
    { _id: 'n5', organization: 'Smile Foundation', totalMealsSaved: 960, totalPickups: 28, rating: 4.6 },
  ],
};
