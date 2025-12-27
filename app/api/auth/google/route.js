import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import { decrypt } from '@/lib/crypto';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'pubg_uc_store';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

let client = null;
let db = null;

async function connectDB() {
  if (!client) {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
}

export async function GET(request) {
  try {
    const database = await connectDB();
    
    // Get OAuth settings from database
    const oauthSettings = await database.collection('oauth_settings').findOne({ provider: 'google' });
    
    // Check if Google OAuth is enabled
    if (!oauthSettings || !oauthSettings.enabled) {
      return NextResponse.redirect(`${BASE_URL}?error=oauth_disabled`);
    }

    // Check if credentials are configured
    if (!oauthSettings.clientId || !oauthSettings.clientSecret) {
      return NextResponse.redirect(`${BASE_URL}?error=oauth_not_configured`);
    }

    // Decrypt client ID
    let clientId;
    try {
      clientId = decrypt(oauthSettings.clientId);
    } catch (error) {
      console.error('Failed to decrypt client ID:', error);
      return NextResponse.redirect(`${BASE_URL}?error=oauth_config_error`);
    }

    // Get site base URL for callback
    const siteSettings = await database.collection('site_settings').findOne({ active: true });
    const baseUrl = siteSettings?.baseUrl || BASE_URL;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in database with expiry (5 minutes)
    await database.collection('oauth_states').insertOne({
      state,
      provider: 'google',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    // Redirect to Google
    return NextResponse.redirect(googleAuthUrl.toString());

  } catch (error) {
    console.error('Google OAuth init error:', error);
    return NextResponse.redirect(`${BASE_URL}?error=oauth_error`);
  }
}
