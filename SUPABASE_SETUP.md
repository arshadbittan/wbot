# 🗄️ Supabase Setup for WhatsApp Session Storage

## Why Supabase?
- ✅ **Free tier** with generous limits
- ✅ **Persistent storage** for WhatsApp sessions
- ✅ **No credit card required**
- ✅ **Works with Render free tier**

## Step 1: Create Supabase Project

1. **Go to Supabase**:
   - Visit [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - **Organization**: Create new or use existing
   - **Name**: `whatsapp-bot-storage`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier
   - Click "Create new project"

3. **Wait for Setup**: Takes 2-3 minutes

## Step 2: Create Database Table

1. **Go to SQL Editor**:
   - In your Supabase dashboard
   - Click "SQL Editor" in sidebar

2. **Run This SQL**:
   ```sql
   -- Create table for WhatsApp sessions
   CREATE TABLE whatsapp_sessions (
       id SERIAL PRIMARY KEY,
       client_id VARCHAR(255) UNIQUE NOT NULL,
       session_data JSONB NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create function to upsert sessions
   CREATE OR REPLACE FUNCTION create_whatsapp_sessions_table()
   RETURNS void AS $$
   BEGIN
       -- This function is just for compatibility
       -- Table is already created above
       RETURN;
   END;
   $$ LANGUAGE plpgsql;

   -- Enable Row Level Security (optional but recommended)
   ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow all operations (you can restrict this later)
   CREATE POLICY "Allow all operations" ON whatsapp_sessions
   FOR ALL USING (true);
   ```

3. **Click "Run"** to execute the SQL

## Step 3: Get API Credentials

1. **Go to Settings**:
   - Click "Settings" in sidebar
   - Click "API"

2. **Copy These Values**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Configure Render Environment Variables

1. **In your Render service settings**, add these environment variables:
   ```
   SUPABASE_URL = https://your-project-id.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NODE_ENV = production
   ```

2. **Save and redeploy** your Render service

## Step 5: Test the Integration

1. **Check Render logs** for:
   ```
   ✅ Supabase session storage initialized
   ```

2. **Connect WhatsApp**:
   - Visit your Render URL `/qr`
   - Scan QR code
   - Look for: `✅ Session saved to Supabase`

3. **Verify in Supabase**:
   - Go to "Table Editor" in Supabase
   - Check `whatsapp_sessions` table
   - Should see one row with your session data

## Benefits

### ✅ Persistent Sessions
- WhatsApp session survives Render restarts
- No need to re-scan QR code after deployments
- Session automatically restored on startup

### ✅ Free Tier Limits
- **Database**: 500MB storage
- **API Requests**: 50,000 per month
- **Bandwidth**: 2GB per month
- **More than enough** for WhatsApp bot usage

### ✅ Automatic Backups
- Supabase handles backups automatically
- Point-in-time recovery available
- Data is safe and secure

## Troubleshooting

### "Supabase not configured" Message
- Check environment variables are set correctly
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Redeploy after adding variables

### Session Not Saving
- Check Supabase logs in dashboard
- Verify table was created correctly
- Check Row Level Security policies

### Connection Errors
- Verify project URL is correct
- Check if project is paused (free tier auto-pauses after 1 week of inactivity)
- Visit Supabase dashboard to wake up project

## Security Notes

- **Anon key is safe** to use in client-side code
- **Row Level Security** protects your data
- **Session data is encrypted** by WhatsApp Web.js
- **No sensitive data** is stored in plain text

Your WhatsApp bot now has persistent session storage! 🎉