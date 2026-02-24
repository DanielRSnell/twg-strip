-- Generic Form Submissions Schema
-- PostgreSQL table for collecting form data from any landing page
-- Uses JSONB for flexible per-form field storage

CREATE TABLE IF NOT EXISTS form_submissions (
    id SERIAL PRIMARY KEY,
    form_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookups by form type
CREATE INDEX idx_form_submissions_type ON form_submissions (form_type);

-- Chronological queries
CREATE INDEX idx_form_submissions_created ON form_submissions (created_at);
