import { useQuery } from '@tanstack/react-query';

// Helper function to get base URL
function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Custom hook for session query
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await fetch(`${getBaseUrl()}/api/auth/session`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      return response.json();
    },
  });
}
