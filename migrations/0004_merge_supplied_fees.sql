-- Preserve the remote migration name/history and any administrator-edited prices.
-- Import supplied 106-row provisional fees ONLY when the DB exactly matches the old 11-row seed.
CREATE TABLE _fees_seed_import_guard (do_import INTEGER NOT NULL);
INSERT INTO _fees_seed_import_guard SELECT CASE WHEN
  (SELECT COUNT(*) FROM fees) = 11
  AND NOT EXISTS (SELECT 1 FROM fees WHERE updated_at <> created_at)
  AND NOT EXISTS (
    SELECT category,name,price,note,is_published,sort_group,sort_order FROM fees EXCEPT SELECT * FROM (VALUES
('임플란트','임플란트 (국산, 1치 기준)','개원 시 확정 고지','뼈이식 별도',1,1,0),
('임플란트','임플란트 뼈이식 (부위당)','개원 시 확정 고지',NULL,1,1,1),
('임플란트','만 65세 이상 보험 임플란트','본인부담 30%','평생 2개, 조건 있음',1,1,2),
('치아교정','교정 정밀진단','개원 시 확정 고지','개원 이벤트 시 진단비 안내 예정',1,2,0),
('치아교정','인비절라인 투명교정','개원 시 확정 고지','케이스 난이도별 상이',1,2,1),
('치아교정','소아·성장기 교정','개원 시 확정 고지',NULL,1,2,2),
('심미보철','라미네이트 (1치)','개원 시 확정 고지',NULL,1,3,0),
('심미보철','지르코니아 크라운 (1치)','개원 시 확정 고지',NULL,1,3,1),
('심미보철','전문가 치아미백','개원 시 확정 고지',NULL,1,3,2),
('기타','스케일링 (건강보험, 연 1회)','본인부담금 약 15,000원 내외','만 19세 이상',1,4,0),
('기타','슈링크 / 리쥬란','개원 시 확정 고지',NULL,1,4,1)
  )) THEN 1 ELSE 0 END;
