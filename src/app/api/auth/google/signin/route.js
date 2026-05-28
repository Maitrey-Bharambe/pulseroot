import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (clientId && clientId.trim() !== '' && !clientId.includes('your_copied')) {
    console.log(`[GoogleAuth] Real credentials detected. Redirecting to Google authorization servers...`);
    const redirectUri = 'http://localhost:3000/api/auth/google/callback';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=consent`;
    
    return NextResponse.redirect(googleAuthUrl);
  }
  
  // Otherwise, fallback to the beautiful simulated account selector
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in with Google</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f0f4f9;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          user-select: none;
        }
        .container {
          background-color: #ffffff;
          border-radius: 28px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          text-align: center;
          box-sizing: border-box;
          border: 1px solid #e0e0e0;
        }
        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .logo {
          height: 24px;
        }
        h1 {
          font-size: 24px;
          font-weight: 500;
          color: #1f1f1f;
          margin: 0 0 8px 0;
        }
        .subtitle {
          font-size: 16px;
          color: #5f6368;
          margin: 0 0 28px 0;
        }
        .account-list {
          display: flex;
          flex-col: column;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .account-card {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: 1px solid #dadce0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
          text-align: left;
        }
        .account-card:hover {
          background-color: #f7f9fc;
          border-color: #c2e7ff;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e8f0fe;
          color: #1a73e8;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          font-size: 16px;
          text-transform: uppercase;
        }
        .account-info {
          flex-grow: 1;
        }
        .account-name {
          font-size: 14px;
          font-weight: 500;
          color: #3c4043;
        }
        .account-email {
          font-size: 12px;
          color: #5f6368;
          margin-top: 2px;
        }
        .custom-form {
          border-top: 1px dashed #dadce0;
          padding-top: 20px;
          margin-top: 12px;
          text-align: left;
        }
        .custom-title {
          font-size: 12px;
          font-weight: 700;
          color: #5f6368;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-group label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: #5f6368;
          margin-bottom: 4px;
        }
        input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          font-size: 13px;
          box-sizing: border-box;
          font-family: inherit;
        }
        input:focus {
          border-color: #1a73e8;
          outline: none;
          background-color: #f8fafd;
        }
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #0b57d0;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 8px;
        }
        .submit-btn:hover {
          background-color: #0b4eb8;
        }
        .footer {
          font-size: 12px;
          color: #757575;
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-link {
          color: #757575;
          text-decoration: none;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-container">
          <svg class="logo" viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.24 10.285V13.4h6.887c-.273 1.556-1.785 4.568-6.887 4.568-4.407 0-8-3.649-8-8.15s3.593-8.15 8-8.15c2.51 0 4.19 1.045 5.15 1.97l2.45-2.45c-1.57-1.47-3.61-2.365-7.6-2.365-5.58 0-10.1 4.52-10.1 10.1s4.52 10.1 10.1 10.1c5.83 0 9.7-4.1 9.7-9.87 0-.665-.07-1.17-.16-1.67H12.24z" fill="#4285F4"/>
            <path d="M29.5 8.5c-3.3 0-6 2.5-6 6s2.7 6 6 6 6-2.5 6-6-2.7-6-6-6zm0 9.6c-1.8 0-3.4-1.5-3.4-3.6s1.6-3.6 3.4-3.6 3.4 1.5 3.4 3.6-1.6 3.6-3.4 3.6z" fill="#EA4335"/>
            <path d="M43.5 8.5c-3.3 0-6 2.5-6 6s2.7 6 6 6 6-2.5 6-6-2.7-6-6-6zm0 9.6c-1.8 0-3.4-1.5-3.4-3.6s1.6-3.6 3.4-3.6 3.4 1.5 3.4 3.6-1.6 3.6-3.4 3.6z" fill="#FBBC05"/>
            <path d="M57 8.5c-3.2 0-5.8 2.6-5.8 6s2.6 6 5.8 6c1.6 0 2.8-.7 3.5-1.5V19c0 2.3-1.2 3.5-3.2 3.5-1.7 0-2.7-1.2-3.1-2.2l-2.8 1.2c.8 2 2.7 4.2 5.9 4.2 3.8 0 7-2.2 7-7.2V8.8h-2.8v1.1c-.7-.7-1.9-1.4-3.5-1.4zm-.2 9.6c-1.8 0-3.3-1.5-3.3-3.6s1.5-3.6 3.3-3.6 3.3 1.5 3.3 3.6-1.5 3.6-3.3 3.6z" fill="#4285F4"/>
            <path d="M68.5 1.5H65v18.7h3.5V1.5z" fill="#34A853"/>
            <path d="M78.5 14c-1.8 0-2.9-.8-3.7-2.3l10.3-4.3-.4-1c-.7-1.8-2.7-5.2-6.6-5.2-3.9 0-7.1 3-7.1 7.3 0 3.9 3.1 6.8 7 6.8 3.1 0 5-1.9 5.8-3l-2.3-1.5c-.7 1-1.7 1.7-3 1.7zm-.2-9c1.4 0 2.6.7 3 1.7l-7.2 3c-.1-2.4 1.8-3.9 3.4-3.9z" fill="#EA4335"/>
          </svg>
        </div>
        
        <h1>Sign in with Google</h1>
        <p class="subtitle">to continue to <b>pulseRoot</b></p>
        
        <div class="account-list">
          <div class="account-card" onclick="selectAccount('Maitrey Grower', 'maitrey.grower@gmail.com')">
            <div class="avatar" style="background-color: #E2F0D9; color: #385723;">M</div>
            <div class="account-info">
              <div class="account-name">Maitrey Grower</div>
              <div class="account-email">maitrey.grower@gmail.com</div>
            </div>
          </div>
          
          <div class="account-card" onclick="selectAccount('System Operator', 'operator@precisionagri.com')">
            <div class="avatar" style="background-color: #FCE4D6; color: #C65911;">O</div>
            <div class="account-info">
              <div class="account-name">System Operator</div>
              <div class="account-email">operator@precisionagri.com</div>
            </div>
          </div>
        </div>
        
        <div class="custom-form">
          <div class="custom-title">Or use custom Google account</div>
          <form onsubmit="handleCustomSubmit(event)">
            <div class="form-group">
              <label for="custom-name">Full Name</label>
              <input type="text" id="custom-name" placeholder="E.g. Jane Doe" required>
            </div>
            <div class="form-group">
              <label for="custom-email">Google Email Address</label>
              <input type="email" id="custom-email" placeholder="E.g. jane.doe@gmail.com" required>
            </div>
            <button type="submit" class="submit-btn">Next</button>
          </form>
        </div>

        <div class="footer">
          <span>English (United States)</span>
          <div>
            <a href="#" class="footer-link">Help</a>
            <a href="#" class="footer-link" style="margin-left: 12px;">Privacy</a>
            <a href="#" class="footer-link" style="margin-left: 12px;">Terms</a>
          </div>
        </div>
      </div>

      <script>
        async function authenticate(name, email) {
          try {
            const res = await fetch('/api/auth/google/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: data.user }, window.location.origin);
            } else {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', message: data.message }, window.location.origin);
            }
          } catch (err) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', message: 'Network connection error during handshake.' }, window.location.origin);
          }
        }

        function selectAccount(name, email) {
          authenticate(name, email);
        }

        function handleCustomSubmit(e) {
          e.preventDefault();
          const name = document.getElementById('custom-name').value;
          const email = document.getElementById('custom-email').value;
          authenticate(name, email);
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
