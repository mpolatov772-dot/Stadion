import { createFeedEntry } from '../models/Feed.js';
import {
  createProduct,
  findProductById,
  listProducts,
  listProductsBySeller,
  updateProduct,
} from '../models/Product.js';
import { listUsers } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../utils/constants.js';
import {
  assertPositiveNumber,
  assertRequired,
  normalizeList,
} from '../utils/validation.js';
import { buildUserLookup, serializeProduct } from '../utils/serializers.js';

const validateProductPayload = (payload) => {
  assertRequired(['name', 'category', 'description', 'price', 'stock'], payload);
};

const mapProductPayload = (payload, sellerId) => ({
  sellerId,
  name: payload.name.trim(),
  category: payload.category.trim(),
  description: payload.description.trim(),
  price: assertPositiveNumber(payload.price, 'Price'),
  stock: Math.floor(assertPositiveNumber(payload.stock, 'Stock')),
  images: normalizeList(payload.images),
  specs: normalizeList(payload.specs),
  featured: Boolean(payload.featured),
});

export const getProducts = async (req, res) => {
  const { search = '', category = '' } = req.query;
  const products = await listProducts();
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  const filtered = products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(String(search).toLowerCase()) ||
      product.description.toLowerCase().includes(String(search).toLowerCase());
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  res.json({
    success: true,
    data: filtered
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .map((product) => serializeProduct(product, userLookup)),
  });
};

export const getMyProducts = async (req, res) => {
  const users = await listUsers();
  const userLookup = buildUserLookup(users);
  const products =
    req.user.role === ROLES.ADMIN
      ? await listProducts()
      : await listProductsBySeller(req.user._id);

  res.json({
    success: true,
    data: products.map((product) => serializeProduct(product, userLookup)),
  });
};

export const getProductById = async (req, res) => {
  const product = await findProductById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const shouldTrackView = req.query.trackView !== 'false';

  if (shouldTrackView) {
    await updateProduct(product._id, {
      viewsCount: Number(product.viewsCount || 0) + 1,
    });
  }

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: serializeProduct(
      shouldTrackView
        ? {
            ...product,
            viewsCount: Number(product.viewsCount || 0) + 1,
          }
        : product,
      userLookup,
    ),
  });
};

export const createNewProduct = async (req, res) => {
  validateProductPayload(req.body);

  const product = await createProduct(mapProductPayload(req.body, req.user._id));

  await createFeedEntry({
    authorId: req.user._id,
    authorRole: req.user.role,
    type: 'product-update',
    title: "Yangi mahsulot qo'shildi",
    content: `${product.name} do'kon katalogiga qo'shildi.`,
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.status(201).json({
    success: true,
    data: serializeProduct(product, userLookup),
  });
};

export const updateExistingProduct = async (req, res) => {
  const product = await findProductById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (req.user.role !== ROLES.ADMIN && product.sellerId !== req.user._id) {
    throw new AppError('You can only update your own products', 403);
  }

  validateProductPayload(req.body);
  const updated = await updateProduct(product._id, mapProductPayload(req.body, product.sellerId));

  await createFeedEntry({
    authorId: req.user._id,
    authorRole: req.user.role,
    type: 'product-update',
    title: 'Mahsulot katalogi yangilandi',
    content: `${updated.name} bo'yicha ombor va tavsif ma'lumotlari yangilandi.`,
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: serializeProduct(updated, userLookup),
  });
};
