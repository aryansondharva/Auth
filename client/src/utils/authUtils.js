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
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // If token is malformed, consider it expired
  }
};

export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    clearAuthData();
    return null;
  }
  return token;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
