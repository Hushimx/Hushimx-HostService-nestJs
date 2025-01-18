import { Transform } from 'class-transformer';
import { sanitizeHtml } from 'src/utils/sanitize-html';

export function Sanitize() {
  return Transform(({ value }) => (typeof value === 'string' ? sanitizeHtml(value) : value));
}
