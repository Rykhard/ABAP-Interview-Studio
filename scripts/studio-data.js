// Embedded data is parsed once. Locale selection changes references, not DOM text.
const studioDataCache = new Map();

function readStudioData(id) {
 if (!studioDataCache.has(id)) {
  const node = document.getElementById(id);
  if (!node) throw new Error('Missing studio data: ' + id);
  studioDataCache.set(id, JSON.parse(node.textContent));
 }
 return studioDataCache.get(id);
}

function selectStudioData(payloads) {
 for (const [id, data] of Object.entries(payloads)) studioDataCache.set(id, data);
}

function indexByQuestion(items) {
 const index = new Map();
 for (const item of items) {
  for (const id of item.questions) {
   if (!index.has(id)) index.set(id, []);
   index.get(id).push(item);
  }
 }
 return index;
}
