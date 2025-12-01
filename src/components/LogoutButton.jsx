import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';

const LogoutButton = ({ className = "btn btn-outline-danger" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Call logout which will remove the token via clearAuth()
      await logout();
      toast.success('Logged out successfully');
      // Navigate to login after token is removed
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      className={className}
      disabled={isLoggingOut}
    >
      <Icon icon="ph:sign-out" className="mr-2" />
      {isLoggingOut ? 'Logging out...' : 'Logout...'}
    </Button>
  );
};

export default LogoutButton;
