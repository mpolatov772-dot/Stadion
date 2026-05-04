import { listBlocks, listBlocksByUser } from '../models/Block.js';
import { listBookings, listBookingsByOwner, listBookingsByUser } from '../models/Booking.js';
import { listFeed } from '../models/Feed.js';
import { listMessagesByUser } from '../models/Message.js';
import { listNotificationsByUser } from '../models/Notification.js';
import { listOrdersBySeller, listOrdersByUser } from '../models/Order.js';
import { listPayments, listPaymentsByPayer } from '../models/Payment.js';
import { listProducts, listProductsBySeller } from '../models/Product.js';
import { listStadiums, listStadiumsByOwner } from '../models/Stadium.js';
import { listUnblockRequestsByOwner } from '../models/UnblockRequest.js';
import { listUsers, sanitizeUser } from '../models/User.js';
import { ROLES } from '../utils/constants.js';
import { normalizeStadiumSchedule } from '../utils/schedule.js';
import {
  buildUserLookup,
  serializeBooking,
  serializeFeed,
  serializeProduct,
  serializeStadium,
} from '../utils/serializers.js';

const monthLabel = (value) =>
  new Date(value).toLocaleDateString('uz-UZ', {
    month: 'short',
  });

const sumMoney = (items, selector) =>
  Number(
    items.reduce((total, item) => total + Number(selector(item) || 0), 0).toFixed(2),
  );

const buildSellerChartData = (orders = [], products = []) =>
  products.map((product) => ({
    name: product.name,
    shortName: product.name.slice(0, 14),
    views: Number(product.viewsCount || 0),
    orders: orders.filter((order) => order.productId === product._id).length,
  }));

const buildOwnerChartData = (bookings = []) => {
  const bucket = {};

  bookings.forEach((booking) => {
    const key = monthLabel(booking.createdAt);
    const current = bucket[key] || {
      month: key,
      bookings: 0,
      cancelled: 0,
      pending: 0,
    };

    current.bookings += 1;

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      current.cancelled += 1;
    }

    if (booking.status === 'pending') {
      current.pending += 1;
    }

    bucket[key] = current;
  });

  return Object.values(bucket);
};

