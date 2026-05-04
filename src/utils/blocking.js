export const hasActiveBlockRestriction = (user) =>
  Boolean(user?.meta?.activeBlocksCount) && ['user', 'seller'].includes(user?.role);

export const blockedAllowedRoutes = new Set([
  '/requests',
  '/notifications',
]);
