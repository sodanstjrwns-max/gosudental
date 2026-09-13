import { html } from 'hono/html'

export type ClinicPhoto = {
  id: number
  src: string
  thumb: string
  thumbWidth: number
  width: number
  height: number
  caption: string
}

// Photos open at their original composition; thumbnail grids never crop away faces.
export function photoFigure(photo: ClinicPhoto, group: string, className = '') {
  return html`<figure class="clinic-photo ${className}">
    <a class="photo-open" href="${photo.src}" data-photo-group="${group}" data-photo-caption="${photo.caption}" aria-label="${photo.caption} — 사진 크게 보기">
      <img src="${photo.thumb}" srcset="${photo.thumb} ${photo.thumbWidth}w, ${photo.src} ${photo.width}w" sizes="(max-width:640px) 92vw, (max-width:1024px) 45vw, 460px" alt="${photo.caption}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async">
      <span class="photo-expand" aria-hidden="true">크게 보기 +</span>
    </a>
    <figcaption>${photo.caption}</figcaption>
  </figure>`
}

export function photoGallery(photos: ClinicPhoto[], group: string, className = '') {
  return html`<div class="photo-gallery ${className}">${photos.map(p => photoFigure(p, group))}</div>`
}
