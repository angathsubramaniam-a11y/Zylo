import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import Razorpay from 'razorpay';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import { products, sellers } from './data.js';
import { createSupabaseRepository } from './supabaseRepository.js';

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 4000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT || 5);
const productImageBucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || 'product-images';
const profileImageBucket = process.env.SUPABASE_PROFILE_IMAGE_BUCKET || productImageBucket;

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    credentials: true
  }
});

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      })
    : null;

const supabase =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;
const supabaseRepo = supabase ? createSupabaseRepository(supabase) : null;

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '15mb' }));

function getErrorMessage(error, fallback = 'Request failed.') {
  if (typeof error === 'string') return error;
  if (error?.error?.description) return error.error.description;
  if (error?.message) return error.message;
  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== '{}' ? serialized : fallback;
  } catch {
    return fallback;
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled async rejection:', getErrorMessage(reason));
});

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);
}

function isUuid(value = '') {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function calculateCommission(amount) {
  const commission = Math.round((Number(amount) * commissionPercent) / 100);
  return {
    commission,
    sellerEarnings: Number(amount) - commission
  };
}

async function ensureProductImageBucket(bucketName = productImageBucket) {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (data.some((bucket) => bucket.name === bucketName)) return;

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024
  });

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw createError;
  }
}

function parseImageDataUrl(dataUrl = '') {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) {
    throw new Error('Upload a valid JPG, PNG, WebP, or GIF image.');
  }

  const contentType = match[1].toLowerCase().replace('image/jpg', 'image/jpeg');
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('Image must be 5 MB or smaller.');
  }

  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.replace('image/', '');
  return { buffer, contentType, extension };
}

