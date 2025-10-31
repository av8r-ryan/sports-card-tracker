-- Sports Card Tracker Database Schema for Supabase PostgreSQL
-- Project ID: dicstmwvrpyyszqxubhu
-- FIXED VERSION - No permission errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_photo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    collection_id TEXT,
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- BACKUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.backups (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('auto', 'manual')),
    data JSONB NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_default ON public.collections(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_collection_id ON public.cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_cards_player ON public.cards(player);
CREATE INDEX IF NOT EXISTS idx_cards_year ON public.cards(year);
CREATE INDEX IF NOT EXISTS idx_cards_category ON public.cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_user_year ON public.cards(user_id, year);
CREATE INDEX IF NOT EXISTS idx_cards_user_category ON public.cards(user_id, category);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON public.backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_type ON public.backups(user_id, type);

-- =====================================================
-- ROW LEVEL SECURITY DISABLED FOR SIMPLICITY
-- =====================================================
-- You can enable RLS later if needed
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
