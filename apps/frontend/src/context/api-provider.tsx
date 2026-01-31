import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client';
import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes
            gcTime: 86400 * 7 * 1000, // 7 days
          },
        },
      }),
  );

  const isOnline = useNetworkStatus();

  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        retry: isOnline ? 2 : 0,
      },
    });
  }, [isOnline, queryClient]);

  const localStoragePersister = createAsyncStoragePersister({
    storage: window.localStorage,
    retry: removeOldestQuery,
  });

  return (
    <PersistQueryClientProvider
      persistOptions={{
        persister: localStoragePersister,
        maxAge: 86400 * 7 * 1000,
      }}
      client={queryClient}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
