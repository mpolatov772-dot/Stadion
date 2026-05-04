import { findProductById, listProducts, updateProduct } from '../models/Product.js';
import { createOrder, listOrdersBySeller, listOrdersByUser } from '../models/Order.js';
import { findUserById, listUsers } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { assertNoActiveBlockRestriction } from '../utils/blocking.js';
import { notifyUser } from '../utils/notifications.js';
import { PAYMENT_OPTIONS, ROLES } from '../utils/constants.js';
import { buildPaymentBreakdown } from '../utils/payment.js';
import { buildTelegramLink, buildMarketTelegramMessage } from '../utils/telegram.js';
import { assertPositiveNumber } from '../utils/validation.js';

const serializeOrder = (order, userLookup, productLookup) => ({
  ...order,
  customer: userLookup.get(order.userId)
    ? {
        _id: order.userId,
        fullName: userLookup.get(order.userId).fullName,
        phone: userLookup.get(order.userId).phone,
      }
    : null,
  seller: userLookup.get(order.sellerId)
    ? {
        _id: order.sellerId,
        fullName: userLookup.get(order.sellerId).fullName,
        businessProfile: userLookup.get(order.sellerId).businessProfile || {},
      }
    : null,
  product: productLookup.get(order.productId) || null,
});

export const createMarketOrder = async (req, res) => {
  const {
    productId,
    quantity = 1,
    paymentOption,
    notes = '',
    deliveryAddress = '',
  } = req.body || {};

  if (!productId || !paymentOption) {
    throw new AppError('productId and paymentOption are required', 400);
  }

  if (!Object.values(PAYMENT_OPTIONS).includes(paymentOption)) {
    throw new AppError('Invalid payment option selected', 400);
  }

  if (!String(deliveryAddress || '').trim()) {
    throw new AppError('Delivery address is required', 400);
  }

  await assertNoActiveBlockRestriction(req.user);

  const product = await findProductById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const seller = await findUserById(product.sellerId);
  const normalizedQuantity = Math.max(1, Math.floor(assertPositiveNumber(quantity, 'Quantity')));

  if (normalizedQuantity > Number(product.stock || 0)) {
    throw new AppError('Requested quantity exceeds current stock', 400);
  }

  const breakdown = buildPaymentBreakdown(Number(product.price || 0) * normalizedQuantity, paymentOption);
  const order = await createOrder({
    productId: product._id,
    sellerId: product.sellerId,
    userId: req.user._id,
    quantity: normalizedQuantity,
    notes: notes.trim(),
    deliveryAddress: deliveryAddress.trim(),
    status: paymentOption === PAYMENT_OPTIONS.OFFLINE ? 'offline_pending' : 'pending',
    ...breakdown,
  });

  const telegramUrl = buildTelegramLink(
    buildMarketTelegramMessage({
      product,
      customer: req.user,
      quantity: normalizedQuantity,
      paymentOption,
      notes: notes.trim(),
      orderId: order._id,
      deliveryAddress: deliveryAddress.trim(),
    }),
    seller?.businessProfile?.telegram,
  );

  await updateProduct(product._id, {
    ordersCount: Number(product.ordersCount || 0) + 1,
    orderedQuantity: Number(product.orderedQuantity || 0) + normalizedQuantity,
  });

  await notifyUser({
    userId: product.sellerId,
    type: 'market-order',
    title: 'Yangi market buyurtmasi',
    content: `${req.user.fullName} ${product.name} mahsuloti bo'yicha buyurtma yubordi.`,
    link: '/dashboard',
    metadata: {
      orderId: order._id,
      productId: product._id,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      order: {
        ...order,
        telegramUrl,
      },
      telegramUrl,
      telegramUsername: seller?.businessProfile?.telegram || '@tohtasinov10',
    },
  });
};

export const getMyOrders = async (req, res) => {
  const [orders, users, products] = await Promise.all([
    listOrdersByUser(req.user._id),
    listUsers(),
    listProducts(),
  ]);

  const userLookup = new Map(users.map((user) => [user._id, user]));
  const productLookup = new Map(products.map((product) => [product._id, product]));

  res.json({
    success: true,
    data: orders
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((order) => serializeOrder(order, userLookup, productLookup)),
  });
};

export const getSellerOrders = async (req, res) => {
  if (![ROLES.SELLER, ROLES.ADMIN].includes(req.user.role)) {
    throw new AppError('You do not have access to this resource', 403);
  }

  const [orders, users, products] = await Promise.all([
    listOrdersBySeller(req.user._id),
    listUsers(),
    listProducts(),
  ]);

  const userLookup = new Map(users.map((user) => [user._id, user]));
  const productLookup = new Map(products.map((product) => [product._id, product]));

  res.json({
    success: true,
    data: orders
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((order) => serializeOrder(order, userLookup, productLookup)),
  });
};
