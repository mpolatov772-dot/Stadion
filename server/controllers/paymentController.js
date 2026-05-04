import { listProducts } from '../models/Product.js';
import { listStadiums } from '../models/Stadium.js';
import { listUsers } from '../models/User.js';
import { listPaymentsByPayer } from '../models/Payment.js';
import { createMarketOrder } from './orderController.js';

export const checkoutProduct = async (req, res) => createMarketOrder(req, res);

export const getMyPayments = async (req, res) => {
  const [payments, users, stadiums, products] = await Promise.all([
    listPaymentsByPayer(req.user._id),
    listUsers(),
    listStadiums(),
    listProducts(),
  ]);

  const userLookup = new Map(users.map((user) => [user._id, user]));
  const stadiumLookup = new Map(stadiums.map((stadium) => [stadium._id, stadium]));
  const productLookup = new Map(products.map((product) => [product._id, product]));

  res.json({
    success: true,
    data: payments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((payment) => ({
        ...payment,
        stadium: payment.stadiumId ? stadiumLookup.get(payment.stadiumId) : null,
        product: payment.productId ? productLookup.get(payment.productId) : null,
        payee: userLookup.get(payment.payeeId)
          ? {
              _id: payment.payeeId,
              fullName: userLookup.get(payment.payeeId).fullName,
              role: userLookup.get(payment.payeeId).role,
            }
          : null,
      })),
  });
};
