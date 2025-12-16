import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
  };
}

export async function getTopCoins(limit = 100) {
  const response = await fetch(`${API_URL}/api/market/top-coins?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch top coins');
  return response.json();
}

export async function analyzeSymbol(symbol) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/market/analyze/${symbol}`, { headers });
  if (!response.ok) throw new Error('Failed to analyze symbol');
  return response.json();
}

export async function getUserSettings() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/user/settings`, { headers });
  if (!response.ok) throw new Error('Failed to fetch user settings');
  return response.json();
}

export async function updateUserSettings(keys) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/user/settings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(keys)
  });
  if (!response.ok) throw new Error('Failed to update user settings');
  return response.json();
}
