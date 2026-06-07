export function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function getSeller(sellers, sellerId) {
  return sellers.find((seller) => seller.id === sellerId);
}

export function getProduct(products, productId) {
  return products.find((product) => product.id === productId);
}
