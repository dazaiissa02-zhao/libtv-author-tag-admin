export function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

export function getLabelTextColor(bgColor) {
  if (!bgColor || bgColor.length < 7) {
    return '#FFFFFF';
  }

  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1A202C' : '#FFFFFF';
}
