let guestAuthPromise: Promise<string | null> | null = null;

async function getGuestToken(): Promise<string | null> {
  if (guestAuthPromise) {
    return guestAuthPromise;
  }

  guestAuthPromise = (async () => {
    try {
      const response = await fetch('/api/v1/auth/guest', {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('jwt_token', data.access_token);
          return data.access_token;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching guest token:', error);
      return null;
    } finally {
      guestAuthPromise = null;
    }
  })();

  return guestAuthPromise;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  // Do not automatically request guest token for auth endpoints
  const isAuthEndpoint = endpoint.includes('/api/v1/auth/');

  if (!token && !isAuthEndpoint && typeof window !== 'undefined') {
    token = await getGuestToken();
  }

  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    // Only set application/json if not FormData or URLSearchParams
    if (typeof window !== 'undefined' && options.body instanceof FormData) {
      // Do not set Content-Type for FormData
    } else if (typeof window !== 'undefined' && options.body instanceof URLSearchParams) {
      // Do not set Content-Type for URLSearchParams if already handled, though usually it defaults to application/x-www-form-urlencoded
    } else {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  return response;
}
