import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getSecretKey() {
  const key = process.env.SYSTEM_AES_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // 32-byte fallback key
  return Buffer.from(key.substring(0, 32), 'utf8');
}

/**
 * Encrypts cleartext using AES-256-CBC
 * @param {string} text 
 * @returns {string} ivHex:encryptedHex
 */
export function encrypt(text) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Field Encryption error:', err);
    return '';
  }
}

/**
 * Decrypts encrypted payload back to cleartext
 * @param {string} encryptedText ivHex:encryptedHex
 * @returns {string} decryptedText
 */
export function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return '';
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Field Decryption error:', err);
    return '';
  }
}
