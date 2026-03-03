// Utility functions for authentication

export const clearAuthData = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;
    console.log('isTokenExpired - Token expires at:', new Date(decoded.exp * 1000));
    console.log('isTokenExpired - Current time:', new Date(currentTime * 1000));
    console.log('isTokenExpired - Is expired:', isExpired);
    return isExpired;
  } catch (error) {
    console.log('isTokenExpired - Error decoding token:', error);
    return true; // If token is malformed, consider it expired
  }
};

export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('getAuthToken - Token from localStorage:', !!token);
  
  if (!token) {
    console.log('getAuthToken - No token found');
    return null;
  }
  
  if (isTokenExpired(token)) {
    console.log('getAuthToken - Token expired, clearing');
    clearAuthData();
    return null;
  }
  
  console.log('getAuthToken - Valid token found');
  return token;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
