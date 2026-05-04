export const getRoleLabelKey = (role) =>
  ({
    user: 'roles.user',
    seller: 'roles.seller',
    stadiumOwner: 'roles.stadiumOwner',
    admin: 'roles.admin',
  }[role] || 'roles.user');

export const getBookingStatusLabelKey = (status) =>
  ({
    pending: 'statuses.pending',
    confirmed: 'statuses.confirmed',
    completed: 'statuses.completed',
    cancelled: 'statuses.cancelled',
    rejected: 'statuses.rejected',
    no_show: 'statuses.no_show',
  }[status] || 'common.status');

export const getGenericStatusLabelKey = (status) =>
  ({
    active: 'statuses.active',
    lifted: 'statuses.lifted',
    pending: 'statuses.pending',
    approved: 'statuses.approved',
    rejected: 'statuses.rejected',
    mock_paid: 'statuses.mock_paid',
    offline_pending: 'statuses.offline_pending',
    telegram_sent: 'statuses.telegram_sent',
    confirmed: 'statuses.confirmed',
    completed: 'statuses.completed',
    cancelled: 'statuses.cancelled',
    no_show: 'statuses.no_show',
  }[status] || 'common.status');

export const getProductCategoryLabelKey = (category) => `categories.${category}`;

export const getFeedTypeLabelKey = (type) => `feedTypes.${type}`;

export const getCityLabelKey = (city) => `cities.${city}`;

export const getDashboardStatLabelKey = (label) => `dashboard.stats.${label}`;

export const getBlockReasonTranslationKey = (reason) =>
  ({
    'No-show booking': 'blockReasons.noShowBooking',
    'Manual owner block': 'blockReasons.manualOwnerBlock',
  }[reason] || null);
