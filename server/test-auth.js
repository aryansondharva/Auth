// Test authentication endpoints
const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✓ Health check:', healthResponse.data);
    
    // Test auth/me endpoint without token (should fail)
    try {
      await axios.get('http://localhost:5000/api/auth/me');
      console.log('✗ Auth/me should have failed without token');
    } catch (error) {
      console.log('✓ Auth/me correctly failed without token:', error.response.status);
    }
    
    // Test with invalid token (should fail)
    try {
      await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('✗ Auth/me should have failed with invalid token');
    } catch (error) {
      console.log('✓ Auth/me correctly failed with invalid token:', error.response.status);
    }
    
    console.log('Authentication tests completed');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth();
