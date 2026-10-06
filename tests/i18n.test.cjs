const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const start = script.indexOf('const languages = {');
const end = script.indexOf("let currentLanguage = 'en';");
// Inspect the bundled static translation data only, without running page logic.
const dictionaries = vm.runInNewContext(script.slice(start, end) + '\nlanguages;');
test('the five dictionaries share exactly one complete set of keys', () => {
  assert.deepEqual(Object.keys(dictionaries), ['en', 'zh', 'fr', 'ru', 'es']);
  const keys = Object.keys(dictionaries.en).sort();
  for (const dictionary of Object.values(dictionaries)) {
    assert.deepEqual(Object.keys(dictionary).sort(), keys);
    for (const value of Object.values(dictionary)) assert.equal(typeof value, 'string');
  }
});
test('all page translation bindings exist and are nonempty in every language', () => {
  const keys = [...html.matchAll(/data-i18n(?:-html|-aria|-placeholder)?="([^"]+)"/g)].map(m => m[1]);
  for (const key of keys) {
    for (const [lang, dictionary] of Object.entries(dictionaries)) {
      assert(dictionary[key]?.trim(), lang + ': ' + key);
    }
  }
});
test('HTML translations use only static typographic markup, never scripts or attributes', () => {
  for (const match of html.matchAll(/data-i18n-html="([^"]+)"/g)) {
    for (const dictionary of Object.values(dictionaries)) {
      const tags = dictionary[match[1]].match(/<[^>]+>/g) || [];
      for (const tag of tags) assert.match(tag, /^<\/?(?:br|em|span)>$/);
    }
  }
});
