'use client';

/**
 * providers.tsx
 * 
 * Central provider component that wraps the application
 * Includes Redux, theme, and other global providers
 */

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';

// Import UI providers if needed
// import { MediaContextProvider } from 'your-ui-library';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Global providers component
 * Wraps the application with all necessary context providers
 */
export function Providers({ children }: ProvidersProps) {
  // Sử dụng state để kiểm tra xem có đang ở môi trường client hay không
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Chỉ đặt isClient = true khi component được mount ở phía client
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        // Chỉ render PersistGate khi đang ở phía client
        <PersistGate loading={null} persistor={persistor}>
          {/* Add additional providers here as needed */}
          {children}
        </PersistGate>
      ) : (
        // Khi ở phía server, chỉ render children mà không có PersistGate
        children
      )}
    </Provider>
  );
} 