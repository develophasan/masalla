import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Show stale data while revalidating
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data exists
      refetchOnMount: false,
      // Retry failed requests 2 times
      retry: 2,
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  topics: ['topics'],
  popularStories: (limit = 6) => ['stories', 'popular', limit],
  stories: (filters) => ['stories', 'list', filters],
  story: (slug) => ['story', slug],
  storyById: (id) => ['story', 'id', id],
  topicStories: (topicId, limit) => ['stories', 'topic', topicId, limit],
  userFavorites: (userId) => ['favorites', userId],
  searchStories: (query) => ['stories', 'search', query],
};
