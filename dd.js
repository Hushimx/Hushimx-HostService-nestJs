
let { existsSync } = require('fs');
import { join, normalize } from 'path';

const baseUploadDir = './uploads';
const photoPath = '/products/1736026267621-210k56you.jpg';

const fullPath = normalize(join(baseUploadDir, photoPath));
console.log('Normalized Full Path:', fullPath);

if (existsSync(fullPath)) {
  console.log('File exists:', fullPath);
} else {
  console.error('File not found:', fullPath);
}
