from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / 'script.js'
SEARCH_TEST = ROOT / 'tests/search_discoverability.py'

script = SCRIPT.read_text(encoding='utf-8')
old = "sectionProof: '04 / RFQ sélectionnée'"
new = "sectionProof: '04 / Exemple RFQ'"
if old not in script:
    raise SystemExit('French proof index label not found')
script = script.replace(old, new, 1)
SCRIPT.write_text(script, encoding='utf-8')

search_test = SEARCH_TEST.read_text(encoding='utf-8')
script_hash = hashlib.sha256(SCRIPT.read_bytes()).hexdigest()
search_test = re.sub(r"'script\.js': '[0-9a-f]{64}'", f"'script.js': '{script_hash}'", search_test, count=1)
SEARCH_TEST.write_text(search_test, encoding='utf-8')
print('Shortened French proof index label and refreshed script baseline.')
