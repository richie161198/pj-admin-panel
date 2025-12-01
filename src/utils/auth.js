// JWT Token utilities
export const TOKEN_KEY = 'precious_jewels_ad_token';
export const REFRESH_TOKEN_KEY = 'precious_jewels_refresh_token';
export const REMEMBER_ME_KEY = 'precious_jewels_remember_me';

// Token storage functions
export const setToken = (token, rememberMe = false) => {
  console.log('setToken: Storing token:', token ? 'Token exists' : 'No token', 'Remember me:', rememberMe);
  
  if (rememberMe) {
    // Store in localStorage for persistent login
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    // Store in sessionStorage for session-only login
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};

export const getToken = () => {
  // Check localStorage first (for "remember me")
  let token = localStorage.getItem(TOKEN_KEY);
  const tokenSource = token ? 'localStorage' : null;
  
  // If not in localStorage, check sessionStorage
  if (!token) {
    token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log('getToken: Retrieved token from sessionStorage');
    }
  } else {
    console.log('getToken: Retrieved token from localStorage');
  }
  
  if (!token) {
    console.log('getToken: No token found in localStorage or sessionStorage');
  } else {
    console.log(`getToken: Token found in ${tokenSource || 'sessionStorage'}, length: ${token.length}`);
  }
  
  return token;
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// JWT token utilities
export const isTokenExpired = (token) => {
  if (!token) return true;
  
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
    // Check if token is expired (no buffer, only logout when actually expired)
    const isExpired = payload.exp < currentTime;
    
    console.log('isTokenExpired: Token exp:', new Date(payload.exp * 1000).toLocaleString(), 
                'Current time:', new Date(currentTime * 1000).toLocaleString(), 
                'Is expired:', isExpired);
    
    return isExpired;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};

// Get user info from token
export const getUserInfo = () => {
  const token = getToken();
  if (!token) {
    console.log('getUserInfo: No token found');
    return null;
  }
  
  const payload = getTokenPayload(token);
  console.log('getUserInfo: Full token payload:', JSON.stringify(payload, null, 2));
  
  if (!payload) {
    console.log('getUserInfo: Failed to decode token payload');
    return null;
  }
  
  // Ensure we have at least id or email to consider this a valid user
  if (!payload.id && !payload.email) {
    console.log('getUserInfo: Token payload missing required fields (id or email)');
    return null;
  }
  
  const userInfo = {
    id: payload.id || payload.userId || payload._id,
    email: payload.email,
    name: payload.name || payload.email?.split('@')[0] || 'Admin',
    role: payload.role,
    permissions: payload.permissions || [],
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    exp: payload.exp,
    iat: payload.iat
  };
  
  console.log('getUserInfo: Extracted user info:', JSON.stringify(userInfo, null, 2));
  return userInfo;
};

// Clear all auth data
export const clearAuth = () => {
  removeToken();
  // Clear any other auth-related data
  localStorage.removeItem('user');
  localStorage.removeItem('auth_user');
};
