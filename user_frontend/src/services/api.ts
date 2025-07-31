// services/api.ts - Enhanced version with GraphQL integration for lecturer dashboard
import React from 'react';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApolloClient, InMemoryCache, createHttpLink, split, gql } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const GRAPHQL_WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL Client Setup for Admin Dashboard
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS_URL,
    connectionParams: {
      // Add authentication if needed
    },
  })
);

// Split link to route operations correctly
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// GraphQL Subscription for candidate availability
export const CANDIDATE_AVAILABILITY_SUBSCRIPTION = gql`
  subscription OnCandidateAvailabilityChanged {
    candidateAvailabilityChanged {
      tutorId
      tutorName
      isAvailable
      message
    }
  }
`;

// Types for candidate availability
interface CandidateAvailabilityData {
  tutorId: string;
  tutorName: string;
  isAvailable: boolean;
  message?: string;
  timestamp?: Date;
}

interface CandidateAvailabilityUpdate {
  candidateAvailabilityChanged: CandidateAvailabilityData;
}

// Real-time subscription manager for lecturer dashboard
export class SubscriptionManager {
  private subscriptions: Map<string, { unsubscribe: () => void }> = new Map();
  private callbacks: Map<string, Array<(data: CandidateAvailabilityData) => void>> = new Map();

  // Subscribe to candidate availability changes
  subscribeToCandidateAvailability(callback: (data: CandidateAvailabilityData) => void): () => void {
    const subscriptionId = 'candidateAvailability';
    
    // Add callback to list
    if (!this.callbacks.has(subscriptionId)) {
      this.callbacks.set(subscriptionId, []);
    }
    this.callbacks.get(subscriptionId)!.push(callback);

    // Create subscription if it doesn't exist
    if (!this.subscriptions.has(subscriptionId)) {
      const subscription = apolloClient.subscribe({
        query: CANDIDATE_AVAILABILITY_SUBSCRIPTION,
      }).subscribe({
        next: ({ data }: { data: CandidateAvailabilityUpdate }) => {
          const callbacks = this.callbacks.get(subscriptionId) || [];
          callbacks.forEach(cb => cb(data.candidateAvailabilityChanged));
        },
        error: (error: Error) => {
          console.error('Candidate availability subscription error:', error);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            this.resubscribe(subscriptionId);
          }, 5000);
        },
        complete: () => {
          console.log('Candidate availability subscription completed');
        }
      });
      
      this.subscriptions.set(subscriptionId, subscription);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(subscriptionId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // If no more callbacks, close subscription
      if (callbacks.length === 0) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
          subscription.unsubscribe();
          this.subscriptions.delete(subscriptionId);
          this.callbacks.delete(subscriptionId);
        }
      }
    };
  }

  // Resubscribe after error
  private resubscribe(subscriptionId: string): void {
    const callbacks = this.callbacks.get(subscriptionId) || [];
    this.subscriptions.delete(subscriptionId);
    
    if (callbacks.length > 0) {
      // Re-create subscription
      const subscription = apolloClient.subscribe({
        query: CANDIDATE_AVAILABILITY_SUBSCRIPTION,
      }).subscribe({
        next: ({ data }: { data: CandidateAvailabilityUpdate }) => {
          callbacks.forEach(cb => cb(data.candidateAvailabilityChanged));
        },
        error: (error: Error) => {
          console.error('Resubscription error:', error);
          setTimeout(() => this.resubscribe(subscriptionId), 5000);
        }
      });
      
      this.subscriptions.set(subscriptionId, subscription);
    }
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.callbacks.clear();
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; subscriptions: number } {
    return {
      connected: this.subscriptions.size > 0,
      subscriptions: this.subscriptions.size
    };
  }
}

// Global subscription manager instance
export const subscriptionManager = new SubscriptionManager();

// Enhanced API service methods
const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    axiosInstance.get<T>(url, config),
  
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    axiosInstance.post<T>(url, data, config),
  
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    axiosInstance.put<T>(url, data, config),
  
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    axiosInstance.patch<T>(url, data, config),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    axiosInstance.delete<T>(url, config),
    
  // Expose the axios instance for direct access
  instance: axiosInstance,

  // Real-time subscription methods
  subscriptions: {
    // Subscribe to candidate availability changes
    candidateAvailability: (callback: (data: CandidateAvailabilityData) => void) => 
      subscriptionManager.subscribeToCandidateAvailability(callback),
    
    // Get subscription status
    getStatus: () => subscriptionManager.getConnectionStatus(),
    
    // Clean up all subscriptions (call on component unmount)
    cleanup: () => subscriptionManager.cleanup()
  },

  // GraphQL client access for admin dashboard
  graphql: apolloClient
};

// Notification utilities for browser notifications
export const notificationUtils = {
  // Request permission for browser notifications
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Show notification for candidate unavailability
  showCandidateUnavailable: (candidateName: string, message: string): Notification | null => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Candidate Unavailable', {
        body: `${candidateName}: ${message}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `candidate-${candidateName}`, // Prevent duplicate notifications
        requireInteraction: true, // Keep notification until user interacts
        data: {
          candidateName,
          message,
          timestamp: new Date().toISOString()
        }
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      notification.onclick = () => {
        window.focus(); // Focus the browser window
        notification.close();
      };

      return notification;
    }
    return null;
  },

  // Show notification for candidate becoming available again
  showCandidateAvailable: (candidateName: string): Notification | null => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Candidate Available', {
        body: `${candidateName} is now available for hiring`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `candidate-available-${candidateName}`,
        data: {
          candidateName,
          timestamp: new Date().toISOString()
        }
      });

      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  }
};

// Hook for lecturer dashboard
export const useCandidateAvailability = () => {
  const [unavailableCandidates, setUnavailableCandidates] = React.useState<Map<string, CandidateAvailabilityData>>(new Map());
  const [connectionStatus, setConnectionStatus] = React.useState({ connected: false, subscriptions: 0 });

  React.useEffect(() => {
    let mounted = true;

    // Request notification permission
    notificationUtils.requestPermission();

    // Subscribe to candidate availability changes
    const unsubscribe = apiService.subscriptions.candidateAvailability((update) => {
      if (!mounted) return;

      if (!update.isAvailable) {
        // Candidate became unavailable
        setUnavailableCandidates(prev => new Map(prev.set(update.tutorId, {
          tutorId: update.tutorId,
          tutorName: update.tutorName,
          message: update.message,
          timestamp: new Date(),
          isAvailable: false
        })));

        // Show browser notification
        notificationUtils.showCandidateUnavailable(update.tutorName, update.message || '');
      } else {
        // Candidate became available again
        setUnavailableCandidates(prev => {
          const newMap = new Map(prev);
          newMap.delete(update.tutorId);
          return newMap;
        });

        // Show available notification
        notificationUtils.showCandidateAvailable(update.tutorName);
      }
    });

    // Update connection status periodically
    const statusInterval = setInterval(() => {
      if (mounted) {
        setConnectionStatus(apiService.subscriptions.getStatus());
      }
    }, 1000);

    return () => {
      mounted = false;
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  return {
    unavailableCandidates,
    connectionStatus,
    isCandidateUnavailable: (tutorId: string) => unavailableCandidates.has(tutorId),
    getCandidateStatus: (tutorId: string) => unavailableCandidates.get(tutorId)
  };
};

export default apiService;