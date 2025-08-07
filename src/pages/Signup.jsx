import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleSignup} className="bg-white text-black p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 w-full rounded">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
