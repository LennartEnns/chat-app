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
  return new Intl.DateTimeFormat('de-DE').format(date);
}
