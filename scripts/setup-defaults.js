#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function setupDefaults() {
  console.log('🚀 Setting up default user and collection...\n');

  try {
    // Create default user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([{
        id: 'anonymous',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }])
      .select();

    if (userError && !userError.message.includes('duplicate')) {
      console.error('❌ Error creating user:', userError);
    } else {
      console.log('✅ Default user ready: admin');
    }

    // Create default collection
    const { data: collData, error: collError } = await supabase
      .from('collections')
      .upsert([{
        id: 'default-collection',
        user_id: 'anonymous',
        name: 'My Collection',
        description: 'Default collection for all cards',
        is_default: true
      }])
      .select();

    if (collError && !collError.message.includes('duplicate')) {
      console.error('❌ Error creating collection:', collError);
    } else {
      console.log('✅ Default collection ready: My Collection');
    }

    console.log('\n🎉 Setup complete! Your app is ready to use.\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDefaults();
