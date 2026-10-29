from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parent.parent
STYLES = ROOT / 'styles.css'
SEARCH_TEST = ROOT / 'tests/search_discoverability.py'

styles = STYLES.read_text(encoding='utf-8')
if '.proof-section {' not in styles:
    raise SystemExit('Proof section styles must be applied first')

fix = r'''

/* Keep proof copy inside narrow locale layouts. */
.proof-head > *, .proof-grid > *, .proof-principles > * { min-width: 0; }
.proof-head h2, .proof-head .section-intro { overflow-wrap: anywhere; }
@media (max-width: 560px) {
  .proof-head h2 { font-size: 2.75rem; line-height: 0.94; }
}
'''
if 'Keep proof copy inside narrow locale layouts.' not in styles:
    styles += fix
STYLES.write_text(styles, encoding='utf-8')

search_test = SEARCH_TEST.read_text(encoding='utf-8')
styles_hash = hashlib.sha256(STYLES.read_bytes()).hexdigest()
search_test = re.sub(r"'styles\.css': '[0-9a-f]{64}'", f"'styles.css': '{styles_hash}'", search_test, count=1)
SEARCH_TEST.write_text(search_test, encoding='utf-8')

print('Applied narrow-locale proof overflow fix and refreshed style baseline.')
