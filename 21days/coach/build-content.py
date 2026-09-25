"""Regenerate only the static coach content module, using Python's standard library."""
from pathlib import Path
import json

folder = Path(__file__).resolve().parent
html = (folder / 'content.html').read_text(encoding='utf-8')
(folder / 'content.js').write_text(
    'export const coachHTML = ' + json.dumps(html, ensure_ascii=False) + ';\n',
    encoding='utf-8',
)
print('Updated 21days/coach/content.js from content.html')
