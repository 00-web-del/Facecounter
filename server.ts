import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';

// --- Database Hybrid Logic ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const useSupabase = !!(supabaseUrl && supabaseKey);

let db: any = null;
let supabase: any = null;

if (useSupabase) {
  console.log('🚀 Using Supabase Cloud Database');
  supabase = createClient(supabaseUrl!, supabaseKey!);
} else {
  console.log('🏠 Using Local SQLite Database');
  const dbPath = isVercel ? '/tmp/facecounter.db' : 'facecounter.db';
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      profile TEXT
    )
  `);
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
  secret: 'facecounter-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // Required for SameSite=None
    sameSite: 'none',  // Required for cross-origin iframe
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Google OAuth Routes
app.get('/api/auth/google/url', (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  if (!client_id) {
    return res.status(500).json({ error: 'Google Client ID not configured. Please set GOOGLE_CLIENT_ID in Environment Variables.' });
  }

  const redirect_uri = `${process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ais-dev-qgj3radykfu42mblobivtt-41367093619.asia-east1.run.app')}/auth/google/callback`;
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account'
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url });
});

app.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = `${process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ais-dev-qgj3radykfu42mblobivtt-41367093619.asia-east1.run.app')}/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: client_id!,
        client_secret: client_secret!,
        redirect_uri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokens.error_description || 'Failed to exchange code');

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const googleUser = await userRes.json();

    // Find or create user
    let user: any = null;
    if (useSupabase) {
      const { data } = await supabase.from('users').select('*').eq('email', googleUser.email).single();
      user = data;
      if (!user) {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ email: googleUser.email, profile: { name: googleUser.name } }])
          .select().single();
        if (error) throw error;
        user = newUser;
      }
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(googleUser.email);
      if (!user) {
        const id = Date.now().toString();
        db.prepare('INSERT INTO users (id, email, profile) VALUES (?, ?, ?)').run(
          id, googleUser.email, JSON.stringify({ name: googleUser.name })
        );
        user = { id, email: googleUser.email };
      }
    }

    (req.session as any).userId = user.id;

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

// API Routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();

    if (useSupabase) {
      const { data, error } = await supabase.from('users').insert([{ email, password: hashedPassword }]).select().single();
      if (error) return res.status(400).json({ error: error.code === '23505' ? 'Email already exists' : error.message });
      (req.session as any).userId = data.id;
      res.json({ message: 'User created', user: { id: data.id, email: data.email } });
    } else {
      try {
        db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(id, email, hashedPassword);
        (req.session as any).userId = id;
        res.json({ message: 'User created', user: { id, email } });
      } catch (e: any) {
        res.status(400).json({ error: e.message.includes('UNIQUE') ? 'Email already exists' : 'Database error' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user: any = null;
    if (useSupabase) {
      const { data } = await supabase.from('users').select('*').eq('email', email).single();
      user = data;
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    (req.session as any).userId = user.id;
    res.json({ 
      user: { id: user.id, email: user.email },
      profile: typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/profile', async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { profile } = req.body;

  try {
    if (useSupabase) {
      await supabase.from('users').update({ profile }).eq('id', userId);
    } else {
      db.prepare('UPDATE users SET profile = ? WHERE id = ?').run(JSON.stringify(profile), userId);
    }
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not logged in' });

  try {
    let user: any = null;
    if (useSupabase) {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      user = data;
    } else {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ 
      user: { id: user.id, email: user.email },
      profile: typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!isVercel) {
  startServer();
}

export default app;
