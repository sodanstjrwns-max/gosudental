"""Rebuild locally hosted OFL fonts. Requires requests, fonttools[woff], brotli.
Run after changing static copy to include new glyphs; other text uses system fallback.
"""
from pathlib import Path
import io
import re
import requests
from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/static/fonts'
OUT.mkdir(parents=True, exist_ok=True)
text = ''.join(p.read_text() for p in (ROOT / 'src').rglob('*') if p.suffix in ('.ts', '.tsx'))
chars = set(map(ord, text)) | set(range(32, 127)) | set(range(0x3131, 0x3164))
BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'
fonts = [
    ('gowunbatang/GowunBatang-Regular.ttf', 'gosu-batang-regular', 'Gosu Batang', '400'),
    ('gowunbatang/GowunBatang-Bold.ttf', 'gosu-batang-bold', 'Gosu Batang', '700'),
    ('notoserifkr/NotoSerifKR[wght].ttf', 'gosu-serif', 'Gosu Serif', '100 900'),
    ('nanumbrushscript/NanumBrushScript-Regular.ttf', 'gosu-brush', 'Gosu Brush', '400'),
    ('lxgwwenkaitc/LXGWWenKaiTC-Regular.ttf', 'gosu-hanja', 'Gosu Hanja', '400 700'),
]

def get(url):
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    return r.content

def save_font(data, filename, family, codes):
    font = TTFont(io.BytesIO(data))
    used = sorted(set(font.getBestCmap()) & codes)
    options = subset.Options()
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=used)
    sub.subset(font)
    for name in font['name'].names:
        if name.nameID in (1, 4, 6, 16):
            value = filename.replace('-', '') if name.nameID == 6 else family
            name.string = value.encode(name.getEncoding(), errors='replace')
    font.flavor = 'woff2'
    path = OUT / (filename + '.woff2')
    font.save(path)
    print(filename, path.stat().st_size, 'bytes', len(used), 'glyphs')
    return ','.join('U+%X' % code for code in used)

css = []
for source, filename, family, weight in fonts:
    codes = {c for c in chars if 0x3400 <= c <= 0x9fff} if filename == 'gosu-hanja' else chars
    ranges = save_font(get(BASE + source), filename, family, codes)
    license_name = source.split('/')[0]
    (OUT / (license_name + '-LICENSE.txt')).write_bytes(get(BASE + license_name + '/OFL.txt'))
    css.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:optional;src:url('./{filename}.woff2') format('woff2');unicode-range:{ranges}}}")

filename = 'gosu-ui'
ranges = save_font(get('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'), filename, 'Gosu UI', chars)
(OUT / 'pretendard-LICENSE.txt').write_bytes(get('https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/LICENSE'))
css.append(f"@font-face{{font-family:'Gosu UI';font-style:normal;font-weight:100 900;font-display:optional;src:url('./{filename}.woff2') format('woff2');unicode-range:{ranges}}}")
(OUT / 'fonts.css').write_text('\n'.join(css))

# Font Awesome Free: retain only icons used by source, including aliases.
base = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/'
metadata = requests.get('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.5.2/metadata/icons.json', timeout=60)
metadata.raise_for_status()
icons = metadata.json()
names = set(re.findall(r'fa-([a-z0-9-]+)', text))
icon_css = [".fa,.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto;-webkit-font-smoothing:antialiased}"]
for style, classes, weight in [('solid', '.fa,.fas,.fa-solid', 900), ('regular', '.far,.fa-regular', 400), ('brands', '.fab,.fa-brands', 400)]:
    chosen = {}
    for name, icon in icons.items():
        aliases = [name] + icon.get('aliases', {}).get('names', [])
        for alias in set(aliases) & names:
            if style in icon.get('free', []):
                chosen[alias] = int(icon['unicode'], 16)
    if not chosen:
        continue
    file = 'gosu-icons-' + style
    family = 'Gosu Icons ' + style
    save_font(get(base + f'webfonts/fa-{style}-{weight}.woff2'), file, family, set(chosen.values()))
    icon_css.append(f"@font-face{{font-family:'{family}';font-weight:{weight};font-display:block;src:url('./{file}.woff2') format('woff2')}}{classes}{{font-family:'{family}';font-weight:{weight}}}")
    for name, code in sorted(chosen.items()):
        icon_css.append(f'.fa-{name}:before{{content:"\\{code:x}"}}')
(OUT / 'icons.css').write_text('\n'.join(icon_css))
(OUT / 'fontawesome-LICENSE.txt').write_bytes(get(base + 'LICENSE.txt'))
