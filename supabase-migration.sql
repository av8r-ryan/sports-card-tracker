-- Sports Card Tracker Database Schema for Supabase PostgreSQL
-- Project ID: dicstmwvrpyyszqxubhu

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_photo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- =====================================================
-- COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_default ON public.collections(user_id, is_default);

-- Add RLS policies for collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections"
    ON public.collections FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own collections"
    ON public.collections FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own collections"
    ON public.collections FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own collections"
    ON public.collections FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    collection_id UUID,
    player TEXT NOT NULL,
    year INTEGER NOT NULL,
    brand TEXT NOT NULL,
    card_number TEXT,
    category TEXT NOT NULL,
    team TEXT,
    condition TEXT,
    grading_company TEXT,
    grade TEXT,
    cert_number TEXT,
    purchase_price DECIMAL(10, 2),
    current_value DECIMAL(10, 2),
    purchase_date DATE,
    sell_price DECIMAL(10, 2),
    sell_date DATE,
    notes TEXT,
    image_url TEXT,
    image_front TEXT,
    image_back TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_collection FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_collection_id ON public.cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_cards_player ON public.cards(player);
CREATE INDEX IF NOT EXISTS idx_cards_year ON public.cards(year);
CREATE INDEX IF NOT EXISTS idx_cards_category ON public.cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_user_year ON public.cards(user_id, year);
CREATE INDEX IF NOT EXISTS idx_cards_user_category ON public.cards(user_id, category);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at DESC);

-- Add RLS policies for cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards"
    ON public.cards FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own cards"
    ON public.cards FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own cards"
    ON public.cards FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own cards"
    ON public.cards FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- BACKUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('auto', 'manual')),
    data JSONB NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON public.backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_type ON public.backups(user_id, type);

-- Add RLS policies for backups
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backups"
    ON public.backups FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own backups"
    ON public.backups FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own backups"
    ON public.backups FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get portfolio stats for a user
CREATE OR REPLACE FUNCTION get_portfolio_stats(p_user_id UUID)
RETURNS TABLE (
    total_cards BIGINT,
    total_value DECIMAL,
    total_invested DECIMAL,
    net_gain_loss DECIMAL,
    roi DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_cards,
        COALESCE(SUM(current_value), 0) as total_value,
        COALESCE(SUM(purchase_price), 0) as total_invested,
        COALESCE(SUM(current_value - COALESCE(purchase_price, 0)), 0) as net_gain_loss,
        CASE
            WHEN COALESCE(SUM(purchase_price), 0) > 0
            THEN (COALESCE(SUM(current_value - COALESCE(purchase_price, 0)), 0) / SUM(purchase_price)) * 100
            ELSE 0
        END as roi
    FROM public.cards
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure default collection exists
CREATE OR REPLACE FUNCTION ensure_default_collection(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_collection_id UUID;
BEGIN
    -- Check if default collection exists
    SELECT id INTO v_collection_id
    FROM public.collections
    WHERE user_id = p_user_id AND is_default = true
    LIMIT 1;

    -- If not, create it
    IF v_collection_id IS NULL THEN
        INSERT INTO public.collections (user_id, name, description, is_default)
        VALUES (p_user_id, 'My Collection', 'Default collection', true)
        RETURNING id INTO v_collection_id;
    END IF;

    RETURN v_collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment below to add sample admin user
/*
INSERT INTO public.users (id, username, email, role)
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'admin', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;
*/

-- =====================================================
-- GRANTS (if needed for specific roles)
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant access to anon users (limited)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
