"""Build the static Cloudflare Pages artifact from an explicit public allowlist."""
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = (ROOT / 'dist').resolve()
assert OUTPUT.parent == ROOT and OUTPUT.name == 'dist'
subprocess.run([sys.executable, str(ROOT / 'scripts/build_web.py')], check=True)

files = {'index.html': ROOT / 'START_HERE.html', 'START_HERE.html': ROOT / 'START_HERE.html'}
for name in ['README.md', '404.html', '_headers']:
    files[name] = ROOT / name
for directory, extensions in {
    'visuals': {'.svg', '.png', '.json', '.md'},
    'pdf': {'.pdf'},
    'flashcards': {'.tsv', '.png'},
    'study': {'.md'},
    'topics': {'.md'},
    'review': {'.md'},
    'docs': {'.md'},
}.items():
    for path in (ROOT / directory).rglob('*'):
        if path.is_file() and path.suffix.lower() in extensions:
            files[path.relative_to(ROOT).as_posix()] = path

for name, source in files.items():
    if not source.is_file():
        raise SystemExit('Missing publication asset: ' + name)
    if source.stat().st_size > 25 * 1024 * 1024:
        raise SystemExit('Cloudflare asset exceeds 25 MiB: ' + name)
    if any(part.startswith('.') or part in {'originals', 'tasks', 'scripts', 'content', 'quiz'} for part in Path(name).parts):
        raise SystemExit('Non-public path selected: ' + name)
if len(files) + 1 > 1000:
    raise SystemExit('Publication exceeds the 1,000-file dashboard upload limit.')

def local_target(base, target):
    if target.startswith(('https:', 'http:', 'mailto:', '#', 'data:')) or '${' in target:
        return None
    relative = unquote(target.split('#')[0].split('?')[0])
    if not relative:
        return None
    candidate = (ROOT / base / relative).resolve()
    if not candidate.is_relative_to(ROOT):
        raise SystemExit('Local link escapes publication root: ' + target)
    return candidate.relative_to(ROOT).as_posix()

html = (ROOT / 'START_HERE.html').read_text(encoding='utf-8')
for target in re.findall(r'(?:href|src)="([^"{}]+)"', html):
    name = local_target(Path(), target)
    if name and name not in files:
        raise SystemExit('HTML references an unpublished asset: ' + name)
for name, source in files.items():
    if source.suffix == '.md':
        for target in re.findall(r'\]\(([^)]+)\)', source.read_text(encoding='utf-8')):
            linked = local_target(Path(name).parent, target)
            if linked and linked not in files:
                raise SystemExit(f'Markdown references an unpublished asset: {name} -> {linked}')

OUTPUT.mkdir(exist_ok=True)
existing = {p.relative_to(OUTPUT).as_posix() for p in OUTPUT.rglob('*') if p.is_file()}
unexpected = existing - set(files) - {'deployment-manifest.json'}
if unexpected:
    raise SystemExit('Unexpected files in dist; inspect them before rebuilding: ' + ', '.join(sorted(unexpected)))
manifest = []
for name, source in sorted(files.items()):
    destination = (OUTPUT / name).resolve()
    assert destination.is_relative_to(OUTPUT)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    data = destination.read_bytes()
    manifest.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
(OUTPUT / 'deployment-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
with ZipFile(ROOT / 'dist.zip', 'w', compression=ZIP_DEFLATED) as archive:
    for path in sorted(OUTPUT.rglob('*')):
        if path.is_file():
            archive.write(path, path.relative_to(OUTPUT).as_posix())
print(json.dumps({'output': 'dist', 'files': len(manifest) + 1, 'bytes': sum(item['bytes'] for item in manifest), 'zip': 'dist.zip', 'largest_asset': max(manifest, key=lambda item: item['bytes'])['path']}, indent=2))
