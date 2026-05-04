export const buildUserLookup = (users = []) =>
  new Map(users.map((user) => [user._id, user]));

export const serializeUserPreview = (user) =>
  user
    ? {
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || '',
        businessProfile: user.businessProfile || {},
      }
    : null;

export const serializeStadium = (stadium, userLookup) => ({
  ...stadium,
  owner: serializeUserPreview(userLookup.get(stadium.ownerId)),
});

export const serializeProduct = (product, userLookup) => ({
  ...product,
  seller: serializeUserPreview(userLookup.get(product.sellerId)),
});

export const serializeFeed = (entry, userLookup) => ({
  ...entry,
  author: serializeUserPreview(userLookup.get(entry.authorId)),
});

export const serializeBooking = (booking, userLookup, stadiumLookup) => ({
  ...booking,
  user: serializeUserPreview(userLookup.get(booking.userId)),
  owner: serializeUserPreview(userLookup.get(booking.ownerId)),
  stadium: stadiumLookup.get(booking.stadiumId) || null,
});

export const serializeBlock = (block, userLookup) => ({
  ...block,
  blockedUser: serializeUserPreview(userLookup.get(block.blockedUserId)),
  owner: serializeUserPreview(userLookup.get(block.ownerId)),
});

export const serializeRequest = (request, userLookup) => ({
  ...request,
  blockedUser: serializeUserPreview(userLookup.get(request.blockedUserId)),
  owner: serializeUserPreview(userLookup.get(request.ownerId)),
});
