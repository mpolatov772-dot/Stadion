const exactMessageKeyMap = {
  'Authentication is required': 'errors.authTokenRequired',
  'Authentication token is required': 'errors.authTokenRequired',
  'Invalid token': 'errors.invalidToken',
  'The session is no longer valid': 'errors.sessionInvalid',
  'Endpoint not found': 'errors.endpointNotFound',
  'Resource not found': 'errors.resourceNotFound',
  'You do not have access to this resource': 'errors.accessDenied',
  'Please enter a valid email address': 'errors.validEmail',
  'Password must be at least 8 characters long': 'errors.passwordMin',
  'An account with this email already exists': 'errors.emailExists',
  'Invalid email or password': 'errors.invalidCredentials',
  'This account has been deactivated': 'errors.accountDeactivated',
  'The selected role is not allowed for signup': 'errors.roleNotAllowed',
  'Location with city and coordinates is required': 'errors.locationRequired',
  'A location must be selected on the map': 'errors.stadiumLocationRequired',
  'At least one stadium image is required': 'errors.stadiumImageRequired',
  'At least one working day is required': 'errors.atLeastOneWorkingDay',
  'Each working day must include startTime and endTime': 'errors.workingDayFieldsRequired',
  'Each working day must have an end time after the start time': 'errors.workingDayTimeOrder',
  'Stadium city must be one of the supported Uzbekistan cities': 'errors.stadiumCityInvalid',
  'Stadium not found': 'errors.stadiumNotFound',
  'You can only update your own stadiums': 'errors.stadiumUpdateOwnOnly',
  'date is required': 'errors.dateRequired',
  'User not found': 'errors.userNotFound',
  'Invalid role': 'errors.invalidRole',
  'The stadium is closed on the selected day': 'errors.stadiumClosedOnDay',
  'End time must be after start time': 'errors.endTimeAfterStart',
  'Booking time must be selected in 1 hour steps': 'errors.bookingHourSteps',
  'Selected time is outside the stadium working hours': 'errors.outsideWorkingHours',
  'This stadium is already booked for the selected time slot': 'errors.stadiumAlreadyBooked',
  'stadiumId, date, startTime, endTime, and paymentOption are required': 'errors.bookingFieldsRequired',
  'Invalid payment option selected': 'errors.invalidPaymentOption',
  'You do not have permission to manage this booking': 'errors.bookingPermission',
  'Booking not found': 'errors.bookingNotFound',
  'Only pending bookings can be confirmed': 'errors.onlyPendingCanConfirm',
  'Only pending bookings can be rejected': 'errors.onlyPendingCanReject',
  'Only pending or confirmed bookings can be edited': 'errors.onlyPendingOrConfirmedCanEdit',
  'You do not have permission to cancel this booking': 'errors.cancelPermission',
  'Rating must be an integer between 1 and 5': 'errors.invalidRating',
  'A search query of at least 2 characters is required': 'errors.locationSearchQueryShort',
  'Location search is temporarily unavailable': 'errors.locationSearchUnavailable',
  'Valid latitude and longitude are required': 'errors.locationCoordinatesRequired',
  'Coordinates must be inside Uzbekistan': 'errors.locationOutsideUzbekistan',
};

export const getApiErrorMessage = (error, t, fallbackKey = 'errors.generic') => {
  const backendMessage = error?.response?.data?.message;
  const errorCode = error?.code;

  if (errorCode === 'ERR_NETWORK' || !error?.response) {
    return t('errors.apiUnavailable');
  }

  if (!backendMessage) {
    return t(fallbackKey);
  }

  if (exactMessageKeyMap[backendMessage]) {
    return t(exactMessageKeyMap[backendMessage]);
  }

  if (backendMessage.startsWith('Missing required fields:')) {
    return t('errors.requiredFields');
  }

  if (backendMessage.endsWith('must be a positive number')) {
    return t('errors.positiveNumber');
  }

  return t(fallbackKey);
};
