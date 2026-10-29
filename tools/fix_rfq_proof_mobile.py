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

/* Keep proof copy inside localized editorial columns at all tested widths. */
.proof-head { min-width: 0; width: 100%; }
.proof-head > *, .proof-grid > *, .proof-principles > * { min-width: 0; }
.proof-head h2, .proof-head .section-intro { overflow-wrap: anywhere; }
.proof-head .section-index {
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}
html:not([lang="en"]) .proof-head h2 {
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
html:not([lang="en"]) .proof-head .section-intro,
html:not([lang="en"]) .proof-head .section-index { overflow-wrap: anywhere; }
html[lang="ru"] .proof-head h2 { font-size: clamp(2.8rem, 4.5vw, 5.4rem); }
html[lang="fr"] .proof-head h2,
html[lang="es"] .proof-head h2 { font-size: clamp(3rem, 5vw, 5.8rem); }
@media (max-width: 900px) {
  .proof-head .section-index { font-size: 0.62rem; letter-spacing: 0.04em; }
}
@media (max-width: 560px) {
  .proof-head h2 { font-size: 2.75rem; line-height: 0.94; }
  html[lang="ru"] .proof-head h2 { font-size: 2.2rem; line-height: 1; }
  html[lang="fr"] .proof-head h2,
  html[lang="es"] .proof-head h2 { font-size: 2.35rem; line-height: 0.98; }
}
'''
if 'Keep proof copy inside localized editorial columns at all tested widths.' not in styles:
    styles += fix
STYLES.write_text(styles, encoding='utf-8')

search_test = SEARCH_TEST.read_text(encoding='utf-8')
styles_hash = hashlib.sha256(STYLES.read_bytes()).hexdigest()
search_test = re.sub(r"'styles\.css': '[0-9a-f]{64}'", f"'styles.css': '{styles_hash}'", search_test, count=1)
SEARCH_TEST.write_text(search_test, encoding='utf-8')

print('Applied localized proof wrapping fix and refreshed style baseline.')
