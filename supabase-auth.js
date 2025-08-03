const { createClient } = require('@supabase/supabase-js');

class SupabaseAuth {
    constructor() {
        this.supabase = null;
        this.clientId = 'whatsapp-bot';
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.log('⚠️ Supabase not configured, using local storage');
            return;
        }

        try {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            await this.createTableIfNotExists();
            this.initialized = true;
            console.log('✅ Supabase session storage initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error.message);
        }
    }

    async createTableIfNotExists() {
        if (!this.supabase) return;

        try {
            // Create table for WhatsApp sessions
            const { error } = await this.supabase.rpc('create_whatsapp_sessions_table');
            if (error && !error.message.includes('already exists')) {
                console.error('Error creating table:', error);
            }
        } catch (error) {
            // Table might already exist, that's okay
            console.log('Table creation skipped (might already exist)');
        }
    }

    async saveSession(sessionData) {
        if (!this.supabase) return false;

        try {
            const { error } = await this.supabase
                .from('whatsapp_sessions')
                .upsert({
                    client_id: this.clientId,
                    session_data: sessionData,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error saving session:', error);
                return false;
            }

            console.log('✅ Session saved to Supabase');
            return true;
        } catch (error) {
            console.error('Error saving session:', error);
            return false;
        }
    }

    async loadSession() {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('whatsapp_sessions')
                .select('session_data')
                .eq('client_id', this.clientId)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Not found error
                    console.error('Error loading session:', error);
                }
                return null;
            }

            console.log('✅ Session loaded from Supabase');
            return data.session_data;
        } catch (error) {
            console.error('Error loading session:', error);
            return null;
        }
    }

    async deleteSession() {
        if (!this.supabase) return false;

        try {
            const { error } = await this.supabase
                .from('whatsapp_sessions')
                .delete()
                .eq('client_id', this.clientId);

            if (error) {
                console.error('Error deleting session:', error);
                return false;
            }

            console.log('✅ Session deleted from Supabase');
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }
}

module.exports = SupabaseAuth;