import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';
import AppRoutes from './routes/AppRoutes';
import logoImg from './assets/grand.png';
import { LayoutDashboard, BedDouble, UtensilsCrossed, LayoutGrid, Store, Users, CalendarDays, ReceiptText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'https://grand-resorts-api.onrender.com/api';

// 1. Create a separate layout component for the Dashboard
// This ensures the sidebar only loads when someone is actually logged in
function DashboardLayout({ bookings, refresh, API }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Destroy the badge
    navigate('/login'); // Kick them back to login
  };
  const navItems = [
    { path: '/', icon: BedDouble, label: 'Front Desk', exact: true },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/guests', icon: Users, label: 'Guest List' },
    { path: '/rooms', icon: LayoutGrid, label: 'Room Overview' },
    { path: '/pos', icon: UtensilsCrossed, label: 'Service POS' },
    { path: '/restaurant', icon: Store, label: 'Ext. Checkout' },
    { path: '/restaurant-sales', icon: ReceiptText, label: 'Ext. Sales' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* Responsive Sidebar */}
      <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 shrink-0">
        
        {/* Logo / Header */}
        <div className="py-4 md:py-6 border-b border-slate-800 flex flex-col items-center justify-center gap-1.5 md:gap-2 shrink-0 px-1">
          <div className="bg-white p-1.5 md:p-2.5 rounded-xl shadow-md flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="Grand Resort Logo" 
              className="h-6 md:h-10 w-auto object-contain" 
            />
          </div>
          <span className="text-[10px] md:text-lg font-bold tracking-wide text-center leading-tight mt-1 md:mt-0">
            Grand<br className="md:hidden" />Resort
          </span>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-2 md:p-4 space-y-1.5 md:space-y-2 mt-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              end={item.exact}
              className={({ isActive }) => 
                `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 py-3 px-1 md:p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={22} className="min-w-[22px] md:w-[24px] md:h-[24px]" />
              <span className="text-[9px] md:text-base font-medium text-center md:text-left leading-tight md:whitespace-nowrap">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="p-2 md:p-4 border-t border-slate-800 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 py-3 px-1 md:p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={22} className="min-w-[22px] md:w-[24px] md:h-[24px]" />
            <span className="text-[9px] md:text-base font-medium text-center md:text-left leading-tight md:whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <AppRoutes bookings={bookings} refresh={refresh} API={API} />
      </div>
      
    </div>
  );
}

// 2. Main App Component with Route Definitions
export default function App() {
  const [bookings, setBookings] = useState([]);
const fetchBookings = async () => {
    try {
      // 1. Get the token from storage
      const token = localStorage.getItem('token');
      
      // 2. Attach it to the Authorization header
      const { data } = await axios.get(`${API}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => { 
    fetchBookings(); 
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login API={API} />} />

        {/* Protected Dashboard Routes */}
        {/* Everything inside here requires the user to be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<DashboardLayout bookings={bookings} refresh={fetchBookings} API={API} />} />
        </Route>
      </Routes>
    </Router>
  );
}