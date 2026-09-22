import { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';
import axios from 'axios';
import AppRoutes from './routes/AppRoutes';
import logoImg from './assets/grand.png';
import { LayoutDashboard, BedDouble, UtensilsCrossed, LayoutGrid, Store, Users, CalendarDays,ReceiptText } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'https://grand-resorts-api.onrender.com/api';

export default function App() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/bookings`);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => { 
    fetchBookings(); 
  }, []);

  // Define navigation items in an array to keep the JSX clean
 const navItems = [
  { path: '/', icon: BedDouble, label: 'Front Desk', exact: true },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' }, // <-- NEW
  { path: '/guests', icon: Users, label: 'Guest List' },
  { path: '/rooms', icon: LayoutGrid, label: 'Room Overview' },
  { path: '/pos', icon: UtensilsCrossed, label: 'Service POS' },
  { path: '/restaurant', icon: Store, label: 'Ext. Checkout' },
  { path: '/restaurant-sales', icon: ReceiptText, label: 'Ext. Sales' } // Ensure ReceiptText is imported if missing
];

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
        
        {/* Responsive Sidebar */}
        <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 shrink-0">
          
          {/* Logo / Header */}
         <div className="py-5 md:py-6 border-b border-slate-800 flex flex-col items-center justify-center gap-2 shrink-0">
  
  {/* White container for the black logo */}
  <div className="bg-white p-2 md:p-2.5 rounded-xl shadow-md flex items-center justify-center">
    <img 
      src={logoImg} 
      alt="Grand Resort Logo" 
      className="h-7 md:h-10 w-auto object-contain" 
    />
  </div>
  
  {/* Brand Name: Stacked below, hidden on mobile */}
  <span className="hidden md:block text-lg font-bold tracking-wide whitespace-nowrap">
    Grand Resort
  </span>
  
</div>
          
          {/* Navigation Links */}
          {/* Navigation Links */}
{/* FIX 1: Removed overflow-x-hidden and overflow-y-auto here */}
<nav className="flex-1 p-3 md:p-4 space-y-2 mt-2">
  {navItems.map((item) => (
    <NavLink 
      key={item.path}
      to={item.path} 
      end={item.exact}
      className={({ isActive }) => 
        `group relative flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      {/* Icon */}
      <item.icon size={22} className="min-w-[22px]" />
      
      {/* Text: Hidden on mobile, visible on tablet/desktop */}
      <span className="hidden md:block whitespace-nowrap font-medium">
        {item.label}
      </span>
      
      {/* Tooltip: Visible ONLY on mobile, triggers on hover */}
      {/* FIX 2: Updated left position and bumped z-index to z-[99] */}
      <div className="absolute left-[70px] bg-slate-800 text-white text-sm font-semibold px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 md:hidden whitespace-nowrap z-[99] shadow-xl border border-slate-700">
        {item.label}
        {/* Tooltip arrow pointer */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
      </div>
    </NavLink>
  ))}
</nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <AppRoutes bookings={bookings} refresh={fetchBookings} API={API} />
        </div>
        
      </div>
    </Router>
  );
}