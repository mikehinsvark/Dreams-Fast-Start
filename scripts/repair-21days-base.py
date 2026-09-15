#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ROUTE = ROOT / "21days"
HTML_FILES = [ROUTE / "index.html", ROUTE / "404.html"]

for html_path in HTML_FILES:
    if not html_path.is_file():
        raise SystemExit(f"Missing {html_path}")
    text = html_path.read_text(encoding="utf-8")
    text = text.replace('src="/assets/', 'src="/21days/assets/')
    text = text.replace('href="/assets/', 'href="/21days/assets/')
    text = text.replace('content="/assets/', 'content="/21days/assets/')
    text = re.sub(r'\s*<script src="/__manus__/debug-collector\.js" defer></script>', '', text)
    if 'rel="icon"' not in text:
        text = text.replace(
            '    <meta name="theme-color" content="#071327" />',
            '    <meta name="theme-color" content="#071327" />\n'
            '    <link rel="icon" type="image/svg+xml" href="/21days/favicon.svg" />',
        )
    html_path.write_text(text, encoding="utf-8")

index = (ROUTE / "index.html").read_text(encoding="utf-8")
js_refs = re.findall(r'src="(/21days/assets/[^\"]+\.js)"', index)
css_refs = re.findall(r'href="(/21days/assets/[^\"]+\.css)"', index)
if len(js_refs) != 1 or len(css_refs) != 1:
    raise SystemExit(f"Expected one JS and one CSS reference; got JS={js_refs}, CSS={css_refs}")

js_path = ROOT / js_refs[0].lstrip("/")
css_path = ROOT / css_refs[0].lstrip("/")
if not js_path.is_file() or not css_path.is_file():
    raise SystemExit(f"Referenced build assets are missing: {js_path}, {css_path}")
if not (ROUTE / "favicon.svg").is_file():
    raise SystemExit("Missing 21days/favicon.svg")

js = js_path.read_text(encoding="utf-8")
asset_pattern = re.compile(r'const ([A-Za-z_$][\w$]*)=([A-Za-z_$][\w$]*)=>`/assets/\$\{\2\}`')
js, asset_count = asset_pattern.subn(r'const \1=\2=>`/21days/assets/${\2}`', js, count=1)
if asset_count != 1 and "/21days/assets/${" not in js:
    raise SystemExit("Could not locate the compiled local-asset factory")

router_pattern = re.compile(r'(\b[A-Za-z_$][\w$]*=\{hook:[^{}]{0,220}?parser:[^,{}]+,base:)""(,ssrPath:)')
js, router_count = router_pattern.subn(r'\1"/21days"\2', js, count=1)
if router_count != 1 and 'base:"/21days",ssrPath:' not in js:
    raise SystemExit("Could not locate the compiled Wouter base configuration")

js_path.write_text(js, encoding="utf-8")

for html_path in HTML_FILES:
    text = html_path.read_text(encoding="utf-8")
    forbidden = ('src="/assets/', 'href="/assets/', 'content="/assets/', '/__manus__/debug-collector.js')
    found = [token for token in forbidden if token in text]
    if found:
        raise SystemExit(f"Unsafe root paths remain in {html_path}: {found}")

if 'base:"/21days",ssrPath:' not in js:
    raise SystemExit("Router base verification failed")
if "/21days/assets/${" not in js:
    raise SystemExit("Media base verification failed")

print(f"Repaired {ROUTE}")
print(f"JavaScript: {js_path.relative_to(ROOT)}")
print(f"Stylesheet: {css_path.relative_to(ROOT)}")
