import { prisma } from '../config/prisma';
import { logger } from '@matchpulse/logger';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  STRATEGY_CREATE = 'strategy_create',
  STRATEGY_UPDATE = 'strategy_update',
  STRATEGY_DELETE = 'strategy_delete',
  USER_UPDATE = 'user_update',
  PLAN_CHANGE = 'plan_change',
  ADMIN_ACTION = 'admin_action',
  TELEGRAM_LINK = 'telegram_link',
  TELEGRAM_UNLINK = 'telegram_unlink',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  AUTH_FAILURE = 'auth_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: unknown;
  success: boolean;
}

/**
 * Log security audit event
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    // Sanitize sensitive data from details
    const sanitizedDetails = sanitizeDetails(data.details);
    
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: sanitizedDetails as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        success: data.success,
      },
    });

    logger.info('Audit event logged', {
      action: data.action,
      resource: data.resource,
      userId: data.userId,
      success: data.success,
    });
  } catch (error) {
    logger.error('Failed to log audit event', error as Error);
    // Don't throw - audit logging failures shouldn't break the application
  }
}

/**
 * Sanitize sensitive data from log details
 */
function sanitizeDetails(details: unknown): unknown {
  if (!details) return undefined;

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey', 'creditCard'];
  
  if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
    const sanitized = { ...(details as Record<string, unknown>) };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  return details;
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  userId: string,
  action: 'login' | 'logout' | 'auth_failure',
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true,
  details?: unknown
): Promise<void> {
  await logAuditEvent({
    userId,
    action: action === 'auth_failure' ? AuditAction.AUTH_FAILURE : 
            action === 'login' ? AuditAction.LOGIN : AuditAction.LOGOUT,
    resource: 'auth',
    ipAddress,
    userAgent,
    details,
    success,
  });
}

/**
 * Log strategy event
 */
export async function logStrategyEvent(
  userId: string,
  strategyId: string,
  action: 'create' | 'update' | 'delete',
  ipAddress?: string,
  userAgent?: string,
  details?: unknown
): Promise<void> {
  const actionMap = {
    create: AuditAction.STRATEGY_CREATE,
    update: AuditAction.STRATEGY_UPDATE,
    delete: AuditAction.STRATEGY_DELETE,
  };

  await logAuditEvent({
    userId,
    action: actionMap[action],
    resource: 'strategy',
    resourceId: strategyId,
    ipAddress,
    userAgent,
    details,
    success: true,
  });
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: unknown
): Promise<void> {
  await logAuditEvent({
    userId,
    action: AuditAction.ADMIN_ACTION,
    resource,
    resourceId,
    ipAddress,
    userAgent,
    details: { adminAction: action, ...(details as Record<string, unknown> | undefined) },
    success: true,
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  activity: string,
  ipAddress?: string,
  userAgent?: string,
  userId?: string,
  details?: unknown
): Promise<void> {
  await logAuditEvent({
    userId,
    action: AuditAction.SUSPICIOUS_ACTIVITY,
    resource: 'security',
    ipAddress,
    userAgent,
    details: { activity, ...(details as Record<string, unknown> | undefined) },
    success: false,
  });
}
