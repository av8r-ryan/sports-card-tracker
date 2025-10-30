// Service Worker Registration and Management
interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config;
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                console.log('New content is available, please refresh');
                this.config.onUpdate?.(this.registration!);
              } else {
                // Content is cached for offline use
                console.log('Content is cached for offline use');
                this.config.onOfflineReady?.();
              }
            }
          });
        }
      });

      this.config.onSuccess?.(this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update requested');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Default service worker manager instance
const serviceWorkerManager = new ServiceWorkerManager({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('New Service Worker available');
    // You can show a notification to the user here
    if (window.confirm('New version available! Reload to update?')) {
      window.location.reload();
    }
  },
  onOfflineReady: () => {
    console.log('App is ready for offline use');
  }
});

// Utility functions
export const registerServiceWorker = (config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | null> => {
  if (config) {
    const customManager = new ServiceWorkerManager(config);
    return customManager.register();
  }
  return serviceWorkerManager.register();
};

export const unregisterServiceWorker = (): Promise<boolean> => {
  return serviceWorkerManager.unregister();
};

export const updateServiceWorker = (): Promise<void> => {
  return serviceWorkerManager.update();
};

export const isServiceWorkerSupported = (): boolean => {
  return serviceWorkerManager.isSupported();
};

export const isServiceWorkerRegistered = (): boolean => {
  return serviceWorkerManager.isRegistered();
};

// Cache management utilities
export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }
};

export const getCacheSize = async (): Promise<number> => {
  if (!('caches' in window)) {
    return 0;
  }

  let totalSize = 0;
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
};

export const getCacheInfo = async (): Promise<{ name: string; size: number; count: number }[]> => {
  if (!('caches' in window)) {
    return [];
  }

  const cacheNames = await caches.keys();
  const cacheInfo = [];

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    let size = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        size += blob.size;
      }
    }

    cacheInfo.push({
      name: cacheName,
      size,
      count: requests.length
    });
  }

  return cacheInfo;
};

// Preload critical resources
export const preloadCriticalResources = async (): Promise<void> => {
  if (!('caches' in window)) {
    return;
  }

  const criticalResources = [
    '/',
    '/static/css/main.css',
    '/static/js/main.js',
    '/manifest.json'
  ];

  try {
    const cache = await caches.open('sports-card-tracker-static-v1');
    await cache.addAll(criticalResources);
    console.log('Critical resources preloaded');
  } catch (error) {
    console.error('Failed to preload critical resources:', error);
  }
};

// Background sync utilities
export const requestBackgroundSync = async (tag: string): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const anyReg: any = registration as any;
    if (anyReg.sync && typeof anyReg.sync.register === 'function') {
      await anyReg.sync.register(tag);
      console.log('Background sync requested:', tag);
    }
  }
};

// Push notification utilities
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return 'denied';
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

// Performance monitoring
export const measureServiceWorkerPerformance = (): void => {
  if (!('performance' in window)) {
    return;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('sw.js')) {
        console.log('Service Worker performance:', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
};

export default serviceWorkerManager;