DELETE FROM fees WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','메가젠 에니원','89만원','보증기간 3년',1,1,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','오스템 BA','99만원','보증기간 5년',1,1,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','메가젠 BD, Ari (프리미엄 라인)','119만원','보증기간 10년 / LDM 1회 무료',1,1,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','뼈이식 소범위 (뼈이식A)','25만원','작은 골결손 부위 (0.3cc)',1,1,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','뼈이식 중범위 (뼈이식 B)','50만원','membrane 추가, 중간 정도의 골결손 부위 (0.5cc)',1,1,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','뼈이식 광범위 (뼈이식 C)','75만원','광범위한 골결손 부위',1,1,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','상악동 거상술 내부 접근법 (상악동 A)','30만원','뼈이식 필요 없는 상악동 거상술',1,1,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','상악동 거상술 내부 접근법 (뼈이식 동반) (상악동 B)','45만원','뼈이식이 동반된 상악동 거상술',1,1,7 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','상악동 거상술 측방 접근법 (상악동 C)','90만원','잔존골 2mm 이하',1,1,8 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','인공치','50만원','',1,1,9 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','임시 앞니 틀니(flipper)','10만원','전치부 전체',1,1,10 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','즉시치아','15만원','전치부 전체',1,1,11 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','치아 사이 접촉면 보강 본원','5만원','면당',1,1,12 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','치아 사이 접촉면 보강 타원','10만원','보철물 재제작 가능성, 재제작 시 비용 차감',1,1,13 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','LDM (부종관리)','10만원','임플란트 및 발치 환자 5만원',1,1,14 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','잇몸이식술','50만원','치아당',1,1,15 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','임플란트 중간기둥, 크라운','30, 50만원','본원 보증기간 만료 이후, 타치과 임플란트',1,1,16 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','본원 임플란트 나사조임, 레진홀','2만원','본원 보증기간 만료 이후',1,1,17 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','타원 임플란트 나사조임, 레진홀','5만원','',1,1,18 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Implant 임플란트','정출방지 splint, 정출방지 reswin wire','10만원','',1,1,19 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','코어 (보강 레진)','5만원','재신경치료시 10',1,2,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','MTA (치아 신경 보호 재료) 사용','5만원','',1,2,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','포스트 (보강 기둥)','10만원','Core 포함',1,2,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','레진 구치부 소와 (레진A)','7만원','작은 협면, 교합면 우식',1,2,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','레진 구치부 간단 (레진 B)','10만원','중간 크기의 협면, 교합면 우식',1,2,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','레진 구치부 복잡 (레진 C)','15만원','넓은 부위의 협면, 교합면 우식, 인접면 포함될 때',1,2,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','레진 치경부','7만원','다수 치아 적용 금액 확인 중',1,2,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','레진 전치부 1면, 1면 이상','10, 15만원','근심, 원심 별도',1,2,7 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','레진 전치부 치간이개','20만원','근심, 원심 별도',1,2,8 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','아이콘 레진 (화이트스팟 치료)','15만원','치아당',1,2,9 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','하이브리드 인레이','30만원','',1,2,10 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','구치부 지르코니아','50만원','',1,2,11 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','구치부 골드 (A type)','90만원','',1,2,12 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','전치부 지르코니아','55만원','',1,2,13 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','라미네이트 A (Lithium disilicate)','60만원','부가세 별도',1,2,14 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','라미네이트 B (feld spar)','70만원','부가세 별도',1,2,15 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','치아 성형술 (치당)','3만원','치아당',1,2,16 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','메탈크라운','35만원','발치가능성 높을 때, 상위 진료 시 차감 없음',1,2,17 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','예비 크라운 (Provisional crown)','10만원','치아당',1,2,18 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '일반 진료 (보존, 보철)','진단 모형','10만원','추후 보철물 진행시 차감',1,2,19 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','실활치 미백 (레진 코어 포함)','20만원','',1,3,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','TMD 장치','50만원','월비 만원별도',1,3,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','이갈이 장치','50만원','월비 2만원별도',1,3,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','보톡스 국산 코어톡스 (50유닛)','7만원','',1,3,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','보톡스 국산 코어톡스 (용량 확인 중)','13만원','원본에 50유닛 항목 중복 표기 — 용량 확인 필요',1,3,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','보톡스 외산 제오민 (50 유닛)','20만원','',1,3,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','보톡스 외산 제오민 (100유닛)','37만원','',1,3,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','고정술 (resin, 치아당)','5만원','',1,3,7 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '기타 (TMD 턱관절, 이갈이, wire splint, 스케일링)','비보험 스케일링','6만원','',1,3,8 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','전문가 미백 1회, 2회, 3회','15, 30, 40만원','',1,4,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','리쥬란 2cc + LDM (스킨부스터)','29만원','비급여 진료 진행시 3회 까지 25',1,4,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','리쥬란 4cc + LDM (스킨부스터)','55만원','비급여 진료 진행시 3회 까지 50',1,4,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','슈링크 유니버스 300샷 (초음파 리프팅)','19만원','비급여 진료 진행시 3회까지 15',1,4,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','슈링크 유니버스 600샷 (초음파 리프팅)','35만원','비급여 진료 진행시 3회 까지 30',1,4,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','LDM','10만원','발치, 임플란트 수술 진행시 5만원',1,4,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Antiaging (안티에이징) VAT 별도','거미스마일 보톡스','확인 후 안내','',1,4,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '발치','타원 교정발치','7만원','치아당',1,5,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '발치','지혈제 사용','3~5만원','',1,5,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','부분틀니 (악당)','180만원','',1,6,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','완전틀니 (악당)','150만원','',1,6,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','첨상','10만원','',1,6,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','개상  (매몰법)','30만원','',1,6,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','임시틀니','25만원','',1,6,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','인공치수리(치아당)','10만원','',1,6,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','의치상수리','15만원','',1,6,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','클라스프 수리(개당)','5만원','',1,6,7 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Denture 틀니','로케이터 교체(치아당)','5만원','보증기간 이후',1,6,8 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','교정일반진단','3만원','',1,7,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','교정정밀진단','15만원','',1,7,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','월정료 1 (가철식)','3만원','',1,7,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','월정료 2 (고정식)','5만원','',1,7,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','RPE','50~100만원','',1,7,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','Facemask (+RPE)','120만원','',1,7,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','프리올쏘','80만원','',1,7,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','twin block','100만원','',1,7,7 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','1차교정후 전체교정','150만원','',1,7,8 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','전체교정 Metal','350만원','',1,7,9 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','전체교정 Ceramic','400만원','',1,7,10 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','투명교정 (인비절라인 First)','500만원','',1,7,11 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','투명교정 (인비절라인 Lite)','600만원','',1,7,12 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','투명교정 (인비절라인)','700만원','',1,7,13 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','투명교정 (국산)','확인 후 안내','',1,7,14 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','부분교정 1','150 ~ 200만원','',1,7,15 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','부분교정 2 (보철을 위한 교정)','150 ~ 250만원','추가 비용 조건 확인 중 (원본: 임상기간 4만)',1,7,16 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','교정 발치','5만원','치아당',1,7,17 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','Screw 식립','10만원','부위 개당',1,7,18 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','고정성 유지장치','40만원','상악 + 하악',1,7,19 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','고정성 + 가철성 유지장치','50만원','상악 + 하악',1,7,20 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','타치과 screw 제거','5만원','',1,7,21 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','타치과 fixed 제거','2만원','치아당',1,7,22 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','타치과 fixed 레진','5만원','치아당',1,7,23 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT 'Orthodontics 치아교정 (일반+유지장치 포함)','타치과 fixed 재제작','30만원','',1,7,24 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','[유치] Resin 교합면','7만원','',1,8,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','[유치] Resin 인접면 포함','10만원','',1,8,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','[영구치] Resin','보험수가 적용','보험수가',1,8,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','비급여 홈메우기','5만원','치아당',1,8,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','불소도포','3만원','비니쉬',1,8,4 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','SS Crown','15만원','영구치 SSC',1,8,5 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','지르코니아','20만원','',1,8,6 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','Band(Crown) & Loop','20만원','',1,8,7 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','Lingual arch(공간유지장치)','30만원','',1,8,8 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '소아','Nance holding arch(공간유지장치)','30만원','',1,8,9 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '급여 진료 자기부담금 참고','신경치료 (PE/C/F)','확인 후 안내','약',1,9,0 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '급여 진료 자기부담금 참고','일반 발치','확인 후 안내','약',1,9,1 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '급여 진료 자기부담금 참고','매복치 발치','확인 후 안내','약',1,9,2 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
INSERT INTO fees (category,name,price,note,is_published,sort_group,sort_order) SELECT '급여 진료 자기부담금 참고','보험임플란트','확인 후 안내','개당',1,9,3 WHERE (SELECT do_import FROM _fees_seed_import_guard) = 1;
DROP TABLE _fees_seed_import_guard;
