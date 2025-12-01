// Test utility for debugging authentication issues
export const testToken = (token) => {
  if (!token) {
    console.log('testToken: No token provided');
    return null;
  }

  try {
    // Decode JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    const isExpired = payload.exp < currentTime;
    
    console.log('testToken: Token analysis:');
    console.log('- Payload:', payload);
    console.log('- Expiration:', new Date(payload.exp * 1000));
    console.log('- Current time:', new Date(currentTime * 1000));
    console.log('- Is expired:', isExpired);
    console.log('- Time until expiry:', Math.round((payload.exp - currentTime) / 60), 'minutes');
    
    return {
      payload,
      isExpired,
      timeUntilExpiry: payload.exp - currentTime
    };
  } catch (error) {
    console.error('testToken: Error decoding token:', error);
    return null;
  }
};

// Test function to be called from browser console
window.testAuth = () => {
  // const token = localStorage.getItem('precious_jewels_token');
  const token = localStorage.getItem('precious_jewels_ad_token');
  return testToken(token);
};
