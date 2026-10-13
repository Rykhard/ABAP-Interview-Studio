CREATE TABLE IF NOT EXISTS job_requests (
  id TEXT PRIMARY KEY,
  client_hash TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  lease_until INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS job_requests_day ON job_requests(day);
CREATE INDEX IF NOT EXISTS job_requests_client ON job_requests(client_hash, created_at);
CREATE TABLE IF NOT EXISTS job_daily_blocks (day TEXT PRIMARY KEY);
