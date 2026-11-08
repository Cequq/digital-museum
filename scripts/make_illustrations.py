"""
ISM Digital Museum — үзмэр, түүхийн чимэглэл зургуудыг (SVG) үүсгэнэ.
Ажиллуулах:  python3 scripts/make_illustrations.py   →  public/museum/*.svg

Эдгээр нь бодит гэрэл зураг БИШ, сэдэвт тохирсон чимэглэл. Бодит зураг гарвал
Админ → Time Machine зураг / үзмэр засах хэсгээс солино.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'museum')
W, H = 1200, 800
GOLD, CREAM, INK = '#e9c27a', '#f6f1e7', '#0d0a2e'


def frame(name, c1, c2, art, accent=GOLD):
    dots = ''.join(
        f'<circle cx="{x}" cy="{y}" r="1.6" fill="#fff" opacity="0.07"/>'
        for x in range(30, W, 40) for y in range(30, H, 40)
    )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>
  <radialGradient id="glow" cx="0.68" cy="0.38" r="0.55"><stop offset="0" stop-color="{accent}" stop-opacity="0.35"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d79a"/><stop offset="1" stop-color="#b9832a"/></linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
{dots}
<rect width="{W}" height="{H}" fill="url(#glow)"/>
<g stroke-linejoin="round" stroke-linecap="round">{art}</g>
</svg>'''
    with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)


def ground(y=640):
    return f'<rect x="0" y="{y}" width="{W}" height="{H - y}" fill="#000" opacity="0.18"/>'


# 1924 — сонгодог барилга (сургуулийн үүсэл)
cols = ''.join(f'<rect x="{x}" y="300" width="34" height="250" fill="{CREAM}"/>'
               f'<rect x="{x - 6}" y="290" width="46" height="12" fill="{CREAM}"/>' for x in range(470, 1000, 92))
frame('1924', '#1b1450', '#3a1d5c', ground() + f'''
<polygon points="420,280 735,140 1050,280" fill="url(#gold)"/>
<rect x="430" y="270" width="610" height="24" fill="{CREAM}"/>{cols}
<rect x="410" y="550" width="650" height="30" fill="{CREAM}"/><rect x="390" y="580" width="690" height="30" fill="#d9cfbb"/>
<rect x="370" y="610" width="730" height="30" fill="#bfb39b"/>
<circle cx="735" cy="225" r="26" fill="{INK}" opacity="0.5"/>''')

# 1964 — механик тооцоолох машин
keys = ''.join(f'<rect x="{560 + c * 62}" y="{390 + r * 52}" width="46" height="38" rx="8" fill="{CREAM if (r + c) % 4 else GOLD}"/>'
               for r in range(4) for c in range(6))
frame('1964', '#13213f', '#2b4a6b', ground() + f'''
<rect x="520" y="250" width="440" height="380" rx="26" fill="#4d5d73"/>
<rect x="540" y="270" width="400" height="90" rx="12" fill="{INK}"/>
<text x="740" y="333" font-family="monospace" font-size="54" fill="{GOLD}" text-anchor="middle">1964.00</text>
{keys}
<rect x="960" y="380" width="28" height="140" rx="10" fill="#8b98ab"/>
<circle cx="1010" cy="370" r="34" fill="none" stroke="url(#gold)" stroke-width="14"/>
<rect x="300" y="420" width="160" height="210" rx="10" fill="{CREAM}" opacity="0.9"/>
<path d="M325 460h110M325 500h110M325 540h80M325 580h100" stroke="#9aa3b5" stroke-width="8"/>''')

# 1992 — CRT компьютер
frame('1992', '#0f2a2a', '#1d4d4a', ground() + f'''
<rect x="500" y="200" width="420" height="330" rx="30" fill="#d9d2c0"/>
<rect x="540" y="235" width="340" height="250" rx="18" fill="#062b22"/>
<text x="565" y="300" font-family="monospace" font-size="34" fill="#4ef0a8">C:\\&gt; ISM_</text>
<path d="M565 340h220M565 380h160M565 420h250" stroke="#4ef0a8" stroke-width="10" opacity="0.6"/>
<rect x="640" y="530" width="140" height="40" fill="#bfb7a3"/>
<rect x="470" y="570" width="480" height="70" rx="14" fill="#cfc7b2"/>
<path d="M500 595h420M500 618h420" stroke="#9e967f" stroke-width="6" stroke-dasharray="22 10"/>''', accent='#4ef0a8')

# 2005 — төгсөлтийн малгай, диплом
frame('2005', '#2a1240', '#53225e', ground() + f'''
<polygon points="740,180 1020,290 740,400 460,290" fill="{INK}"/>
<path d="M580 350v110c0 40 320 40 320 0V350" fill="#1d1a3f"/>
<path d="M740 290L960 340v120" stroke="url(#gold)" stroke-width="10" fill="none"/>
<circle cx="960" cy="470" r="18" fill="url(#gold)"/>
<g transform="rotate(-8 520 560)"><rect x="330" y="500" width="380" height="110" rx="55" fill="{CREAM}"/>
<rect x="480" y="500" width="40" height="110" fill="#b42318"/></g>''')

# 2010 — сүлжээ / мэдээллийн систем
nodes = [(740, 230), (560, 380), (920, 380), (470, 540), (650, 560), (830, 560), (1010, 540)]
links = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6), (4, 5), (1, 2)]
frame('2010', '#0e1a4d', '#1a0dab', ''.join(
    f'<line x1="{nodes[a][0]}" y1="{nodes[a][1]}" x2="{nodes[b][0]}" y2="{nodes[b][1]}" stroke="{CREAM}" stroke-width="5" opacity="0.55"/>'
    for a, b in links) + ''.join(
    f'<circle cx="{x}" cy="{y}" r="{56 if i == 0 else 38}" fill="{"url(#gold)" if i == 0 else CREAM}"/>' for i, (x, y) in enumerate(nodes))
    + f'<text x="740" y="248" font-family="Georgia, serif" font-weight="700" font-size="44" fill="{INK}" text-anchor="middle">ISM</text>')

# 2012 — олон улсын магадлан итгэмжлэл (бөмбөрцөг + тамга)
frame('2012', '#0b2f4f', '#155e75', ground() + f'''
<circle cx="680" cy="380" r="200" fill="#1e7fa6"/>
<path d="M480 380h400M680 180v400" stroke="{CREAM}" stroke-width="5" opacity="0.6"/>
<ellipse cx="680" cy="380" rx="90" ry="200" fill="none" stroke="{CREAM}" stroke-width="5" opacity="0.6"/>
<path d="M500 300h360M500 460h360" stroke="{CREAM}" stroke-width="4" opacity="0.45"/>
<circle cx="900" cy="520" r="96" fill="url(#gold)"/><circle cx="900" cy="520" r="72" fill="none" stroke="{INK}" stroke-width="5" stroke-dasharray="8 8"/>
<path d="M860 520l28 28 52-60" stroke="{INK}" stroke-width="16" fill="none"/>''', accent='#7dd3fc')

# 2015 — цахим сургалт (зөөврийн компьютер)
frame('2015', '#1c1446', '#3b2a8a', ground() + f'''
<rect x="470" y="220" width="540" height="340" rx="20" fill="#2a2a3d"/>
<rect x="495" y="245" width="490" height="290" rx="10" fill="{CREAM}"/>
<rect x="520" y="270" width="270" height="160" rx="8" fill="#1a0dab"/>
<polygon points="635,315 635,385 690,350" fill="{CREAM}"/>
<path d="M815 285h140M815 325h110M815 365h140M520 465h400M520 500h300" stroke="#9aa3b5" stroke-width="12"/>
<path d="M420 560h640l-40 50H460z" fill="#4a4a63"/>''')

# 2019 — блокчэйн
blocks = ''.join(f'<rect x="{x}" y="{y}" width="150" height="150" rx="18" fill="{c}"/>'
                 f'<path d="M{x + 30} {y + 50}h90M{x + 30} {y + 80}h70M{x + 30} {y + 110}h90" stroke="{INK}" stroke-width="9" opacity="0.5"/>'
                 for x, y, c in [(400, 330, CREAM), (640, 230, 'url(#gold)'), (880, 330, CREAM)])
frame('2019', '#13132b', '#2e1f5e', ground() + f'''
<path d="M550 400L640 330M790 330L880 400" stroke="{GOLD}" stroke-width="12" stroke-dasharray="4 18"/>{blocks}
<circle cx="715" cy="560" r="44" fill="none" stroke="{CREAM}" stroke-width="12"/><rect x="680" y="580" width="70" height="56" rx="8" fill="{CREAM}"/>''')

# 2024 — 100 жилийн ой
fw = ''.join(f'<line x1="{cx}" y1="{cy}" x2="{cx + dx}" y2="{cy + dy}" stroke="{c}" stroke-width="6"/>'
             for cx, cy, c in [(500, 220, GOLD), (980, 200, '#f472b6'), (760, 140, '#7dd3fc')]
             for dx, dy in [(0, -60), (42, -42), (60, 0), (42, 42), (0, 60), (-42, 42), (-60, 0), (-42, -42)])
frame('2024', '#2a0f3d', '#7a1e4b', ground() + fw + f'''
<text x="740" y="520" font-family="Georgia, serif" font-weight="800" font-size="300" fill="url(#gold)" text-anchor="middle">100</text>
<rect x="500" y="560" width="480" height="16" rx="8" fill="{CREAM}" opacity="0.7"/>''', accent='#f472b6')

# --- Үзмэр / бүтээлийн чимэглэл ---
# Дадлагын систем — вэб самбар
frame('exhibit-internship', '#10224a', '#1f3f7a', f'''
<rect x="300" y="160" width="700" height="460" rx="22" fill="{CREAM}"/>
<rect x="300" y="160" width="700" height="56" rx="22" fill="#d9cfbb"/><rect x="300" y="196" width="700" height="20" fill="#d9cfbb"/>
<circle cx="340" cy="188" r="10" fill="#e5484d"/><circle cx="372" cy="188" r="10" fill="#f5a524"/><circle cx="404" cy="188" r="10" fill="#30a46c"/>
<rect x="330" y="240" width="170" height="350" rx="12" fill="#1a0dab"/>
<path d="M355 280h120M355 320h90M355 360h110M355 400h80" stroke="{CREAM}" stroke-width="12" opacity="0.8"/>
<rect x="530" y="240" width="200" height="110" rx="12" fill="#e8e1ff"/><rect x="760" y="240" width="210" height="110" rx="12" fill="#fff1d6"/>
<text x="560" y="315" font-family="Georgia, serif" font-weight="700" font-size="52" fill="#1a0dab">128</text>
<text x="790" y="315" font-family="Georgia, serif" font-weight="700" font-size="52" fill="#b9832a">94%</text>
''' + ''.join(f'<rect x="530" y="{375 + i * 52}" width="440" height="38" rx="8" fill="#efe7d8"/>'
              f'<rect x="545" y="{387 + i * 52}" width="{150 + (i * 53) % 160}" height="14" rx="7" fill="#9aa3b5"/>'
              f'<rect x="900" y="{383 + i * 52}" width="56" height="22" rx="11" fill="{["#30a46c", "#f5a524", "#30a46c", "#e5484d"][i]}"/>'
              for i in range(4)))

# Машин сургалтын судалгаа — график + нейрон
pts = [(330, 520), (420, 470), (500, 500), (580, 380), (660, 430), (740, 300), (820, 350), (900, 240)]
frame('exhibit-ml', '#0f1d3a', '#3b1a6b', ground(660) + f'''
<path d="M300 600h640M300 600V200" stroke="{CREAM}" stroke-width="5" opacity="0.6"/>
<polyline points="{' '.join(f'{x},{y}' for x, y in pts)}" fill="none" stroke="url(#gold)" stroke-width="10"/>
''' + ''.join(f'<circle cx="{x}" cy="{y}" r="11" fill="{CREAM}"/>' for x, y in pts) + ''.join(
    f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="#a78bfa" stroke-width="3" opacity="0.6"/>'
    for a in [(990, 250), (990, 400), (990, 550)] for b in [(1090, 320), (1090, 480)]) + ''.join(
    f'<circle cx="{x}" cy="{y}" r="22" fill="#a78bfa"/>' for x, y in [(990, 250), (990, 400), (990, 550), (1090, 320), (1090, 480)]),
    accent='#a78bfa')

# Мэдээллийн системийн эрсдэл — бамбай + цоож
frame('exhibit-risk', '#1a1033', '#4a1530', ground() + f'''
<path d="M740 160l230 80v150c0 140-100 220-230 260-130-40-230-120-230-260V240z" fill="url(#gold)"/>
<path d="M740 200l190 66v124c0 115-82 182-190 216-108-34-190-101-190-216V266z" fill="{INK}"/>
<rect x="660" y="380" width="160" height="130" rx="18" fill="{CREAM}"/>
<path d="M690 380v-40a50 50 0 0 1 100 0v40" stroke="{CREAM}" stroke-width="22" fill="none"/>
<circle cx="740" cy="435" r="16" fill="{INK}"/><rect x="733" y="440" width="14" height="40" fill="{INK}"/>''', accent='#f87171')

# ISM Digital Museum — браузер + музей
frame('exhibit-museum', '#120c3a', '#1a0dab', f'''
<rect x="320" y="170" width="660" height="440" rx="22" fill="{CREAM}"/>
<rect x="320" y="170" width="660" height="50" rx="22" fill="#d9cfbb"/><rect x="320" y="200" width="660" height="20" fill="#d9cfbb"/>
<rect x="420" y="183" width="460" height="24" rx="12" fill="{CREAM}"/>
<polygon points="470,350 650,270 830,350" fill="#1a0dab"/>
''' + ''.join(f'<rect x="{x}" y="360" width="26" height="130" fill="#1a0dab"/>' for x in range(500, 820, 62)) + f'''
<rect x="460" y="490" width="380" height="22" fill="#1a0dab"/>
<path d="M860 300h90M860 340h70M860 380h90M860 420h60" stroke="#9aa3b5" stroke-width="12"/>
<rect x="860" y="460" width="90" height="40" rx="20" fill="url(#gold)"/>''')

# Тэмцээн — цом
frame('event-competition', '#2b1a0a', '#6b3a10', ground() + f'''
<path d="M600 200h280v120c0 90-60 150-140 150s-140-60-140-150z" fill="url(#gold)"/>
<path d="M600 230h-60c0 80 40 110 80 120M880 230h60c0 80-40 110-80 120" stroke="url(#gold)" stroke-width="18" fill="none"/>
<rect x="710" y="470" width="60" height="70" fill="url(#gold)"/>
<rect x="630" y="540" width="220" height="60" rx="10" fill="{CREAM}"/>
<polygon points="740,260 755,300 798,300 763,325 776,366 740,341 704,366 717,325 682,300 725,300" fill="{CREAM}"/>''', accent='#fbbf24')

# Олимпиад — медаль
frame('event-olympiad', '#0c2a3a', '#1f4e6b', ground() + f'''
<path d="M640 140l100 200 100-200z" fill="#1a0dab"/><path d="M640 140l50 0 100 200-50 0z" fill="#b42318"/>
<circle cx="740" cy="430" r="150" fill="url(#gold)"/>
<circle cx="740" cy="430" r="115" fill="none" stroke="{INK}" stroke-width="6" opacity="0.4"/>
<text x="740" y="470" font-family="Georgia, serif" font-weight="800" font-size="120" fill="{INK}" text-anchor="middle" opacity="0.75">XV</text>''')

print('Үүсгэсэн:', sorted(os.listdir(OUT)))
