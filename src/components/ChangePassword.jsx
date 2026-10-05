import { useState } from 'react';
import axios from 'axios';
import { KeyRound } from 'lucide-react';

export default function ChangePassword({ API }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      return setStatus({ type: 'error', message: 'New passwords do not match!' });
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/auth/change-password`, 
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus({ type: 'success', message: response.data.message });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-900 text-white rounded-lg">
          <KeyRound size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Security Settings</h2>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </div>

      {status.message && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current (Temporary) Password</label>
          <input 
            required type="password" 
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input 
            required type="password" minLength="6"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input 
            required type="password" minLength="6"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} 
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-70 mt-2"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}