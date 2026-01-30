-- Group Interview Registration Schema
-- PostgreSQL database for tracking group interview signups
-- Max 100 registrations per interview slot

CREATE TABLE IF NOT EXISTS group_interview_registrations (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    interview_date TIMESTAMPTZ NOT NULL,
    interview_label VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate registrations for the same person on the same date
    CONSTRAINT unique_email_per_date UNIQUE (email, interview_date)
);

-- Index for fast availability checks (COUNT queries by date)
CREATE INDEX idx_registrations_interview_date
    ON group_interview_registrations (interview_date);

-- Index for lookup by email
CREATE INDEX idx_registrations_email
    ON group_interview_registrations (email);
