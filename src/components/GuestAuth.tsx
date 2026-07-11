'use client';

import { useEffect } from 'react';

export function GuestAuth() {
  useEffect(() => {
    const fetchGuestToken = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        try {
          const response = await fetch(`/api/v1/auth/guest`, {
            method: 'POST',
            headers: {
              accept: 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
              localStorage.setItem('jwt_token', data.access_token);
            }
          } else {
            console.error('Failed to fetch guest token:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching guest token:', error);
        }
      }
    };

    fetchGuestToken();
  }, []);

  return null;
}
