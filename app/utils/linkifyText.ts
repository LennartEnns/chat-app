import linkifyHtml from 'linkify-html';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default (text: string) => {
  // Escape HTML characters to avoid XSS attacks
  // Very important!!!
  const escaped = escapeHtml(text);

  return linkifyHtml(escaped, {
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'underline',
    nl2br: true,
  });
}
