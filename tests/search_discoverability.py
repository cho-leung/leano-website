"""Search metadata and scope guards; optional live checks make GET requests only."""
from pathlib import Path
from html.parser import HTMLParser
import argparse
import hashlib
import json
import re
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CANONICAL = 'https://cho-leung.github.io/leano-website/'
ENDPOINT = 'https://script.google.com/macros/s/AKfycbwny2Lu9DvREl_te12o7_KJxhgXUiwTNAEjWkK9zPImF3g7WevC03nyLt5DZLPNseqq/exec'
ROBOTS = 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
# Accepted production baseline 2dffb87; this pass changes only head metadata.
PROTECTED = {
    'script.js': '18add231018cc0724303f363f1da9ca621f58b03b9599157a2c280fc03778d95',
    'styles.css': '05677b4987f64b6ad1f39e16c2ce6ea930dd959f7b3c6ab5e0e1084e2d78773a',
    'apps-script/Code.gs': '940436a1631af58e87e2f6e5c9800d1f20d89cbb0871c0220a65dce358803ef3',
    'apps-script/appsscript.json': '8a11d552c35b48c0dc84a4c0da91c261ba35da01429635fd447d68c31787dc5b',
}
BODY_SHA256 = '87edde2b437a6c030bf7065e8b2f629b6343e53c3dc82adf7ccb12d50bfeb0e3'


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_head = False
        self.in_json = False
        self.nodes = []
        self.structured = []

    def handle_starttag(self, tag, attrs):
        if tag == 'head':
            self.in_head = True
        if self.in_head:
            attrs = dict(attrs)
            self.nodes.append((tag, attrs))
            if tag == 'script' and attrs.get('type') == 'application/ld+json':
                self.in_json = True
                self.structured.append('')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_json = False
        if tag == 'head':
            self.in_head = False

    def handle_data(self, data):
        if self.in_json:
            self.structured[-1] += data


def digest(data):
    return hashlib.sha256(data).hexdigest()


def verify_metadata(html, sitemap):
    p = Metadata()
    p.feed(html)
    p.close()
    canonical = [a for t, a in p.nodes if t == 'link' and 'canonical' in a.get('rel', '').split()]
    assert len(canonical) == 1, 'Exactly one head canonical is required'
    assert canonical[0]['href'] == CANONICAL, 'Canonical must match production homepage'
    robots = [a for t, a in p.nodes if t == 'meta' and a.get('name', '').lower() == 'robots']
    assert len(robots) == 1 and robots[0]['content'] == ROBOTS, 'Indexing directives changed'
    directives = {x.strip().lower() for x in robots[0]['content'].split(',')}
    assert {'index', 'follow'} <= directives and not {'noindex', 'nofollow', 'none'} & directives

    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    tree = ET.fromstring(sitemap)
    assert tree.tag == ns + 'urlset', 'Sitemap must use the sitemap namespace'
    assert len(tree) == 1 and tree[0].tag == ns + 'url', 'Only the canonical homepage belongs in this sitemap'
    assert len(tree[0]) == 1 and tree[0][0].tag == ns + 'loc'
    assert tree[0][0].text == CANONICAL, 'Sitemap must contain the canonical homepage'

    assert len(p.structured) == 1, 'Exactly one minimal JSON-LD object is required'
    structured = json.loads(p.structured[0])
    descriptions = [a['content'] for t, a in p.nodes if t == 'meta' and a.get('name') == 'description']
    assert len(descriptions) == 1
    assert structured == {
        '@context': 'https://schema.org', '@type': 'WebSite',
        'name': 'Leano', 'url': CANONICAL, 'description': descriptions[0],
    }, 'Structured data may only contain the existing public site facts'
    return {'canonical': CANONICAL, 'robots': ROBOTS, 'sitemap': 'PASS', 'structured_data': 'PASS: minimal WebSite'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true')
    args = parser.parse_args()
    html = (ROOT / 'index.html').read_text()
    report = verify_metadata(html, (ROOT / 'sitemap.xml').read_bytes())
    assert digest(html.split('<body>', 1)[1].encode()) == BODY_SHA256, 'Visible page/form changed'
    for file, expected in PROTECTED.items():
        assert digest((ROOT / file).read_bytes()) == expected, file + ' changed outside scope'
    endpoint = re.findall(r"const RFQ_CONFIG = \{ endpoint: '([^']+)' \};", (ROOT / 'script.js').read_text())
    assert endpoint == [ENDPOINT], 'RFQ production endpoint changed'
    report.update({'protected_files': 'PASS', 'page_body': 'UNCHANGED', 'rfq_endpoint': 'UNCHANGED', 'apps_script': 'UNCHANGED'})
    if args.live:
        hosted = {}
        for file in ['index.html', 'sitemap.xml', 'script.js', 'styles.css']:
            url = CANONICAL if file == 'index.html' else CANONICAL + file
            with urllib.request.urlopen(url, timeout=30) as response:
                assert response.status == 200, file + ' HTTP failure'
                assert response.url == url, file + ' unexpected redirect'
                restrictions = response.headers.get_all('X-Robots-Tag') or []
                assert not re.search(r'\b(?:noindex|nofollow|none)\b', ','.join(restrictions), re.I), 'HTTP headers restrict indexing'
                hosted[file] = response.read()
            assert hosted[file] == (ROOT / file).read_bytes(), file + ' hosted bytes differ'
        verify_metadata(hosted['index.html'].decode('utf-8'), hosted['sitemap.xml'])
        report.update({'live_url': CANONICAL, 'hosted_assets': 'PASS: 4 byte-identical assets', 'http_indexing_headers': 'PASS'})
    report['status'] = 'PASS'
    out = ROOT / 'audit-artifacts/search-discoverability'
    out.mkdir(parents=True, exist_ok=True)
    result = json.dumps(report, indent=2) + '\n'
    (out / ('live.json' if args.live else 'local.json')).write_text(result)
    print(result, end='')


if __name__ == '__main__':
    main()
