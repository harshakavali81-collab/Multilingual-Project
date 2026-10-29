"""Validate the portfolio landing page without third-party dependencies."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit
root = Path(__file__).resolve().parents[1]
text = (root / 'README.md').read_text(encoding='utf-8')
required = ['Visuals', 'Live Link / Demo', 'Key Features', 'Tech Stack', 'Architecture / System Design Diagram', 'Local Installation & Setup Guide', 'Challenges & Solutions', 'Future Improvements']
errors = [f'Missing section: {h}' for h in required if f'## {h}\n' not in text]
for target in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', text):
    target = target.strip('<>').split(' "')[0]
    parsed = urlsplit(target)
    if parsed.scheme or target.startswith('#') or not parsed.path:
        continue
    path = (root / unquote(parsed.path)).resolve()
    if not path.is_relative_to(root) or not path.exists():
        errors.append(f'Missing local link target: {target}')
for message in errors:
    print(message)
print(f'Portfolio documentation: {len(errors)} error(s)')
sys.exit(bool(errors))
