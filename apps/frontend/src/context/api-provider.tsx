import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 2,
          },
        },
      }),
  );

  const localStoragePersister = createAsyncStoragePersister({
    storage: window.localStorage,
    retry: removeOldestQuery,

  });

  return <PersistQueryClientProvider persistOptions={{ persister: localStoragePersister }} client={queryClient}>{children}</PersistQueryClientProvider>;
}
