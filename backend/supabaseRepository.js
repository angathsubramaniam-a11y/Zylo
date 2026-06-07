function toProduct(row) {
  if (!row) return null;
  const imageUrls = row.image_urls?.length ? row.image_urls : [];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price || row.price,
    category: row.category,
    condition: row.condition,
    location: row.location || '',
    sellerId: row.seller_id,
    featured: row.featured,
    trending: row.trending,
    sold: row.sold,
    tags: row.tags || [],
    views: row.views || 0,
    image: imageUrls[0] || row.image_url || '',
    images: imageUrls
  };
}

function toSeller(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    campus: row.campus,
    avatar: row.avatar_url,
    rating: Number(row.rating || 0),
    reviews: row.review_count || 0,
    verified: row.verified_student,
    premium: row.premium_seller || false,
    joined: row.joined_at,
    role: row.role
  };
}

function toProductRow(product) {
  return {
    seller_id: product.sellerId,
    title: product.title,
    description: product.description || '',
    price: Number(product.price),
    original_price: Number(product.originalPrice || product.price),
    category: product.category,
    condition: product.condition,
    location: product.location || null,
    image_urls: product.images?.length ? product.images : product.image ? [product.image] : [],
    tags: product.tags || [],
    featured: Boolean(product.featured),
    trending: Boolean(product.trending),
    sold: Boolean(product.sold),
    views: Number(product.views || 0)
  };
}

function emptyWallet() {
  return {
    totalEarnings: 0,
    pendingBalance: 0,
    withdrawn: 0,
    commissionPaid: 0,
    transactions: []
  };
}

export function createSupabaseRepository(supabase) {
  async function listProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(toProduct);
  }

  async function getProduct(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return null;
    return toProduct(data);
  }

  async function createListing(product) {
    const { data, error } = await supabase
      .from('products')
      .insert(toProductRow(product))
      .select('*')
      .single();

    if (error) throw error;
    return toProduct(data);
  }

  async function deleteListing(productId, sellerId) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('seller_id', sellerId)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return toProduct(data);
  }

  async function markProductSold(productId) {
    const { data, error } = await supabase
      .from('products')
      .update({ sold: true })
      .eq('id', productId)
      .select('*')
      .single();

    if (error) throw error;
    return toProduct(data);
  }

  async function getSeller(id) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return toSeller(data);
  }

  async function getProfileByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', String(email || '').trim())
      .maybeSingle();

    if (error) throw error;
    return toSeller(data);
  }

  async function updateProfile(id, profile) {
    const updates = {
      full_name: profile.name,
      campus: profile.campus || null,
      role: profile.role,
      avatar_url: profile.avatar || null
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toSeller(data);
  }

  async function listSellers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data.map(toSeller);
  }

  async function getWallet(sellerId) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*, order:orders(product:products(title))')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const wallet = emptyWallet();

    wallet.transactions = data.map((tx) => {
      const amount = Number(tx.amount || 0);
      const commission = Number(tx.commission || 0);
      const sellerEarnings = amount - commission;

      if (tx.status === 'withdrawn') wallet.withdrawn += sellerEarnings;
      else wallet.pendingBalance += sellerEarnings;
      wallet.totalEarnings += sellerEarnings;
      wallet.commissionPaid += commission;

      return {
        id: tx.id,
        product: tx.order?.product?.title || 'Unavailable product',
        amount,
        commission,
        sellerEarnings,
        status: tx.status
      };
    });

    return wallet;
  }

  async function recordPayment({ product, sellerId, amount, commission, sellerEarnings, razorpayOrderId }) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: sellerId,
        seller_id: sellerId,
        product_id: product.id,
        amount,
        platform_commission: commission,
        seller_earnings: sellerEarnings,
        razorpay_order_id: razorpayOrderId,
        status: 'paid'
      })
      .select('*')
      .single();

    if (orderError) throw orderError;

    const { error: txError } = await supabase.from('wallet_transactions').insert({
      seller_id: sellerId,
      order_id: order.id,
      amount,
      commission,
      status: 'pending'
    });

    if (txError) throw txError;
    await markProductSold(product.id);
    return getWallet(sellerId);
  }

  async function getAdminData() {
    const [{ data: reports, error: reportsError }, { data: payouts, error: payoutsError }] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('payouts').select('*, seller:profiles(full_name)').order('created_at', { ascending: false })
    ]);

    if (reportsError) throw reportsError;
    if (payoutsError) throw payoutsError;

    return {
      reports: reports.map((report) => ({
        id: report.id,
        item: report.product_id || 'Unavailable listing',
        reason: report.reason,
        status: report.status
      })),
      payouts: payouts.map((payout) => ({
        id: payout.id,
        sellerId: payout.seller_id,
        seller: payout.seller?.full_name || 'Unavailable seller',
        amount: payout.amount,
        status: payout.status === 'paid' ? 'Paid' : 'Pending'
      }))
    };
  }

  async function markPayoutPaid(id) {
    const { data, error } = await supabase
      .from('payouts')
      .update({ status: 'paid', marked_paid_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, seller:profiles(full_name)')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      sellerId: data.seller_id,
      seller: data.seller?.full_name || 'Unavailable seller',
      amount: data.amount,
      status: 'Paid'
    };
  }

  async function createReport(report) {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        product_id: report.productId || null,
        reason: report.reason,
        status: report.status || 'open'
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      item: data.product_id || 'Unavailable listing',
      reason: data.reason,
      status: data.status
    };
  }

  return {
    listProducts,
    getProduct,
    createListing,
    deleteListing,
    markProductSold,
    getSeller,
    getProfileByEmail,
    updateProfile,
    listSellers,
    getWallet,
    recordPayment,
    getAdminData,
    markPayoutPaid,
    createReport
  };
}
