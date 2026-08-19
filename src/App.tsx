import React, { useState } from 'react';
import { PinterestFeed } from './components/PinterestFeed';
import { MessagingPlatform } from './components/MessagingPlatform';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'pinterest' | 'messages'>('pinterest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenMessages = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setCurrentView('messages');
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-black font-sans select-none flex flex-col">
      {/* Strict Gate: Only render MessagingPlatform if user is verified */}
      {currentView === 'messages' && user ? (
        <MessagingPlatform onBackToPinterest={() => setCurrentView('pinterest')} />
      ) : (
        <PinterestFeed onOpenMessages={handleOpenMessages} />
      )}

      {/* Google & Supabase Login Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setCurrentView('messages');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
