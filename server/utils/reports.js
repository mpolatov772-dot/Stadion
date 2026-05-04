export const buildOwnerReportPayload = ({ owner, stadiums, bookings, payments }) => {
  const ownerStadiumIds = new Set(stadiums.map((stadium) => stadium._id));
  const ownerBookings = bookings.filter((booking) => ownerStadiumIds.has(booking.stadiumId));
  const ownerPayments = payments.filter(
    (payment) => payment.contextType === 'stadium' && ownerStadiumIds.has(payment.stadiumId),
  );

  const bookingsRevenue = ownerPayments.reduce(
    (sum, payment) => sum + Number(payment.discountedTotal || 0),
    0,
  );
  const income = ownerPayments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
  const expenses = stadiums.reduce((sum, stadium) => sum + Number(stadium.operationalCost || 0), 0);
  const profit = Math.max(income - expenses, 0);
  const loss = Math.max(expenses - income, 0);

  const monthlyMap = new Map();

  ownerPayments.forEach((payment) => {
    const monthLabel = new Date(payment.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const current = monthlyMap.get(monthLabel) || {
      month: monthLabel,
      income: 0,
      bookingsRevenue: 0,
      expenses: 0,
    };

    current.income += Number(payment.paidAmount || 0);
    current.bookingsRevenue += Number(payment.discountedTotal || 0);
    monthlyMap.set(monthLabel, current);
  });

  const monthlyBreakdown = Array.from(monthlyMap.values()).map((entry) => ({
    ...entry,
    expenses: stadiums.length ? Number((expenses / stadiums.length).toFixed(2)) : 0,
  }));

  return {
    _id: `report-${owner._id}`,
    ownerId: owner._id,
    generatedAt: new Date().toISOString(),
    income: Number(income.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    loss: Number(loss.toFixed(2)),
    bookingsRevenue: Number(bookingsRevenue.toFixed(2)),
    bookingsCount: ownerBookings.length,
    stadiumCount: stadiums.length,
    monthlyBreakdown,
  };
};
