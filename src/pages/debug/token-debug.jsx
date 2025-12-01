import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getToken, 
  isTokenExpired, 
  getUserInfo, 
  getTokenPayload,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  REMEMBER_ME_KEY
} from '@/utils/auth';

const TokenDebugPage = () => {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});

  const refreshDebugInfo = () => {
    const token = getToken();
    const tokenPayload = token ? getTokenPayload(token) : null;
    const userInfo = getUserInfo();
    
    const localStorageToken = localStorage.getItem(TOKEN_KEY);
    const sessionStorageToken = sessionStorage.getItem(TOKEN_KEY);
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    
    setDebugInfo({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenSource: localStorageToken ? 'localStorage' : (sessionStorageToken ? 'sessionStorage' : 'none'),
      localStorageHasToken: !!localStorageToken,
      sessionStorageHasToken: !!sessionStorageToken,
      rememberMeFlag: rememberMe,
      isExpired: token ? isTokenExpired(token) : null,
      tokenPayload: tokenPayload,
      userInfo: userInfo,
      contextUser: user,
      contextIsLoggedIn: isLoggedIn,
      contextIsLoading: isLoading,
      expirationTime: tokenPayload?.exp ? new Date(tokenPayload.exp * 1000).toLocaleString() : 'N/A',
      currentTime: new Date().toLocaleString(),
      timeUntilExpiration: tokenPayload?.exp ? 
        Math.floor((tokenPayload.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes' : 'N/A'
    });
  };

  useEffect(() => {
    refreshDebugInfo();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshDebugInfo, 5000);
    return () => clearInterval(interval);
  }, [user, isLoggedIn, isLoading]);

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    refreshDebugInfo();
    alert('All storage cleared!');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Token Debug Information
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time token and authentication state monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refreshDebugInfo} className="btn btn-primary">
            Refresh
          </Button>
          <Button onClick={clearLocalStorage} className="btn btn-danger">
            Clear Storage
          </Button>
          <Button onClick={logout} className="btn btn-outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Status */}
        <Card title="Token Status">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Has Token:</span>
              <span className={debugInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.hasToken ? 'Yes ✓' : 'No ✗'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Token Source:</span>
              <span className="text-indigo-600 font-semibold">
                {debugInfo.tokenSource}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">localStorage:</span>
              <span className={debugInfo.localStorageHasToken ? 'text-green-600' : 'text-gray-400'}>
                {debugInfo.localStorageHasToken ? 'Has Token ✓' : 'Empty'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">sessionStorage:</span>
              <span className={debugInfo.sessionStorageHasToken ? 'text-green-600' : 'text-gray-400'}>
                {debugInfo.sessionStorageHasToken ? 'Has Token ✓' : 'Empty'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Remember Me:</span>
              <span className={debugInfo.rememberMeFlag === 'true' ? 'text-green-600' : 'text-gray-400'}>
                {debugInfo.rememberMeFlag === 'true' ? 'Yes ✓' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Is Expired:</span>
              <span className={debugInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                {debugInfo.isExpired === null ? 'N/A' : (debugInfo.isExpired ? 'Yes ✗' : 'No ✓')}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Token Length:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {debugInfo.tokenLength} chars
              </span>
            </div>
          </div>
        </Card>

        {/* Context State */}
        <Card title="Auth Context State">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Is Logged In:</span>
              <span className={debugInfo.contextIsLoggedIn ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.contextIsLoggedIn ? 'Yes ✓' : 'No ✗'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">Is Loading:</span>
              <span className={debugInfo.contextIsLoading ? 'text-yellow-600' : 'text-gray-600'}>
                {debugInfo.contextIsLoading ? 'Yes...' : 'No'}
              </span>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium block mb-2">Context User:</span>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(debugInfo.contextUser, null, 2)}
              </pre>
            </div>
          </div>
        </Card>

        {/* Token Timing */}
        <Card title="Token Timing">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium block mb-1">Current Time:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {debugInfo.currentTime}
              </span>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium block mb-1">Expiration Time:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {debugInfo.expirationTime}
              </span>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium block mb-1">Time Until Expiration:</span>
              <span className="text-sm font-semibold text-indigo-600">
                {debugInfo.timeUntilExpiration}
              </span>
            </div>
          </div>
        </Card>

        {/* Token Payload */}
        <Card title="Token Payload">
          <div className="space-y-3">
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo.tokenPayload, null, 2) || 'No token payload'}
            </pre>
          </div>
        </Card>

        {/* User Info */}
        <Card title="Extracted User Info">
          <div className="space-y-3">
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo.userInfo, null, 2) || 'No user info'}
            </pre>
          </div>
        </Card>
      </div>

      <Card title="Console Logs">
        <div className="p-4 bg-gray-900 text-green-400 rounded font-mono text-xs">
          <p>Open browser console (F12) to see real-time authentication logs</p>
          <p className="mt-2 text-gray-400">All token operations are logged with detailed information</p>
        </div>
      </Card>
    </div>
  );
};

export default TokenDebugPage;
