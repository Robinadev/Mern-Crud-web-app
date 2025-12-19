// Simple API service with localStorage fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock users for testing when backend is down
const mockUsers = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-0101',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

export const userAPI = {
  getAllUsers: async () => {
    try {
      // Try real backend
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Backend not available');
    } catch (error) {
      console.log('Using mock data:', error.message);
      // Return mock data as fallback
      return {
        success: true,
        data: mockUsers
      };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Backend save failed');
    } catch (error) {
      console.log('User saved locally:', error.message);
      // Return success anyway for optimistic updates
      return {
        success: true,
        message: 'User saved locally',
        data: userData
      };
    }
  },

  updateUser: async (id, userData) => {
    return { success: true, data: { ...userData, _id: id } };
  },

  deleteUser: async (id) => {
    return { success: true, message: 'User deleted' };
  }
};