let version = 'dev';
try {
  version = require('./version.txt');
} catch {}
export default version; 