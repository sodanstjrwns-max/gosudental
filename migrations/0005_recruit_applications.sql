-- 상시 인재채용(/recruit) 지원서. 보유기간: 채용 절차 종료 후 1년 또는 삭제 요청 시까지(관리자 삭제).
CREATE TABLE IF NOT EXISTS recruit_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  field TEXT NOT NULL,
  experience TEXT,
  start_date TEXT,
  intro TEXT,
  privacy_consent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_recruit_created ON recruit_applications(created_at DESC);
