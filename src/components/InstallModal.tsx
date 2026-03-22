import React from 'react';
import { X, Share, PlusSquare, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'motion/react';

interface InstallModalProps {
  onClose: () => void;
}

export default function InstallModal({ onClose }: InstallModalProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Smartphone size={32} />
          </div>
          <h2 className="text-2xl font-black">Install Gaming Hub</h2>
          <p className="text-neutral-500 mt-2">Get the full app experience on your home screen.</p>
        </div>

        <div className="space-y-6">
          {isIOS ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Share size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">Step 1</p>
                  <p className="text-neutral-600 text-sm">Tap the 'Share' button in Safari's bottom toolbar.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <PlusSquare size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">Step 2</p>
                  <p className="text-neutral-600 text-sm">Scroll down and select 'Add to Home Screen'.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="w-8 h-8 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center shrink-0">
                  <Monitor size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">Desktop / Android</p>
                  <p className="text-neutral-600 text-sm">Tap the 'Install' button in the header or your browser menu.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-black text-white font-bold py-4 rounded-2xl hover:bg-neutral-800 transition-colors"
        >
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}
