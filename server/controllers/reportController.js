import { listBookings } from '../models/Booking.js';
import { listPayments } from '../models/Payment.js';
import { upsertOwnerReport } from '../models/Report.js';
import { listStadiums, listStadiumsByOwner } from '../models/Stadium.js';
import { findUserById } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../utils/constants.js';
import { buildOwnerReportPayload } from '../utils/reports.js';

export const getOwnerReport = async (req, res) => {
  const ownerId =
    req.user.role === ROLES.ADMIN ? req.query.ownerId || req.user._id : req.user._id;

  const owner = await findUserById(ownerId);

  if (!owner) {
    throw new AppError('Owner not found', 404);
  }

  const [stadiums, allBookings, allPayments] = await Promise.all([
    req.user.role === ROLES.ADMIN ? listStadiums() : listStadiumsByOwner(ownerId),
    listBookings(),
    listPayments(),
  ]);

  const ownerStadiums =
    req.user.role === ROLES.ADMIN
      ? stadiums.filter((stadium) => stadium.ownerId === ownerId)
      : stadiums;

  const reportPayload = buildOwnerReportPayload({
    owner,
    stadiums: ownerStadiums,
    bookings: allBookings,
    payments: allPayments,
  });

  const report = await upsertOwnerReport(reportPayload);

  res.json({
    success: true,
    data: report,
  });
};