async function uploadImageToStorage({ dataUrl, ownerId, folder, bucket = productImageBucket }) {
  if (!dataUrl) return '';
  if (!supabase) throw new Error('Connect Supabase before uploading product images.');

  const { buffer, contentType, extension } = parseImageDataUrl(dataUrl);
  await ensureProductImageBucket(bucket);

  const path = `${folder}/${ownerId}/${Date.now()}-${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadProductImage(dataUrl, sellerId) {
  return uploadImageToStorage({ dataUrl, ownerId: sellerId, folder: 'products' });
}

async function uploadProfileImage(dataUrl, userId) {
  return uploadImageToStorage({ dataUrl, ownerId: userId, folder: 'profiles', bucket: profileImageBucket });
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'Zylo API',
    mode: supabase ? 'supabase' : 'empty',
    realtime: 'socket.io',
    payments: razorpay ? 'razorpay-configured' : 'not-configured'
  });
});

app.get('/api/products', async (req, res) => {
  try {
    if (supabaseRepo) return res.json({ products: await supabaseRepo.listProducts(), mode: 'supabase' });
    res.json({ products, mode: 'empty' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = supabaseRepo
      ? await supabaseRepo.getProduct(req.params.id)
      : products.find((item) => item.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product, mode: supabaseRepo ? 'supabase' : 'empty' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!supabaseRepo) {
      return res.status(503).json({ message: 'Connect Supabase before removing listings.' });
    }

    const { sellerId } = req.body;
    if (!isUuid(sellerId)) {
      return res.status(400).json({ message: 'A valid seller profile is required to remove a listing.' });
    }

    const product = await supabaseRepo.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.sellerId !== sellerId) {
      return res.status(403).json({ message: 'Only the seller who created this product can remove it.' });
    }

    const removedProduct = await supabaseRepo.deleteListing(req.params.id, sellerId);
    if (!removedProduct) return res.status(404).json({ message: 'Product already removed.' });

    io.emit('notification:new', {
      id: `n-${Date.now()}`,
      type: 'listing',
      title: 'Listing removed',
      body: `${removedProduct.title} is no longer available.`
    });

    res.json({ ok: true, product: removedProduct, mode: 'supabase' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get('/api/sellers', async (req, res) => {
  try {
    const sellerList = supabaseRepo ? await supabaseRepo.listSellers() : sellers;
    res.json({ sellers: sellerList, mode: supabaseRepo ? 'supabase' : 'empty' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get('/api/sellers/:id', async (req, res) => {
  try {
    const seller = supabaseRepo
      ? await supabaseRepo.getSeller(req.params.id)
      : sellers.find((item) => item.id === req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const wallet = supabaseRepo ? await supabaseRepo.getWallet(seller.id) : null;
    res.json({ seller, wallet, mode: supabaseRepo ? 'supabase' : 'empty' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name, role = 'buyer' } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const cleanRole = role === 'seller' ? 'seller' : 'buyer';

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Use a valid email address.' });
    }
    if (!cleanName) {
      return res.status(400).json({ message: 'Enter your name to continue.' });
    }

    if (supabase) {
      const existingProfile = await supabaseRepo.getProfileByEmail(cleanEmail);
      if (existingProfile) {
        return res.json({
          user: {
            id: existingProfile.id,
            email: existingProfile.email,
            user_metadata: {
              name: existingProfile.name,
              role: existingProfile.role,
              verified_student: existingProfile.verified
            }
          },
          profile: existingProfile,
          existing: true,
          mode: 'supabase'
        });
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: false,
        user_metadata: { name: cleanName, role: cleanRole, verified_student: true }
      });
      if (error) {
        return res.status(400).json({ message: getErrorMessage(error, 'Could not create student profile.') });
      }

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        verified_student: true,
        campus: null
      });
      if (upsertError) throw upsertError;

      const profile = await supabaseRepo.getSeller(data.user.id);
      return res.json({ user: data.user, profile, existing: false, mode: 'supabase' });
    }

    res.json({
      user: {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        role: cleanRole,
        verified: true
      },
      mode: 'local'
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error, 'Could not create student profile.') });
  }
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Valid email required.' });
  res.json({ session: { token: `zylo_session_${Date.now()}`, email, verified: true } });
});

app.patch('/api/profile', async (req, res) => {
  try {
    const { id, name, campus = '', role = 'buyer', avatar = '', avatarDataUrl = '' } = req.body;

    if (!supabaseRepo) {
      return res.status(503).json({ message: 'Connect Supabase before saving profiles.' });
    }
    if (!isUuid(id)) {
      return res.status(400).json({ message: 'A valid student profile is required.' });
    }
    if (!String(name || '').trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ message: 'Choose buyer or seller role.' });
    }

    const avatarUrl = avatarDataUrl ? await uploadProfileImage(avatarDataUrl, id) : String(avatar || '').trim();

    const profile = await supabaseRepo.updateProfile(id, {
      name: String(name).trim(),
      campus: String(campus || '').trim(),
      role,
      avatar: avatarUrl
    });

    res.json({ profile, mode: 'supabase' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error, 'Could not save profile.') });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    let listing = {
      ...req.body,
      id: req.body.id || `p-${Date.now()}`,
      sold: false
    };

    if (!supabaseRepo) {
      return res.status(503).json({ message: 'Connect Supabase before publishing listings.' });
    }
    if (!isUuid(listing.sellerId)) {
      return res.status(400).json({ message: 'A valid Supabase seller profile is required to create a listing.' });
    }

    if (listing.imageDataUrl) {
      const imageUrl = await uploadProductImage(listing.imageDataUrl, listing.sellerId);
      listing.image = imageUrl;
      listing.images = [imageUrl];
      delete listing.imageDataUrl;
    }

    listing = await supabaseRepo.createListing(listing);

    io.emit('notification:new', {
      id: `n-${Date.now()}`,
      type: 'listing',
      title: 'New campus drop',
      body: `${listing.title} just went live.`
    });
    res.status(201).json({ product: listing, mode: 'supabase' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.post('/api/payments/checkout', async (req, res) => {
  try {
    const { productId, sellerId, amount } = req.body;
    const product = supabaseRepo ? await supabaseRepo.getProduct(productId) : products.find((item) => item.id === productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!razorpay || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Connect Razorpay key ID and key secret before accepting payments.' });
    }

    const finalAmount = Number(amount || product.price);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ message: 'Enter a valid payment amount.' });
    }

    const { commission, sellerEarnings } = calculateCommission(finalAmount);
    const receipt = `zylo_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      receipt,
      notes: {
        productId,
        sellerId,
        commission,
        sellerEarnings
      }
    });

    return res.json({ ...order, commission, sellerEarnings, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay checkout failed:', getErrorMessage(error));
    res.status(502).json({
      message: getErrorMessage(error, 'Razorpay checkout failed. Check your key ID and key secret.')
    });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    if (!supabaseRepo) {
      return res.status(503).json({ message: 'Connect Supabase before recording payments.' });
    }
    const { sellerId, productId, amount, razorpayOrderId } = req.body;
    const product = await supabaseRepo.getProduct(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const finalAmount = Number(amount || product.price);
    const { commission, sellerEarnings } = calculateCommission(finalAmount);
    let wallet;

    wallet = await supabaseRepo.recordPayment({
      product,
      sellerId,
      amount: finalAmount,
      commission,
      sellerEarnings,
      razorpayOrderId
    });

    io.to(sellerId).emit('notification:new', {
      id: `n-${Date.now()}`,
      type: 'payment',
      title: 'Payment success',
      body: `${product.title} sold. Seller wallet updated.`
    });

    res.json({ ok: true, wallet, mode: 'supabase' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get('/api/wallet/:sellerId', async (req, res) => {
  try {
    const wallet = supabaseRepo ? await supabaseRepo.getWallet(req.params.sellerId) : null;
    res.json({ wallet, mode: supabaseRepo ? 'supabase' : 'empty' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    if (supabaseRepo) {
      const adminData = await supabaseRepo.getAdminData();
      const sellerList = await supabaseRepo.listSellers();
      return res.json({
        ...adminData,
        activeUsers: sellerList.length,
        reportsSolved: adminData.reports.filter((report) => String(report.status).toLowerCase() === 'removed' || String(report.status).toLowerCase() === 'resolved').length,
        mode: 'supabase'
      });
    }

    res.json({
      reports: [],
      payouts: [],
      activeUsers: 0,
      reportsSolved: 0,
      mode: 'empty'
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.post('/api/payouts/:id/mark-paid', async (req, res) => {
  try {
    if (supabaseRepo) {
      const payout = await supabaseRepo.markPayoutPaid(req.params.id);
      return res.json({ payout, mode: 'supabase' });
    }

    res.status(503).json({ message: 'Connect Supabase before managing payouts.' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    if (!supabaseRepo) {
      return res.status(503).json({ message: 'Connect Supabase before creating reports.' });
    }

    const report = await supabaseRepo.createReport(req.body);
    res.status(201).json({ report, mode: 'supabase' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

io.on('connection', (socket) => {
  socket.on('join-campus', ({ campus, userId }) => {
    socket.join(campus || 'campus');
    if (userId) socket.join(userId);
  });

  socket.on('message:send', (message) => {
    io.emit('message:new', {
      id: `m-${Date.now()}`,
      at: 'Now',
      seen: false,
      ...message
    });
  });

  socket.on('typing', ({ threadId, userId }) => {
    socket.broadcast.emit('typing', { threadId, userId });
  });
});

server.listen(port, () => {
  console.log(`Zylo API running on http://localhost:${port}`);
});
