"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";

export function PWAPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(isIOSDevice);

    // Detect if already installed
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
     
    setIsStandalone(isStandaloneMode);

    if (!isStandaloneMode) {
      // Show prompt after a short delay so it's not too aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!showPrompt || isStandalone) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-medium">Add to Home Screen</h3>
          <p className="text-zinc-400 text-sm mt-1">
            Install QuickSpense for a faster, native 1-tap experience.
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {isIOS ? (
        <div className="bg-zinc-800/50 p-3 rounded-xl text-sm text-zinc-300 flex items-center gap-2">
          Tap <Share className="w-4 h-4" /> then &quot;Add to Home Screen&quot;{" "}
          <PlusSquare className="w-4 h-4" />
        </div>
      ) : (
        <button
          onClick={handleInstall}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
        >
          Install App
        </button>
      )}
    </div>
  );
}
