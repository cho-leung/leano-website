"""Dependency-free structural audit; browser checks supply rendering evidence."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Structure(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.nodes = []
        self.errors = []
        self.doctype = False

    def handle_decl(self, decl):
        self.doctype = decl.lower() == 'doctype html'

    def handle_starttag(self, tag, attributes):
        keys = [key for key, value in attributes]
        if len(keys) != len(set(keys)): self.errors.append('duplicate attributes on ' + tag)
        self.nodes.append((tag, dict(attributes)))
        if tag not in VOID: self.stack.append(tag)

    def handle_startendtag(self, tag, attributes):
        self.handle_starttag(tag, attributes)
        if tag not in VOID: self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag: self.errors.append('unexpected end tag ' + tag)
        else: self.stack.pop()

html = (ROOT / 'index.html').read_text()
p = Structure(); p.feed(html); p.close()
assert p.doctype
assert not p.stack and not p.errors, (p.stack, p.errors)
ids = [a['id'] for _, a in p.nodes if 'id' in a]
assert len(ids) == len(set(ids))
assert sum(tag == 'h1' for tag, _ in p.nodes) == 1
assert sum(tag == 'main' for tag, _ in p.nodes) == 1
for tag, attrs in p.nodes:
    for key in ['href', 'src']:
        value = attrs.get(key, '')
        if value.startswith('#'): assert value[1:] in ids, value
        elif value and not re.match(r'[a-z]+:', value): assert (ROOT / value).is_file(), value
    for key in ['aria-labelledby', 'aria-describedby']:
        if key in attrs: assert all(ref in ids for ref in attrs[key].split()), attrs
assert any(t == 'meta' and a.get('name') == 'viewport' and 'width=device-width' in a['content'] for t, a in p.nodes)
forms = [a for t, a in p.nodes if t == 'form']; assert len(forms) == 1
assert forms[0]['method'] == 'post' and forms[0]['enctype'] == 'application/x-www-form-urlencoded'
fields = {a['name']: a for t, a in p.nodes if t in ['input', 'textarea'] and 'name' in a}
required = {name for name, attrs in fields.items() if 'required' in attrs}
assert required == {'company', 'email', 'requirement', 'destination'}
assert fields['email']['type'] == 'email'
assert set(fields) == {'company', 'email', 'name', 'phone', 'requirement', 'quantity', 'destination', 'deadline', 'additional_requirements', 'language', 'source_page', 'referrer', 'campaign', 'outreach_source', 'submission_type'}
assert all('maxlength' in attrs for attrs in fields.values() if attrs.get('type') != 'hidden')
assert (ROOT / '.nojekyll').exists()

css = (ROOT / 'styles.css').read_text()
# Balance lexical punctuation outside comments and quoted strings, without pretending to be a full CSS validator.
lexical = re.sub(r'/\*.*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '', css, flags=re.S)
stack = []
for c in lexical:
    if c in '{(': stack.append(c)
    elif c in '})': assert stack and stack.pop() == {'}': '{', ')': '('}[c]
assert not stack
assert not re.search(r'@import\b|url\(', css)

js = (ROOT / 'script.js').read_text()
assert 'no-cors' not in js and not re.search(r'\bfetch\s*\(', js)
endpoints = re.findall(r"const RFQ_CONFIG = \{ endpoint: '([^']+)' \};", js)
assert len(endpoints) == 1
assert endpoints[0] == 'PASTE_APPS_SCRIPT_EXEC_URL_HERE' or re.fullmatch(r'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec', endpoints[0])
claims = ['global leader', 'world-class', 'trusted globally', 'hundreds of clients', 'authorized distributor', 'procurement platform', 'guaranteed savings', 'guaranteed lowest price', 'guaranteed stock', 'guaranteed delivery']
matches = [claim for claim in claims if claim in (html + js).lower()]
assert not matches, matches
for file in ['README.md', 'apps-script/README.md', 'docs/RFQ_DEPLOYMENT.md', 'index.html', 'script.js', 'apps-script/Code.gs']:
    text = (ROOT / file).read_text()
    assert not re.search(r'BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|AIza[0-9A-Za-z_-]{35}|ya29\.', text), file

report = {'html_structure': 'PASS', 'html_scope': 'balanced explicit tags, unique IDs, anchors, assets, ARIA references, required/form semantics; not a full HTML standards validator', 'css_structure_assets': 'PASS', 'claim_scan': matches, 'checks': 10, 'sha256': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in ['index.html', 'styles.css', 'script.js', 'apps-script/Code.gs']}}
(ROOT / 'audit-artifacts').mkdir(exist_ok=True)
(ROOT / 'audit-artifacts/static-results.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
