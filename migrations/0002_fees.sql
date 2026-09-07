-- 비급여 진료비(수가) 테이블 — 원장 편집 + 항목별 공개/비공개 토글
-- 기존 하드코딩 데이터(src/data/site.ts 의 PRICING) 구조를 그대로 담는다.
--   category(=분류 제목) / name(=항목명) / price(=금액 표기) / note(=비고)
--   is_published(=공개/비공개, 기본 공개) / sort_group·sort_order(=정렬)
CREATE TABLE IF NOT EXISTS fees (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  category      TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  price         TEXT    NOT NULL,
  note          TEXT,
  is_published  INTEGER NOT NULL DEFAULT 1,
  sort_group    INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fees_group_order ON fees(sort_group, sort_order);
CREATE INDEX IF NOT EXISTS idx_fees_published   ON fees(is_published);

-- 시드 (src/data/site.ts PRICING 기준, 전 항목 공개)
INSERT INTO fees (category, name, price, note, is_published, sort_group, sort_order) VALUES
  ('임플란트', '임플란트 (국산, 1치 기준)', '개원 시 확정 고지', '뼈이식 별도', 1, 1, 0),
  ('임플란트', '임플란트 뼈이식 (부위당)', '개원 시 확정 고지', NULL, 1, 1, 1),
  ('임플란트', '만 65세 이상 보험 임플란트', '본인부담 30%', '평생 2개, 조건 있음', 1, 1, 2),
  ('치아교정', '교정 정밀진단', '개원 시 확정 고지', '개원 이벤트 시 진단비 안내 예정', 1, 2, 0),
  ('치아교정', '인비절라인 투명교정', '개원 시 확정 고지', '케이스 난이도별 상이', 1, 2, 1),
  ('치아교정', '소아·성장기 교정', '개원 시 확정 고지', NULL, 1, 2, 2),
  ('심미보철', '라미네이트 (1치)', '개원 시 확정 고지', NULL, 1, 3, 0),
  ('심미보철', '지르코니아 크라운 (1치)', '개원 시 확정 고지', NULL, 1, 3, 1),
  ('심미보철', '전문가 치아미백', '개원 시 확정 고지', NULL, 1, 3, 2),
  ('기타', '스케일링 (건강보험, 연 1회)', '본인부담금 약 15,000원 내외', '만 19세 이상', 1, 4, 0),
  ('기타', '슈링크 / 리쥬란', '개원 시 확정 고지', NULL, 1, 4, 1);
