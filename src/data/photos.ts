import type { ClinicPhoto } from '../photo-gallery'

// User-supplied photos, shared 2026-09-13. File 12 is byte-identical to file 1.
export const PHOTOS: Record<number, ClinicPhoto> = {
  "0": {
    "id": 0,
    "src": "/static/img/gosu-photo-00-20260913.webp",
    "thumb": "/static/img/gosu-photo-00-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1067,
    "height": 1600,
    "caption": "김경환 원장 · 치과교정과 전문의"
  },
  "1": {
    "id": 1,
    "src": "/static/img/gosu-photo-01-20260913.webp",
    "thumb": "/static/img/gosu-photo-01-20260913-thumb.webp",
    "thumbWidth": 512,
    "width": 1280,
    "height": 1600,
    "caption": "함께 진료하는 고수치과 의료진"
  },
  "2": {
    "id": 2,
    "src": "/static/img/gosu-photo-02-20260913.webp",
    "thumb": "/static/img/gosu-photo-02-20260913-thumb.webp",
    "thumbWidth": 512,
    "width": 1280,
    "height": 1600,
    "caption": "고수치과 의료진 단체 프로필"
  },
  "3": {
    "id": 3,
    "src": "/static/img/gosu-photo-03-20260913.webp",
    "thumb": "/static/img/gosu-photo-03-20260913-thumb.webp",
    "thumbWidth": 480,
    "width": 1200,
    "height": 1600,
    "caption": "조원익 원장의 일상 · 농구 코트에서"
  },
  "4": {
    "id": 4,
    "src": "/static/img/gosu-photo-04-20260913.webp",
    "thumb": "/static/img/gosu-photo-04-20260913-thumb.webp",
    "thumbWidth": 417,
    "width": 1042,
    "height": 1600,
    "caption": "농구 트로피와 함께 남긴 기념사진"
  },
  "5": {
    "id": 5,
    "src": "/static/img/gosu-photo-05-20260913.webp",
    "thumb": "/static/img/gosu-photo-05-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1000,
    "height": 1500,
    "caption": "코트 위의 순간 · 농구 경기"
  },
  "6": {
    "id": 6,
    "src": "/static/img/gosu-photo-06-20260913.webp",
    "thumb": "/static/img/gosu-photo-06-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1067,
    "height": 1600,
    "caption": "조원익 원장의 운동 프로필"
  },
  "7": {
    "id": 7,
    "src": "/static/img/gosu-photo-07-20260913.webp",
    "thumb": "/static/img/gosu-photo-07-20260913-thumb.webp",
    "thumbWidth": 446,
    "width": 1114,
    "height": 1600,
    "caption": "농구를 함께하는 사람들과의 기록"
  },
  "8": {
    "id": 8,
    "src": "/static/img/gosu-photo-08-20260913.webp",
    "thumb": "/static/img/gosu-photo-08-20260913-thumb.webp",
    "thumbWidth": 584,
    "width": 1440,
    "height": 1578,
    "caption": "조원익 원장 · 화이트 코트 프로필"
  },
  "9": {
    "id": 9,
    "src": "/static/img/gosu-photo-09-20260913.webp",
    "thumb": "/static/img/gosu-photo-09-20260913-thumb.webp",
    "thumbWidth": 640,
    "width": 1206,
    "height": 799,
    "caption": "팀과 함께하는 농구 경기"
  },
  "10": {
    "id": 10,
    "src": "/static/img/gosu-photo-10-20260913.webp",
    "thumb": "/static/img/gosu-photo-10-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 933,
    "height": 1400,
    "caption": "농구 경기 중 슛을 시도하는 순간"
  },
  "11": {
    "id": 11,
    "src": "/static/img/gosu-photo-11-20260913.webp",
    "thumb": "/static/img/gosu-photo-11-20260913-thumb.webp",
    "thumbWidth": 640,
    "width": 1600,
    "height": 1067,
    "caption": "조원익 원장 · 또 다른 프로필"
  },
  "13": {
    "id": 13,
    "src": "/static/img/gosu-photo-13-20260913.webp",
    "thumb": "/static/img/gosu-photo-13-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1067,
    "height": 1600,
    "caption": "조원익 원장 · 진료복 프로필"
  },
  "14": {
    "id": 14,
    "src": "/static/img/gosu-photo-14-20260913.webp",
    "thumb": "/static/img/gosu-photo-14-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1067,
    "height": 1600,
    "caption": "조원익 원장 · 고수치과 대표원장"
  },
  "15": {
    "id": 15,
    "src": "/static/img/gosu-photo-15-20260913.webp",
    "thumb": "/static/img/gosu-photo-15-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1067,
    "height": 1600,
    "caption": "조원익 원장 · 고수치과 프로필"
  },
  "16": {
    "id": 16,
    "src": "/static/img/gosu-photo-16-20260913.webp",
    "thumb": "/static/img/gosu-photo-16-20260913-thumb.webp",
    "thumbWidth": 427,
    "width": 1067,
    "height": 1600,
    "caption": "이민우 원장 · 진료원장"
  }
}

export const CHO_PORTRAITS = [15, 13, 11, 8, 14].map(id => PHOTOS[id])
export const CHO_LIFE = [3, 4, 5, 9, 10, 7, 6].map(id => PHOTOS[id])
