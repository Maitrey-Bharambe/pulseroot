import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import SecurityLog from '@/models/SecurityLog';
import { signAccessToken, signRefreshToken } from '@/lib/auth';

// 1. POST handler for local mock simulation
export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Profile details (name, email) are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists, otherwise create
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`[GoogleAuth] Creating new profile for mock: ${email}`);
      const randomPassword = uuidv4() + uuidv4();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      });

      await SecurityLog.create({
        eventType: 'auth_success',
        userId: user.id,
        ipAddress: ip,
        details: `Successful Google OAuth registration: profile generated for ${email}.`
      });
    } else {
      console.log(`[GoogleAuth] Profile found for existing user: ${email}`);
      await SecurityLog.create({
        eventType: 'auth_success',
        userId: user.id,
        ipAddress: ip,
        details: `Successful Google OAuth credentials validation: session loaded for ${email}.`
      });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1C3B2B&color=FCEDE8`
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Google Sign-In successful.',
      user: tokenPayload
    });

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('[GoogleCallbackAPI] Error authenticating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during Google OAuth handshake.' },
      { status: 500 }
    );
  }
}

// 2. GET handler for real Google server callback redirects
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  if (error) {
    console.error('[GoogleCallback] Google returned error:', error);
    return returnPopupResponse(null, `Google authorization refused: ${error}`);
  }

  if (!code) {
    return returnPopupResponse(null, 'Authorization callback code is missing.');
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/api/auth/google/callback';

    // Exchange authorization code for official OAuth tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('[GoogleCallback] Token exchange error response:', errText);
      return returnPopupResponse(null, 'Failed exchanging credentials token with Google.');
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch verified profile details
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      console.error('[GoogleCallback] UserInfo request failed:', profileResponse.status);
      return returnPopupResponse(null, 'Failed loading verified user profile information.');
    }

    const profile = await profileResponse.json();
    const { name, email, picture } = profile;

    await connectToDatabase();

    // Find or create profile record in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`[GoogleAuth] Registering real Google user: ${email}`);
      const randomPassword = uuidv4() + uuidv4();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      });

      await SecurityLog.create({
        eventType: 'auth_success',
        userId: user.id,
        ipAddress: ip,
        details: `Successful Google OAuth registration: profile generated for ${email}.`
      });
    } else {
      console.log(`[GoogleAuth] Session loaded for existing user: ${email}`);
      await SecurityLog.create({
        eventType: 'auth_success',
        userId: user.id,
        ipAddress: ip,
        details: `Successful Google OAuth credentials validation: session loaded for ${email}.`
      });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1C3B2B&color=FCEDE8`
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Build the success response page communicating back to parent layout
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Sign-In Successful</title>
      </head>
      <body>
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #4A5E2B;">
          <h2>Authentication Successful!</h2>
          <p>Closing gateway panel...</p>
        </div>
        <script>
          window.opener.postMessage({ 
            type: 'GOOGLE_AUTH_SUCCESS', 
            user: ${JSON.stringify(tokenPayload)} 
          }, window.location.origin);
        </script>
      </body>
      </html>
    `;

    const isProd = process.env.NODE_ENV === 'production';
    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });

    // Inject secure HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (err) {
    console.error('[GoogleCallback] Handle error:', err);
    return returnPopupResponse(null, 'Internal server error during Google credentials check.');
  }
}

// Return popup payload wrapper helper
function returnPopupResponse(user, errorMessage) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        window.opener.postMessage({ 
          type: '${user ? 'GOOGLE_AUTH_SUCCESS' : 'GOOGLE_AUTH_FAILURE'}', 
          ${user ? `user: ${JSON.stringify(user)}` : `message: "${errorMessage}"`}
        }, window.location.origin);
      </script>
    </body>
    </html>
  `;
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
