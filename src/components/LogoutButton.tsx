// src/components/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '@/lib/apiService';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthToken(null);         // Clear token from localStorage and axios headers
    navigate('/auth');          // Redirect to login/auth page
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  );
}
