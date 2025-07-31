import { ComponentType } from 'react';

// Template type definitions
export interface EmailTemplateData {
  // Common template data
  customerName?: string;
  customerEmail?: string;
  
  // Order-specific data
  orderNumber?: string;
  orderDate?: string;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingUrl?: string;
  
  // Admin-specific data
  paymentMethod?: string;
  paymentStatus?: string;
  customerPhone?: string;
  orderId?: string;
  urgent?: boolean;
  
  // Auth-specific data
  activationUrl?: string;
  resetUrl?: string;
  firstName?: string;
  registrationDate?: string;
  requestTime?: string;
  greeting?: string;
  
  // Stock-specific data
  productName?: string;
  currentStock?: number;
  threshold?: number;
  
  // Newsletter-specific data
  subscriberName?: string;
  
  // Generic template variables
  [key: string]: any;
}

// Email template registry with dynamic imports
const EMAIL_TEMPLATE_IMPORTS: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  order_confirmation: () => import('@/emails/OrderConfirmationEmail'),
  welcome: () => import('@/emails/WelcomeEmail'),
  admin_new_order: () => import('@/emails/AdminNewOrderEmail'),
  account_activation: () => import('@/emails/AccountActivationEmail'),
  password_reset: () => import('@/emails/PasswordResetEmail'),
};

// Email template metadata for better organization
export interface EmailTemplateInfo {
  name: string;
  category: 'transactional' | 'admin' | 'auth' | 'marketing';
  description: string;
  requiredVariables: string[];
  hasReactComponent: boolean;
  hasDatabaseTemplate: boolean;
}

export const EMAIL_TEMPLATE_INFO: Record<string, EmailTemplateInfo> = {
  order_confirmation: {
    name: 'Order Confirmation',
    category: 'transactional',
    description: 'Sent to customers when their order is confirmed',
    requiredVariables: ['customerName', 'orderNumber', 'total'],
    hasReactComponent: true,
    hasDatabaseTemplate: false,
  },
  welcome: {
    name: 'Welcome Email',
    category: 'transactional',
    description: 'Sent to new customers after account creation',
    requiredVariables: ['customerName', 'customerEmail'],
    hasReactComponent: true,
    hasDatabaseTemplate: false,
  },
  admin_new_order: {
    name: 'Admin New Order Notification',
    category: 'admin',
    description: 'Sent to admins when a new order is placed',
    requiredVariables: ['orderNumber', 'customerName', 'total'],
    hasReactComponent: true,
    hasDatabaseTemplate: false,
  },
  account_activation: {
    name: 'Account Activation',
    category: 'auth',
    description: 'Sent to users to activate their account',
    requiredVariables: ['firstName', 'email', 'activationUrl', 'registrationDate'],
    hasReactComponent: true,
    hasDatabaseTemplate: false,
  },
  password_reset: {
    name: 'Password Reset',
    category: 'auth',
    description: 'Sent to users requesting password reset',
    requiredVariables: ['firstName', 'email', 'resetUrl', 'requestTime'],
    hasReactComponent: true,
    hasDatabaseTemplate: false,
  },
  admin_low_stock: {
    name: 'Admin Low Stock Alert',
    category: 'admin',
    description: 'Sent to admins when product stock is low',
    requiredVariables: ['productName', 'currentStock', 'threshold'],
    hasReactComponent: false,
    hasDatabaseTemplate: false, // Will use simple HTML template
  },
  newsletter_welcome: {
    name: 'Newsletter Welcome',
    category: 'marketing',
    description: 'Sent to new newsletter subscribers',
    requiredVariables: ['subscriberName'],
    hasReactComponent: false,
    hasDatabaseTemplate: false, // Will use simple HTML template
  },
};

// Helper function to get template component (async)
export async function getReactEmailTemplate(templateKey: string): Promise<ComponentType<EmailTemplateData> | null> {
  const importFn = EMAIL_TEMPLATE_IMPORTS[templateKey];
  if (importFn) {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      console.error(`Failed to import React Email template: ${templateKey}`, error);
      return null;
    }
  }
  return null;
}

// Helper function to check if template exists
export function hasReactEmailTemplate(templateKey: string): boolean {
  return templateKey in EMAIL_TEMPLATE_IMPORTS;
}

// Helper function to get template info
export function getTemplateInfo(templateKey: string): EmailTemplateInfo | null {
  return EMAIL_TEMPLATE_INFO[templateKey] || null;
}

// Helper function to validate required variables
export function validateTemplateVariables(templateKey: string, variables: EmailTemplateData): string[] {
  const templateInfo = getTemplateInfo(templateKey);
  if (!templateInfo) {
    return [`Unknown template: ${templateKey}`];
  }
  
  const errors: string[] = [];
  for (const requiredVar of templateInfo.requiredVariables) {
    if (!(requiredVar in variables) || variables[requiredVar] === undefined || variables[requiredVar] === null) {
      errors.push(`Missing required variable: ${requiredVar}`);
    }
  }
  
  return errors;
}