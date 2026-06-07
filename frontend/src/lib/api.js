const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch {
    throw new Error('API is offline. Start the Zylo backend on port 4000 and try again.');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let error = {};
    try {
      error = text ? JSON.parse(text) : {};
    } catch {
      error = {};
    }
    throw new Error(error.message || text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  health: () => request('/api/health'),
  signup: (payload) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateProfile: (payload) =>
    request('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  products: () => request('/api/products'),
  sellers: () => request('/api/sellers'),
  adminAnalytics: () => request('/api/admin/analytics'),
  createListing: (payload) =>
    request('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deleteListing: (productId, sellerId) =>
    request(`/api/products/${productId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sellerId })
    }),
  checkout: (payload) =>
    request('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  verifyPayment: (payload) =>
    request('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  markPayoutPaid: (payoutId) =>
    request(`/api/payouts/${payoutId}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({})
    })
};
