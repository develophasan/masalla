import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API } from '@/config/api';
import { queryKeys } from '@/lib/queryClient';

// Fetch topics
export const useTopics = () => {
  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: async () => {
      const response = await axios.get(`${API}/topics`);
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // Topics rarely change - 1 hour
  });
};

// Fetch popular stories
export const usePopularStories = (limit = 6) => {
  return useQuery({
    queryKey: queryKeys.popularStories(limit),
    queryFn: async () => {
      const response = await axios.get(`${API}/stories/popular?limit=${limit}`);
      return response.data;
    },
  });
};

// Fetch all stories with filters
export const useStories = (filters = {}) => {
  const { topicId, search, sort = 'popular', limit = 50 } = filters;
  
  return useQuery({
    queryKey: queryKeys.stories(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (topicId) params.append('topic_id', topicId);
      if (search) params.append('search', search);
      if (sort) params.append('sort_by', sort);
      if (limit) params.append('limit', limit);
      
      const response = await axios.get(`${API}/stories?${params.toString()}`);
      return Array.isArray(response.data) ? response.data : [];
    },
  });
};

// Fetch single story by slug
export const useStory = (slug) => {
  return useQuery({
    queryKey: queryKeys.story(slug),
    queryFn: async () => {
      const response = await axios.get(`${API}/masal/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
};

// Fetch single story by ID
export const useStoryById = (id) => {
  return useQuery({
    queryKey: queryKeys.storyById(id),
    queryFn: async () => {
      const response = await axios.get(`${API}/stories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Fetch stories by topic
export const useTopicStories = (topicId, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.topicStories(topicId, limit),
    queryFn: async () => {
      const response = await axios.get(`${API}/stories?topic_id=${topicId}&limit=${limit}`);
      return response.data;
    },
    enabled: !!topicId,
  });
};

// Prefetch stories for a topic (for hover prefetching)
export const usePrefetchTopicStories = () => {
  const queryClient = useQueryClient();
  
  return (topicId) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.topicStories(topicId, 20),
      queryFn: async () => {
        const response = await axios.get(`${API}/stories?topic_id=${topicId}&limit=20`);
        return response.data;
      },
    });
  };
};

// Prefetch a single story (for link hover)
export const usePrefetchStory = () => {
  const queryClient = useQueryClient();
  
  return (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.story(slug),
      queryFn: async () => {
        const response = await axios.get(`${API}/masal/${slug}`);
        return response.data;
      },
    });
  };
};

// Invalidate stories cache (after creating new story)
export const useInvalidateStories = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['stories'] });
  };
};
