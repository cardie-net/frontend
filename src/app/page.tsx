'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  is_guest: boolean;
  is_active: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Home Page</h1>
      <p>Welcome to the home page.</p>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h2>Current User</h2>
        {loading ? (
          <p>Loading user data...</p>
        ) : user ? (
          <div>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Account Type:</strong> {user.is_guest ? 'Guest' : 'Registered User'}
            </p>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
          </div>
        ) : (
          <p>Not logged in or guest token missing.</p>
        )}
      </div>
    </main>
  );
}
