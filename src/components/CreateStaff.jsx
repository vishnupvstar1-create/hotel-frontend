import { useState } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function CreateStaff({ API }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'front-desk' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Assuming you protected your backend route, we pass the logged-in user's token
      const token = localStorage.getItem('token'); 
      
      const response = await axios.post(`${API}/auth/create-admin`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus({ type: 'success', message: response.data.message });
      setForm({ username: '', password: '', role: 'front-desk' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create staff account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add Staff Member</h2>
          <p className="text-sm text-gray-500">Create a new dashboard login</p>
        </div>
      </div>

      {status.message && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            required type="text" 
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value={form.username} onChange={e => setForm({...form, username: e.target.value})} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
          <input 
            required type="password" 
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white" 
            value={form.role} onChange={e => setForm({...form, role: e.target.value})}
          >
            <option value="front-desk">Front Desk</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-70 mt-2"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}