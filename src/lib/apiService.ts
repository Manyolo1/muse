import axios from 'axios';

const API_BASE_URL =  "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token for protected endpoints (not needed for auth itself)
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
}

export const registerUser = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export function getToken(): string | null {
  return localStorage.getItem('token');
}
export default api;