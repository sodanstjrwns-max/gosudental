-- Non-destructive indexes for current public and admin query patterns.
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(lower(email));
CREATE INDEX IF NOT EXISTS idx_cases_published_created ON cases(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_doctor_published_created ON cases(doctor_slug, published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_category_published_created ON cases(category, published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_created ON posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_pinned_created ON notices(pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at DESC);
