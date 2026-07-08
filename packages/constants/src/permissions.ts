export const PERMISSIONS = {
  // Alert permissions
  CREATE_ALERT: 'alert:create',
  READ_ALERT: 'alert:read',
  UPDATE_ALERT: 'alert:update',
  DELETE_ALERT: 'alert:delete',
  
  // Strategy permissions
  CREATE_STRATEGY: 'strategy:create',
  READ_STRATEGY: 'strategy:read',
  UPDATE_STRATEGY: 'strategy:update',
  DELETE_STRATEGY: 'strategy:delete',
  
  // Telegram permissions
  CONNECT_TELEGRAM: 'telegram:connect',
  DISCONNECT_TELEGRAM: 'telegram:disconnect',
  
  // User permissions
  UPDATE_PROFILE: 'user:update',
  DELETE_ACCOUNT: 'user:delete',
  
  // Admin permissions
  MANAGE_USERS: 'admin:manage_users',
  MANAGE_ROLES: 'admin:manage_roles',
  VIEW_ANALYTICS: 'admin:view_analytics',
} as const;

export const ROLES = {
  USER: ['alert:read', 'alert:create', 'alert:update', 'alert:delete', 'strategy:read', 'telegram:connect', 'telegram:disconnect', 'user:update'],
  ADMIN: ['alert:read', 'alert:create', 'alert:update', 'alert:delete', 'strategy:create', 'strategy:read', 'strategy:update', 'strategy:delete', 'telegram:connect', 'telegram:disconnect', 'user:update', 'manage_users', 'manage_roles', 'view_analytics'],
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Role = keyof typeof ROLES;

export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}
