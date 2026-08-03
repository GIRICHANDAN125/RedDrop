/**
 * Formatters — Date, phone & distance utility functions for RedDrop AI V2
 */

/**
 * Format an ISO timestamp to a human-readable date string.
 * @param {string} iso - ISO 8601 date string
 * @returns {string} e.g. "Aug 3, 2026"
 */
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

/**
 * Format an ISO timestamp to a relative time string (e.g. "2 hours ago").
 * @param {string} iso
 * @returns {string}
 */
export const formatRelativeTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/**
 * Format a 10-digit phone number to readable format.
 * @param {string} num
 * @returns {string} e.g. "+91 98765 43210"
 */
export const formatPhone = (num) =>
  num ? `+91 ${num.slice(0, 5)} ${num.slice(5)}` : '';

/**
 * Format distance in km to a human-readable string.
 * @param {number} km
 * @returns {string} e.g. "850 m" or "12.3 km"
 */
export const formatDistance = (km) =>
  km == null ? '' : km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
