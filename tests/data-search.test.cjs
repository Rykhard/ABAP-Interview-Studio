const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('data cache reuses parsed records and selects locale without rewriting the page', () => {
  let reads = 0;
  const context = vm.createContext({document: {getElementById: () => {
    reads++;
    return {textContent: '[{"id":"A-01","question":"English"}]'};
  }}});
  vm.runInContext(fs.readFileSync('scripts/studio-data.js', 'utf8'), context);
  assert.equal(vm.runInContext("readStudioData('study-data')===readStudioData('study-data')", context), true);
  assert.equal(reads, 1);
  vm.runInContext("selectStudioData({'study-data':[{id:'A-01',question:'Russian'}]})", context);
  assert.equal(vm.runInContext("readStudioData('study-data')[0].question", context), 'Russian');
  assert.equal(reads, 1);
});

test('search stays lazy, ranks related answers first and respects acronym boundaries', () => {
  const question = (id, title, answer, detail = '') => ({id, question: title, answer, detail, pitfall: '', moduleTitle: '', references: []});
  const context = vm.createContext({
    all: [question('RAP-05', 'RAP save sequence', 'Finish and persist'),
      question('A-02', 'AIF mapping', 'A sequence of checks', 'Save a remote message'),
      question('A-03', 'Wrap a BAPI', 'Legacy call'), question('A-04', 'Choose an API', 'Released interface')],
    studioLocale: 'en', englishStudyModules: [], otherLocalePayloads: {'study-data': []},
    lessonsByQuestion: new Map(), visualsByQuestion: new Map(),
  });
  vm.runInContext(fs.readFileSync('scripts/studio-search.js', 'utf8').split('function searchExcerpt')[0], context);
  assert.equal(vm.runInContext('searchIndex', context), undefined);
  assert.equal(vm.runInContext("globalMatches('save sequence')[0].q.id", context), 'RAP-05');
  assert.equal(vm.runInContext("globalMatches('save sequence').find(x=>x.q.id==='A-02').tier", context), 2);
  assert.equal(vm.runInContext("globalMatches('API').some(x=>x.q.id==='A-03')", context), false);
  assert.equal(vm.runInContext("globalMatches('rap05').length", context), 1);
});

test('portable payload stays within explicit uncompressed and gzip budgets', () => {
  const {gzipSync} = require('node:zlib');
  const html = fs.readFileSync('START_HERE.html');
  assert.ok(html.length < 5_100_000, `HTML: ${html.length} bytes`);
  assert.ok(gzipSync(html).length < 1_000_000, 'Compressed HTML exceeds 1 MB');
});
