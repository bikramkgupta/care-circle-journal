const DEFAULT_API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}
