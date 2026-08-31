const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('shopnova_token');
export const setAuthToken = (token: string) => localStorage.setItem('shopnova_token', token);
export const removeAuthToken = () => localStorage.removeItem('shopnova_token');

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API Request failed');
    }
    return data;
  } catch (err: any) {
    console.warn(`[API] ${endpoint} failed:`, err.message);
    throw err;
  }
}
