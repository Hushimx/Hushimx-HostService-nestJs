import * as DOMPurify from 'dompurify'; // Use `* as` for compatibility
import { JSDOM } from 'jsdom';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window);

export function sanitizeHtml(input: string): string {
    console.log("worked")
  return purify.sanitize(input || '');
}