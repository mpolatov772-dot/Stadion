export const getRoleLabelKey = (role) =>
  ({
    user: 'roles.user',
    stadiumOwner: 'roles.stadiumOwner',
    admin: 'roles.admin',
  }[role] || 'roles.user');

export const getBookingStatusLabelKey = (status) =>
  ({
    pending: 'statuses.pending',
    confirmed: 'statuses.confirmed',
    cancelled: 'statuses.cancelled',
    rejected: 'statuses.rejected',
  }[status] || 'common.status');

export const getCityLabelKey = (city) => `cities.${city}`;

export const getDashboardStatLabelKey = (label) => `dashboard.stats.${label}`;
