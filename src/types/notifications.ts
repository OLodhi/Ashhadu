// TypeScript types for the User-Specific Admin Notification System

export type NotificationType = 
  | 'order_new'
  | 'order_cancelled' 
  | 'order_shipped'
  | 'order_delivered'
  | 'product_low_stock'
  | 'product_out_of_stock'
  | 'product_back_in_stock'
  | 'customer_new'
  | 'customer_updated'
  | 'review_pending'
  | 'review_approved'
  | 'review_rejected'
  | 'payment_failed'
  | 'payment_disputed'
  | 'system_alert'
  | 'inventory_updated';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type RelatedEntityType = 'order' | 'product' | 'customer' | 'review' | 'payment';

export interface AdminNotification {
  id: string;
  admin_user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_type?: RelatedEntityType;
  priority: NotificationPriority;
  read: boolean;
  dismissed: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationMetadata {
  // Order-related metadata
  order_total?: number;
  order_number?: string;
  customer_name?: string;
  payment_method?: string;
  cancellation_reason?: string;

  // Product-related metadata
  current_stock?: number;
  threshold?: number;
  product_name?: string;
  sku?: string;
  category?: string;

  // Customer-related metadata
  email?: string;
  marketing_consent?: boolean;

  // Review-related metadata
  rating?: number;
  review_excerpt?: string;

  // Generic metadata
  [key: string]: any;
}

export interface UserNotificationSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

// Notification setting keys for type safety
export const NOTIFICATION_SETTING_KEYS = {
  // Event toggles
  NEW_ORDERS: 'notification_new_orders',
  CANCELLED_ORDERS: 'notification_cancelled_orders',
  LOW_STOCK: 'notification_low_stock',
  OUT_OF_STOCK: 'notification_out_of_stock',
  BACK_IN_STOCK: 'notification_back_in_stock',
  NEW_CUSTOMERS: 'notification_new_customers',
  PENDING_REVIEWS: 'notification_pending_reviews',
  PAYMENT_FAILURES: 'notification_payment_failures',
  
  // Delivery preferences
  SOUND_ENABLED: 'notification_sound_enabled',
  DESKTOP_ENABLED: 'notification_desktop_enabled',
  EMAIL_DIGEST: 'notification_email_digest', // 'never', 'daily', 'weekly'
  
  // Behavior settings
  AUTO_DISMISS_DAYS: 'notification_auto_dismiss_days', // number of days
  MIN_PRIORITY: 'notification_min_priority', // 'low', 'normal', 'high', 'urgent'
  QUIET_HOURS_START: 'notification_quiet_hours_start', // '22:00'
  QUIET_HOURS_END: 'notification_quiet_hours_end', // '08:00'
} as const;

export type NotificationSettingKey = typeof NOTIFICATION_SETTING_KEYS[keyof typeof NOTIFICATION_SETTING_KEYS];

export interface NotificationSettings {
  // Event toggles
  notification_new_orders: boolean;
  notification_cancelled_orders: boolean;
  notification_low_stock: boolean;
  notification_out_of_stock: boolean;
  notification_back_in_stock: boolean;
  notification_new_customers: boolean;
  notification_pending_reviews: boolean;
  notification_payment_failures: boolean;
  
  // Delivery preferences
  notification_sound_enabled: boolean;
  notification_desktop_enabled: boolean;
  notification_email_digest: 'never' | 'daily' | 'weekly';
  
  // Behavior settings
  notification_auto_dismiss_days: number;
  notification_min_priority: NotificationPriority;
  notification_quiet_hours_start?: string;
  notification_quiet_hours_end?: string;
}

export interface NotificationFilters {
  read?: boolean;
  dismissed?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  related_type?: RelatedEntityType;
  search?: string;
  limit?: number;
  offset?: number;
  since?: string; // ISO date string
  until?: string; // ISO date string
}

export interface NotificationStats {
  total: number;
  unread: number;
  dismissed: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
  recent_count: number; // count in last 24 hours
}

// API response types
export interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: AdminNotification[];
    total: number;
    unread_count: number;
    has_more: boolean;
  };
  error?: string;
}

export interface NotificationResponse {
  success: boolean;
  data?: AdminNotification;
  error?: string;
}

export interface NotificationSettingsResponse {
  success: boolean;
  data?: NotificationSettings;
  error?: string;
}

export interface NotificationStatsResponse {
  success: boolean;
  data?: NotificationStats;
  error?: string;
}

export interface NotificationBulkResponse {
  success: boolean;
  data?: {
    affected_count: number;
    message: string;
  };
  error?: string;
}

// Utility types for component props
export interface NotificationDropdownProps {
  className?: string;
  maxItems?: number;
}

export interface NotificationItemProps {
  notification: AdminNotification;
  onRead?: (notification: AdminNotification) => void;
  onDismiss?: (notification: AdminNotification) => void;
  onClick?: (notification: AdminNotification) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface NotificationCenterProps {
  filters?: NotificationFilters;
  onFiltersChange?: (filters: NotificationFilters) => void;
}

// Notification display helpers
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  order_new: '🛒',
  order_cancelled: '❌',
  order_shipped: '📦',
  order_delivered: '✅',
  product_low_stock: '⚠️',
  product_out_of_stock: '🚫',
  product_back_in_stock: '✅',
  customer_new: '👤',
  customer_updated: '👤',
  review_pending: '⭐',
  review_approved: '⭐',
  review_rejected: '⭐',
  payment_failed: '💳',
  payment_disputed: '💳',
  system_alert: '🔔',
  inventory_updated: '📊',
};

export const NOTIFICATION_COLORS: Record<NotificationPriority, string> = {
  low: 'text-gray-600 bg-gray-50',
  normal: 'text-blue-600 bg-blue-50',
  high: 'text-orange-600 bg-orange-50',
  urgent: 'text-red-600 bg-red-50',
};

export const NOTIFICATION_BORDER_COLORS: Record<NotificationPriority, string> = {
  low: 'border-gray-200',
  normal: 'border-blue-200',
  high: 'border-orange-200',
  urgent: 'border-red-200',
};

// Helper function types
export type NotificationFormatter = (notification: AdminNotification) => {
  title: string;
  message: string;
  icon: string;
  color: string;
  actionText?: string;
};

export type NotificationGrouper = (notifications: AdminNotification[]) => Record<string, AdminNotification[]>;

export type NotificationSorter = (notifications: AdminNotification[]) => AdminNotification[];

// Context types for React
export interface NotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  settings: NotificationSettings | null;
  
  // Notification management
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Settings management
  fetchSettings: () => Promise<void>;
  updateSetting: (key: NotificationSettingKey, value: any) => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  
  // Real-time updates
  subscribe: () => void;
  unsubscribe: () => void;
}

// Default notification settings for new admin users
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notification_new_orders: true,
  notification_cancelled_orders: true,
  notification_low_stock: true,
  notification_out_of_stock: true,
  notification_back_in_stock: false,
  notification_new_customers: false,
  notification_pending_reviews: true,
  notification_payment_failures: true,
  notification_sound_enabled: true,
  notification_desktop_enabled: true,
  notification_email_digest: 'daily',
  notification_auto_dismiss_days: 30,
  notification_min_priority: 'low',
};

// Validation schemas (can be used with Zod or similar)
export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_type?: RelatedEntityType;
  priority?: NotificationPriority;
  action_url?: string;
  metadata?: NotificationMetadata;
  expires_at?: string;
}

export interface UpdateNotificationRequest {
  read?: boolean;
  dismissed?: boolean;
}

export interface UpdateNotificationSettingsRequest {
  settings: Partial<NotificationSettings>;
}