export const formatDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', opts);
};

export const waLink = (num = '') => {
  let digits = String(num).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = '92' + digits.slice(1);
  return digits ? `https://wa.me/${digits}` : '';
};

export const telLink = (num = '') => `tel:${String(num).replace(/[^\d+]/g, '')}`;
export const truncate = (s = '', n = 160) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
export const isSafeUrl = (u) => /^(https?:\/\/|\/)/i.test(u || '');
