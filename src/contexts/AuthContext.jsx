import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  getToken, 
  setToken, 
  setRefreshToken,
  removeToken, 
  isTokenExpired, 
  isAuthenticated, 
  getUserInfo,
  clearAuth 
} from '@/utils/auth';
import { useAdminLoginMutation, useAdminLogoutMutation } from '@/store/api/admin/adminApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [adminLogin] = useAdminLoginMutation();
  const [adminLogout] = useAdminLogoutMutation();

  // Define logout function before it's used in useEffect
  const logout = useCallback(async () => {
    try {
      // Call logout API if user is logged in
      if (isLoggedIn) {
        await adminLogout().unwrap();
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      clearAuth();
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [isLoggedIn, adminLogout]);

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthStatus = () => {
      try {
        const token = getToken();
        console.log('AuthContext: Checking auth status, token exists:', !!token);
        
        if (!token) {
          console.log('AuthContext: No token found');
          if (isMounted) {
            setIsLoggedIn(false);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // Check if token is expired
        const expired = isTokenExpired(token);
        if (expired) {
          console.log('AuthContext: Token is expired');
          // Token is expired, clear auth data
          clearAuth();
          if (isMounted) {
            setIsLoggedIn(false);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // Token is valid, get user info
        const userInfo = getUserInfo();
        console.log('AuthContext: User info from token:', userInfo);
        
        // Token is valid, we can authenticate the user even if some fields are missing
        if (userInfo) {
          if (isMounted) {
            // Batch state updates to prevent multiple re-renders
            setUser(userInfo);
            setIsLoggedIn(true);
            setIsLoading(false);
            console.log('AuthContext: User authenticated successfully', userInfo);
          }
        } else {
          console.log('AuthContext: Failed to parse token payload');
          clearAuth();
          if (isMounted) {
            // Batch state updates to prevent multiple re-renders
            setIsLoggedIn(false);
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        clearAuth();
        if (isMounted) {
          setIsLoggedIn(false);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Check auth status immediately on mount
    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Set up token expiration check interval
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('AuthContext: Token expiration check skipped (not logged in)');
      return;
    }

    console.log('AuthContext: Setting up token expiration check interval');

    const checkTokenExpiration = () => {
      console.log('AuthContext: Running token expiration check...');
      const token = getToken();
      
      if (!token) {
        console.log('AuthContext: No token found during expiration check, logging out');
        logout();
        return;
      }
      
      if (isTokenExpired(token)) {
        console.log('AuthContext: Token has expired during expiration check, logging out');
        // Token expired, logout user
        logout();
      } else {
        console.log('AuthContext: Token is still valid during expiration check');
      }
    };

    // Don't check immediately on mount - it was already checked in the first useEffect
    // Only set up the interval for periodic checks
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => {
      console.log('AuthContext: Cleaning up token expiration check interval');
      clearInterval(interval);
    };
  }, [isLoggedIn, logout]);

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await adminLogin(credentials).unwrap();
      console.log('AuthContext login: API response:', response);
      
      if (response.data && response.data.token) {
        console.log('AuthContext login: Token found, storing...', 'Remember me:', rememberMe);
        setToken(response.data.token, rememberMe);
        if (response.data.refreshToken) {
          setRefreshToken(response.data.refreshToken);
        }
        
        setUser(response.data.admin);
        setIsLoggedIn(true);
        
        return { success: true, data: response.data };
      }
      
      console.log('AuthContext login: No token in response');
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const refreshAuth = () => {
    try {
      const token = getToken();
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }

      if (isTokenExpired(token)) {
        clearAuth();
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }

      const userInfo = getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        setIsLoggedIn(true);
        return true;
      } else {
        clearAuth();
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Refresh auth error:', error);
      clearAuth();
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
