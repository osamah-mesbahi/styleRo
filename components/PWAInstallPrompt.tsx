import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Don't show prompt if already installed
    if (isInStandaloneMode) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay to not be too intrusive
      setTimeout(() => {
        // Check if user hasn't dismissed it recently
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) { // 24 hours
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt if not in standalone mode
    if (iOS && !isInStandaloneMode) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
        if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) {
          setShowPrompt(true);
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    if (isIOS) {
      localStorage.setItem('pwa-install-dismissed-ios', Date.now().toString());
    }
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-2xl shadow-2xl border border-gray-700 p-5 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full translate-y-8 -translate-x-8"></div>

        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Smartphone className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">🚀 بايونير</span>
              <div className="h-1 w-1 bg-blue-400 rounded-full animate-pulse"></div>
            </div>

            <h3 className="font-black text-white text-lg mb-2 leading-tight">
              كن رائداً مع ستايل رو!
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {isIOS
                ? 'انضم إلى الرواد - ثبت التطبيق لتجربة تسوق متطورة ومبتكرة'
                : 'انضم إلى الرواد الأوائل - ثبت التطبيق للوصول الفوري والتسوق بدون إنترنت'
              }
            </p>

            <div className="flex gap-3">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold py-3 px-4 rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  تثبيت الآن
                </button>
              )}

              {isIOS && (
                <button
                  onClick={() => {
                    // For iOS, just show instructions
                    alert('للتثبيت على iOS:\n1. اضغط على أيقونة المشاركة (مربع بسهم)\n2. اختر "إضافة إلى الشاشة الرئيسية"\n3. اضغط "إضافة"');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold py-3 px-4 rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Smartphone className="w-4 h-4" />
                  تعليمات التثبيت
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
