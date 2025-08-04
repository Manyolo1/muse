import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, setAuthToken, getToken } from '@/lib/apiService';
import { Waves } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🚩 Redirect logged-in users AWAY from auth page
  useEffect(() => {
    if (getToken()) navigate('/');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        await registerUser({ username, email, password });
        setMode('login');
        setErrorMsg('Registration successful! Please log in.');
      } else {
        const res = await loginUser({ email, password });
        setAuthToken(res.data.token);
        navigate('/'); // Go to home on login
      }
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.error ||
        (mode === 'register' ? 'Registration failed' : 'Login failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-xs p-6 bg-black shadow-lg rounded-xl">
        <Waves className="h-10 w-10 text-yellow-400 semantic-pulse" />
        <h2 className="text-2xl text-white font-bold mb-4 text-center">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
             className="w-full p-2 border rounded-2xl bg-black text-white"
              disabled={loading}
              autoFocus
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-2xl bg-black text-white"
            disabled={loading}
            autoFocus={mode === 'login'}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded-2xl bg-black text-white"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-200 to-green-300 transition-all duration-300 rounded-3xl text-black font-semibold py-2 "
            disabled={loading}
          >
            {loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
        {errorMsg && (
          <div className="mt-4 text-sm text-center text-red-500">{errorMsg}</div>
        )}
        <div className="mt-4 text-center text-white">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button onClick={() => {setMode('register');setErrorMsg(null);}} className="underline text-yellow-400">
                Register
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button onClick={() => {setMode('login');setErrorMsg(null);}} className="underline text-yellow-400">
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
