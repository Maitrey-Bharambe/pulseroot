import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_access_secret_precision_agri';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_precision_agri';

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Helper to extract and verify the JWT access token from request cookies.
 * @param {Request} request 
 * @returns {object|null} Decoded user payload if valid, else null
 */
export function getAuthenticatedUser(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((cookie) => {
        const parts = cookie.split('=');
        return [parts[0]?.trim(), parts.slice(1).join('=')?.trim()];
      })
    );
    
    const token = cookies['accessToken'];
    if (!token) return null;

    return verifyAccessToken(token);
  } catch (err) {
    console.error('[AuthHelper] Failed parsing authentication context:', err.message);
    return null;
  }
}
