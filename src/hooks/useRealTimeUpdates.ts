import { useEffect, useRef } from 'react';

interface RealTimeUpdateHook {
  customerId?: string;
  onKYCStatusChanged?: (data: any) => void;
  onRequestStatusChanged?: (data: any) => void;
  onNotification?: (data: any) => void;
}

export const useRealTimeUpdates = (callbacks: RealTimeUpdateHook) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!callbacks.customerId) return;

    // Use Server-Sent Events (SSE) for real-time updates
    const eventSource = new EventSource(`${backendUrl}/api/user/events/${callbacks.customerId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Real-time connection established for customer:', callbacks.customerId);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'KYC_STATUS_CHANGED':
            callbacks.onKYCStatusChanged?.(data);
            break;
          case 'REQUEST_STATUS_CHANGED':
            callbacks.onRequestStatusChanged?.(data);
            break;
          case 'NOTIFICATION':
            callbacks.onNotification?.(data);
            break;
          default:
            console.log('Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect...');
          // The useEffect will handle reconnection when component re-renders
        }
      }, 5000);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [backendUrl, callbacks.customerId]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    disconnect: () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }
  };
};
