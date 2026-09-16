// 진료 안내 확장 원고 (2026-09-16) — site.ts TREATMENTS 뒤에 이어 붙는다 (append)
import * as implant from './implant'
import * as ortho from './ortho'
import * as aesthetic from './aesthetic'
import * as preservation from './preservation'
import * as prosthetics from './prosthetics'
import * as tmj from './tmj'
import * as antiaging from './antiaging'

export const EXTENDED: Record<string, { sections: { h: string; body: string }[]; faqs: { q: string; a: string }[] }> = {
  implant,
  ortho,
  aesthetic,
  preservation,
  prosthetics,
  tmj,
  antiaging,
}
