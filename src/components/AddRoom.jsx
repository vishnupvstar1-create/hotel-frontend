import { useState } from 'react';

// Common hotel facilities
const FACILITY_OPTIONS = ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Fridge', 'Balcony', 'Room Service', 'Ocean View'];

export default function AddRoom() {
  const [formData, setFormData] = useState({
    roomType: 'Deluxe',
    roomNumber: '',
    roomRate: '',
    description: '',
    status: 'Available',
    facilities: [] // <-- New state property
  });

  // Handle checkbox toggles
  const handleFacilityChange = (facility) => {
    setFormData((prev) => {
      const hasFacility = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: hasFacility 
          ? prev.facilities.filter(f => f !== facility) 
          : [...prev.facilities, facility]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://grand-resorts-api.onrender.com/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          roomNumber: Number(formData.roomNumber),
          roomRate: Number(formData.roomRate)
        })
      });

      if (response.ok) {
        alert('Room added successfully!');
        setFormData({ ...formData, roomNumber: '', roomRate: '', description: '', facilities: [] });
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };
  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Add New Room to Inventory</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Room Type</label>
          <select 
            value={formData.roomType}
            onChange={(e) => setFormData({...formData, roomType: e.target.value})}
            className="w-full border p-2 rounded"
          >
            <option value="Normal">Normal</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Super Luxury">Super Luxury</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input 
            type="number" 
            required
            value={formData.roomNumber}
            onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Room Rate (Price)</label>
          <input 
            type="number" 
            required
            value={formData.roomRate}
            onChange={(e) => setFormData({...formData, roomRate: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Available Facilities</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FACILITY_OPTIONS.map((facility) => (
              <label key={facility} className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.facilities.includes(facility)}
                  onChange={() => handleFacilityChange(facility)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{facility}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Room Status (Controls Website Visibility)</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full border p-2 rounded bg-white"
          >
            <option value="Available">Available (Visible on Next.js)</option>
            <option value="Maintenance">Maintenance (Hidden from Next.js)</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Room
        </button>
      </form>
    </div>
  );
}