export const getSummary = async (req, res) => {
  const [users, stadiums, products, feed, bookings, payments, blocks] = await Promise.all([
    listUsers(),
    listStadiums(),
    listProducts(),
    listFeed(),
    listBookings(),
    listPayments(),
    listBlocks(),
  ]);

  const userLookup = buildUserLookup(users);
  const updateFeed = feed.filter((entry) => entry.scope !== 'community');
  const stadiumLookup = new Map(
    stadiums.map((stadium) => [
      stadium._id,
      serializeStadium(normalizeStadiumSchedule(stadium), userLookup),
    ]),
  );
  const productLookup = new Map(
    products.map((product) => [product._id, serializeProduct(product, userLookup)]),
  );

  const role = req.user.role;

  if (role === ROLES.USER) {
    const [myBookings, myPayments, myBlocks, myOrders, myNotifications, myMessages] = await Promise.all([
      listBookingsByUser(req.user._id),
      listPaymentsByPayer(req.user._id),
      listBlocksByUser(req.user._id),
      listOrdersByUser(req.user._id),
      listNotificationsByUser(req.user._id),
      listMessagesByUser(req.user._id),
    ]);
    const upcomingBookings = myBookings.filter((booking) => {
      const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
      return [ 'pending', 'confirmed' ].includes(booking.status) && bookingStart >= new Date();
    });
    const unreadMessages = myMessages.filter(
      (message) => message.recipientId === req.user._id && !message.readAt,
    );

    return res.json({
      success: true,
      data: {
        role,
        stats: [
          { label: 'Upcoming bookings', value: upcomingBookings.length },
          { label: 'Payments made', value: myPayments.length },
          { label: 'Active restrictions', value: myBlocks.filter((block) => block.status === 'active').length },
          { label: 'New messages', value: unreadMessages.length },
        ],
        upcomingBookings: upcomingBookings.map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
        myBookings: myBookings.map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
        recentPayments: myPayments.slice(0, 5).map((payment) => ({
          ...payment,
          stadium: payment.stadiumId ? stadiumLookup.get(payment.stadiumId) : null,
          product: payment.productId ? productLookup.get(payment.productId) : null,
        })),
        activeBlocks: myBlocks.filter((block) => block.status === 'active'),
        myOrders: myOrders.map((order) => ({
          ...order,
          product: productLookup.get(order.productId) || null,
        })),
        notifications: myNotifications.slice(0, 6),
        recommendations: stadiums.slice(0, 3).map((stadium) => serializeStadium(stadium, userLookup)),
      },
    });
  }

  if (role === ROLES.SELLER) {
    const [myProducts, myOrders, myNotifications] = await Promise.all([
      listProductsBySeller(req.user._id),
      listOrdersBySeller(req.user._id),
      listNotificationsByUser(req.user._id),
    ]);
    const revenue = sumMoney(myOrders, (order) => order.discountedTotal);
    const orderedItems = myOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);

    return res.json({
      success: true,
      data: {
        role,
        stats: [
          { label: 'Products listed', value: myProducts.length },
          { label: 'Orders count', value: myOrders.length },
          { label: 'Sold items', value: orderedItems },
          { label: 'Revenue', value: Number(revenue.toFixed(2)) },
        ],
        myProducts: myProducts.map((product) => serializeProduct(product, userLookup)),
        myOrders: myOrders.map((order) => ({
          ...order,
          product: productLookup.get(order.productId) || null,
        })),
        analytics: {
          summary: {
            totalProducts: myProducts.length,
            ordersCount: myOrders.length,
            soldItems: orderedItems,
            income: revenue,
            mostViewedProduct:
              [...myProducts].sort((left, right) => Number(right.viewsCount || 0) - Number(left.viewsCount || 0))[0] || null,
            mostOrderedProduct:
              [...myProducts].sort((left, right) => Number(right.orderedQuantity || 0) - Number(left.orderedQuantity || 0))[0] || null,
          },
          chartData: buildSellerChartData(myOrders, myProducts),
        },
        notifications: myNotifications.slice(0, 6),
        recentFeed: updateFeed.slice(0, 5).map((entry) => serializeFeed(entry, userLookup)),
      },
    });
  }

  if (role === ROLES.STADIUM_OWNER) {
    const [myStadiums, ownerBookings, requests, ownerMessages, ownerNotifications] = await Promise.all([
      listStadiumsByOwner(req.user._id),
      listBookingsByOwner(req.user._id),
      listUnblockRequestsByOwner(req.user._id),
      listMessagesByUser(req.user._id),
      listNotificationsByUser(req.user._id),
    ]);

    const revenue = payments
      .filter(
        (payment) =>
          payment.contextType === 'stadium' &&
          payment.payeeId === req.user._id &&
          ['mock_paid', 'offline_pending'].includes(payment.status),
      )
      .reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
    const activeBlocks = blocks.filter(
      (block) => block.ownerId === req.user._id && block.status === 'active',
    );
    const bookingUsers = [
      ...new Set([
        ...ownerBookings.map((booking) => booking.userId),
        ...activeBlocks.map((block) => block.blockedUserId),
        ...requests.map((request) => request.blockedUserId),
      ]),
    ];
    const ownerUsers = bookingUsers
      .map((userId) => {
        const member = userLookup.get(userId);
        const memberBookings = ownerBookings.filter((booking) => booking.userId === userId);
        const memberBlock = activeBlocks.find((block) => block.blockedUserId === userId) || null;
        const memberRequests = requests.filter((request) => request.blockedUserId === userId);

        return {
          user: member ? sanitizeUser(member) : null,
          bookingCount: memberBookings.length,
          lastBooking: memberBookings[0] || null,
          history: memberBookings.map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
          block: memberBlock,
          requests: memberRequests,
        };
      })
      .filter((entry) => entry.user);
    const availableMembers = users
      .filter((member) => [ROLES.USER, ROLES.SELLER].includes(member.role))
      .map((member) => ({
        user: sanitizeUser(member),
        block: activeBlocks.find((block) => block.blockedUserId === member._id) || null,
      }));
    const popularSlots = Object.entries(
      ownerBookings.reduce((accumulator, booking) => {
        const key = `${booking.startTime} - ${booking.endTime}`;
        accumulator[key] = Number(accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    )
      .map(([slot, count]) => ({
        slot,
        count,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        role,
        stats: [
          { label: 'My stadiums', value: myStadiums.length },
          { label: 'Total bookings', value: ownerBookings.length },
          { label: 'Cancelled bookings', value: ownerBookings.filter((booking) => ['cancelled', 'rejected'].includes(booking.status)).length },
          { label: 'Revenue', value: Number(revenue.toFixed(2)) },
          { label: 'Pending requests', value: requests.filter((request) => request.status === 'pending').length },
        ],
        myStadiums: myStadiums.map((stadium) => serializeStadium(normalizeStadiumSchedule(stadium), userLookup)),
        ownerBookings: ownerBookings.map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
        activeBlocks,
        pendingRequests: requests.filter((request) => request.status === 'pending'),
        ownerUsers,
        availableMembers,
        notifications: ownerNotifications.slice(0, 6),
        analytics: {
          summary: {
            totalBookings: ownerBookings.length,
            cancelledBookings: ownerBookings.filter((booking) => ['cancelled', 'rejected'].includes(booking.status)).length,
            blockedUsersCount: activeBlocks.length,
            income: Number(revenue.toFixed(2)),
            pendingRequests: requests.filter((request) => request.status === 'pending').length,
            popularTimeSlots: popularSlots,
            messagesCount: ownerMessages.length,
          },
          chartData: buildOwnerChartData(ownerBookings),
          stadiumUsage: myStadiums.map((stadium) => ({
            name: stadium.name,
            bookings: ownerBookings.filter((booking) => booking.stadiumId === stadium._id).length,
          })),
        },
      },
    });
  }

  return res.json({
    success: true,
    data: {
      role,
      stats: [
        { label: 'Users', value: users.length },
        { label: 'Stadiums', value: stadiums.length },
        { label: 'Products', value: products.length },
        { label: 'Bookings', value: bookings.length },
      ],
      recentUsers: users.slice(0, 5).map((member) => sanitizeUser(member)),
      recentBookings: bookings
        .slice(0, 5)
        .map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
      recentFeed: updateFeed.slice(0, 5).map((entry) => serializeFeed(entry, userLookup)),
    },
  });
};
