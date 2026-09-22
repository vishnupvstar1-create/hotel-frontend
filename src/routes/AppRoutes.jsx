import { Routes, Route } from 'react-router-dom';
import BookingManager from '../components/BookingManager';
import GuestList from '../components/GuestList';
import RoomOverview from '../components/RoomOverview';
import ServicePOS from '../components/ServicePOS';
import RestaurantPOS from '../components/RestaurantPOS';
import RestaurantSales from '../components/RestaurantSales';
import ReservationCalendar from '../components/ReservationCalendar'; // <-- Import

export default function AppRoutes({ bookings, refresh, API }) {
  return (
    <Routes>
      <Route path="/" element={<BookingManager bookings={bookings} refresh={refresh} API={API} />} />
      <Route path="/guests" element={<GuestList bookings={bookings} refresh={refresh} API={API} />} />
      <Route path="/rooms" element={<RoomOverview bookings={bookings} />} />
      <Route path="/pos" element={<ServicePOS bookings={bookings.filter(b => b.status === 'Checked-In')} API={API} />} />
      <Route path="/restaurant" element={<RestaurantPOS API={API} />} />
      <Route path="/restaurant-sales" element={<RestaurantSales API={API} />} />
      
      {/* NEW: Calendar Route */}
      <Route path="/calendar" element={<ReservationCalendar bookings={bookings} />} />
    </Routes>
  );
}