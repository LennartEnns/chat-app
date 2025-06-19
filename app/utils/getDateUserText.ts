export default (date: Date | null | undefined) => {
  if (!date) return '';
  const today = new Date();
  if (areDatesSame('day', date, today)) {
    return 'Today';
  }
  today.setDate(today.getDate() - 1);
  if (areDatesSame('day', date, today)) {
    return 'Yesterday';
  }
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date);
}
