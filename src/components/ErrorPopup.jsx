import { AlertOctagon, X } from 'lucide-react';

export default function ErrorPopup({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="bg-red-500 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <AlertOctagon size={20} /> 
            <h2 className="font-bold text-lg">Action Failed</h2>
          </div>
          <button onClick={onClose} className="hover:bg-red-600 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 font-medium leading-relaxed">
            {error}
          </p>
        </div>
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}