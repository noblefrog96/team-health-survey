export function formatKST(date = new Date()) {
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  let hours = kstDate.getUTCHours();
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `✅ ${ampm} ${String(hours).padStart(2, '0')}:${minutes}`;
}
