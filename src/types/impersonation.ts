export interface ImpersonationToken {
  id: string;
  admin_user_id: string;
  customer_id: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface ImpersonationAudit {
  id: string;
  admin_user_id: string;
  customer_id: string;
  action: 'start' | 'stop' | 'expire';
  token_id?: string;
  admin_email: string;
  customer_email: string;
  ip_address?: string;
  user_agent?: string;
  session_duration?: string; // PostgreSQL interval as string
  created_at: string;
}

export interface ImpersonationRequest {
  customerId: string;
}

export interface ImpersonationResponse {
  success: boolean;
  token?: string;
  redirectUrl?: string;
  error?: string;
}

export interface ImpersonationValidation {
  customer_id: string;
  admin_user_id: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
}

export interface ImpersonationSession {
  isImpersonating: boolean;
  originalAdminUserId?: string;
  impersonatedCustomer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  impersonationStartedAt?: string;
}

export interface StopImpersonationRequest {
  // No body needed - uses session to determine what to stop
}

export interface StopImpersonationResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}