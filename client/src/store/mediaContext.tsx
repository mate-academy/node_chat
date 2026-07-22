import { createContext, useContext, type ReactNode } from 'react';
import { useMediaQuery } from 'usehooks-ts';

type MediaContextType = {
  isDesktop: boolean;
};

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <MediaContext.Provider value={{ isDesktop }}>
      {children}
    </MediaContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMedia() {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }

  return context;
}

