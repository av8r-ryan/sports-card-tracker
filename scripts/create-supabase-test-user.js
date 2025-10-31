#!/usr/bin/env node

// Creates a Supabase Auth test user using the service role key
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const url = process.env.REACT_APP_SUPABASE_URL;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  console.error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function createTestUser() {
  const email = process.env.TEST_USER_EMAIL || 'test.user@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'TestUser123!';
  const username = process.env.TEST_USER_USERNAME || 'testuser';

  console.log('Creating test user in Supabase Auth...');

  try {
    // Use Admin API to create a confirmed user
    const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    });

    if (adminErr) {
      // If user already exists, fetch it
      console.warn('Admin createUser error:', adminErr.message);
      const { data: existing, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;
      const found = existing.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) throw adminErr;
      adminData = { user: found }; // eslint-disable-line no-func-assign
    }

    const userId = adminData.user.id;
    console.log('Auth user ready:', userId);

    // Ensure profile row in public.users
    const { error: upsertErr } = await supabase
      .from('users')
      .upsert([{ id: userId, username, email, role: 'user' }]);
    if (upsertErr) throw upsertErr;

    // Ensure default collection
    await supabase.from('collections').upsert([
      { id: `default-${userId}`, user_id: userId, name: 'My Collection', description: 'Default collection', is_default: true }
    ]);

      console.log(`✅ Test user created\n- email: ${email}\n- password: ${password}\n- userId: ${userId}`);
  } catch (e) {
    console.error('Failed to create test user:', e.message);
    process.exit(1);
  }
}

createTestUser();
