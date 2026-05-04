const exactMessageKeyMap = {
  'Authentication token is required': 'errors.authTokenRequired',
  'Invalid token': 'errors.invalidToken',
  'The session is no longer valid': 'errors.sessionInvalid',
  'Endpoint not found': 'errors.endpointNotFound',
  'Server initialization failed': 'errors.apiUnavailable',
  'Resource not found': 'errors.resourceNotFound',
  'Please enter a valid email address': 'errors.validEmail',
  'Password must be at least 8 characters long': 'errors.passwordMin',
  'An account with this email already exists': 'errors.emailExists',
  'Invalid email or password': 'errors.invalidCredentials',
  'The selected role is not allowed for signup': 'errors.roleNotAllowed',
  'Location with city and coordinates is required': 'errors.locationRequired',
  'At least one available time slot is required': 'errors.slotRequired',
  'Each available slot must include date, startTime, and endTime': 'errors.slotFieldsRequired',
  'Each available slot must have an end time after the start time': 'errors.slotTimeOrder',
  'Stadium not found': 'errors.stadiumNotFound',
  'Product not found': 'errors.productNotFound',
  'Booking not found': 'errors.bookingNotFound',
  'Owner not found': 'errors.ownerNotFound',
  'Request not found': 'errors.requestNotFound',
  'Invalid payment option selected': 'errors.invalidPaymentOption',
  'You are blocked by this stadium owner and cannot place a booking': 'errors.blockedBooking',
  'You have active blocks and cannot use this action until the stadium owner removes them':
    'errors.activeBlockActionRestricted',
  'You are temporarily blocked for 24 hours after repeated violations':
    'errors.temporaryBlockCooldown',
  'The selected time slot is not available for this stadium': 'errors.slotUnavailable',
  'This stadium is already booked for the selected time slot': 'errors.stadiumAlreadyBooked',
  'Status is required': 'errors.statusRequired',
  'Invalid booking status': 'errors.invalidBookingStatus',
  'You do not have permission to update this booking': 'errors.bookingPermission',
  'Bookers can only cancel their own bookings': 'errors.bookerCancelOnly',
  'Only the stadium owner can mark this booking as no-show': 'errors.ownerNoShowOnly',
  'Requested quantity exceeds current stock': 'errors.quantityExceedsStock',
  'You can only update your own products': 'errors.productUpdateOwnOnly',
  'You can only update your own stadiums': 'errors.stadiumUpdateOwnOnly',
  'Only sellers and stadium owners can publish updates': 'errors.feedPublishRole',
  'Only stadium owners and sellers can publish video posts': 'errors.videoRoleOnly',
  'Title and content are required': 'errors.titleContentRequired',
  'blockedUserId is required': 'errors.blockUserRequired',
  'reason is required': 'errors.blockReasonRequired',
  'liftReason is required': 'errors.unblockReasonRequired',
  'The booking is not available for this block action': 'errors.blockBookingUnavailable',
  'This user is already blocked': 'errors.userAlreadyBlocked',
  'blockId and message are required': 'errors.blockRequestFieldsRequired',
  'recipientId and message are required': 'errors.messageFieldsRequired',
  'You can only request an unblock for your active block': 'errors.unblockOwnActiveOnly',
  'There is already a pending request for this block': 'errors.pendingRequestExists',
  'You can only manage requests sent to your stadium account': 'errors.manageRequestPermission',
  'Status must be either approved or rejected': 'errors.requestDecisionInvalid',
  'Stadium city must be one of the supported Uzbekistan cities': 'errors.stadiumCityInvalid',
  'Stadium coordinates must be inside Uzbekistan': 'errors.stadiumCoordinatesInvalid',
  'At least one working day is required': 'errors.atLeastOneWorkingDay',
  'Each working day must include startTime and endTime': 'errors.workingDayFieldsRequired',
  'Each working day must have an end time after the start time': 'errors.workingDayTimeOrder',
  'date is required': 'errors.dateRequired',
  'Payload too large': 'errors.payloadTooLarge',
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

  if (backendMessage.startsWith('The stadium name is too similar')) {
    return t('errors.stadiumNameConflict');
  }

  if (backendMessage.endsWith('must be a positive number')) {
    return t('errors.positiveNumber');
  }

  if (backendMessage === 'stadiumId, date, startTime, endTime, and paymentOption are required') {
    return t('errors.bookingFieldsRequired');
  }

  if (backendMessage === 'productId and paymentOption are required') {
    return t('errors.productCheckoutFieldsRequired');
  }

  return t(fallbackKey);
};
