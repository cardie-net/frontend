let guestAuthPromise: Promise<boolean> | null = null;

async function setupGuestSession(): Promise<boolean> {
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

      return response.ok;
    } catch (error) {
      console.error('Error setting up guest session:', error);
      return false;
    } finally {
      guestAuthPromise = null;
    }
  })();

  return guestAuthPromise;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Do not automatically setup guest session for auth endpoints
  const isAuthEndpoint = endpoint.includes('/api/v1/auth/');

  const headers = new Headers(options.headers || {});

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

  // Ensure cookies are included
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for sending/receiving httpOnly cookies
  };

  let response = await fetch(endpoint, fetchOptions);

  if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
    const guestSetupSuccess = await setupGuestSession();
    if (guestSetupSuccess) {
      response = await fetch(endpoint, fetchOptions);
    }
  }

  return response;
}
