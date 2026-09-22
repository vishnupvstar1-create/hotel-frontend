import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  // createPortal forces the Toast to render directly inside the <body> tag
  // so it can never be trapped behind a modal or clipped by overflow-hidden!
  return createPortal(
    <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] animate-[pulse_0.5s_ease-in-out]">
      <CheckCircle size={20} className="text-emerald-100" />
      <span className="font-bold text-sm tracking-wide">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-4 hover:bg-emerald-700 p-1.5 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>,
    document.body
  );
}