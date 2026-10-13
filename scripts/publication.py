"""Package the portable app using an explicit, validated publication boundary."""
import hashlib
import json
import re
import shutil
from pathlib import Path
from urllib.parse import unquote
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

PUBLIC_DIRECTORIES = {
    'assets': {'.svg', '.png', '.ico'},
    'visuals': {'.svg', '.png', '.json', '.md'},
    'pdf': {'.pdf'}, 'flashcards': {'.tsv', '.png'},
    'study': {'.md'}, 'topics': {'.md'}, 'review': {'.md'}, 'docs': {'.md'},
}


def publication_files(root):
    """Select public assets and reject escaped paths before writing any output."""
    root = root.resolve()
    files = {'index.html': root / 'START_HERE.html',
             'START_HERE.html': root / 'START_HERE.html'}
    files.update({name: root / name for name in ('README.md', '404.html', '_headers')})
    if (root / '_routes.json').is_file():
        files['_routes.json'] = root / '_routes.json'
    for directory, extensions in PUBLIC_DIRECTORIES.items():
        for path in (root / directory).rglob('*'):
            if path.is_file() and path.suffix.lower() in extensions:
                files[path.relative_to(root).as_posix()] = path
    for name, source in files.items():
        if not source.resolve().is_relative_to(root):
            raise ValueError('Publication source escapes repository: ' + name)
        if not source.is_file():
            raise ValueError('Missing publication asset: ' + name)
        if source.stat().st_size > 25 * 1024 * 1024:
            raise ValueError('Cloudflare asset exceeds 25 MiB: ' + name)
        if any(part.startswith('.') or part in {'originals', 'tasks', 'scripts', 'content', 'quiz'}
               for part in Path(name).parts):
            raise ValueError('Non-public path selected: ' + name)
    if len(files) + 1 > 1000:
        raise ValueError('Publication exceeds the 1,000-file dashboard upload limit.')
    return files


def local_target(root, base, target):
    if target.startswith(('https:', 'http:', 'mailto:', '#', 'data:')) or '${' in target:
        return None
    relative = unquote(target.split('#')[0].split('?')[0])
    if not relative:
        return None
    candidate = (root / base / relative).resolve()
    if not candidate.is_relative_to(root.resolve()):
        raise ValueError('Local link escapes publication root: ' + target)
    return candidate.relative_to(root.resolve()).as_posix()


def validate_links(root, files):
    html = (root / 'START_HERE.html').read_text(encoding='utf-8')
    for target in re.findall(r'(?:href|src)="([^"{}]+)"', html):
        name = local_target(root, Path(), target)
        if name and name not in files:
            raise ValueError('HTML references an unpublished asset: ' + name)
    for name, source in files.items():
        if source.suffix == '.md':
            for target in re.findall(r'\]\(([^)]+)\)', source.read_text(encoding='utf-8')):
                linked = local_target(root, Path(name).parent, target)
                if linked and linked not in files:
                    raise ValueError(f'Markdown references an unpublished asset: {name} -> {linked}')


def package_site(root):
    """Copy validated assets; preserve unexpected output for manual inspection."""
    root = root.resolve()
    output = root / 'dist'
    if output.resolve() != output:
        raise ValueError('dist must be a real directory inside the repository')
    files = publication_files(root)
    validate_links(root, files)
    existing = {p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file()}
    unexpected = existing - set(files) - {'deployment-manifest.json'}
    if unexpected:
        raise ValueError('Unexpected files in dist; inspect them before rebuilding: '
                         + ', '.join(sorted(unexpected)))
    for name in [*files, 'deployment-manifest.json']:
        if not (output / name).resolve().is_relative_to(output):
            raise ValueError('Publication destination escapes dist: ' + name)
    archive_path = root / 'dist.zip'
    if archive_path.is_symlink():
        raise ValueError('dist.zip must not be a symbolic link')
    output.mkdir(exist_ok=True)
    manifest = []
    for name, source in sorted(files.items()):
        destination = output / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        data = destination.read_bytes()
        manifest.append({'path': name, 'bytes': len(data),
                         'sha256': hashlib.sha256(data).hexdigest()})
    (output / 'deployment-manifest.json').write_text(
        json.dumps(manifest, indent=2) + '\n', encoding='utf-8', newline='\n')
    # Fixed metadata makes identical input bytes produce an identical ZIP.
    with ZipFile(archive_path, 'w', compression=ZIP_DEFLATED) as archive:
        for name in sorted([*files, 'deployment-manifest.json']):
            entry = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, (output / name).read_bytes())
    return {'output': 'dist', 'files': len(manifest) + 1,
            'bytes': sum(item['bytes'] for item in manifest), 'zip': 'dist.zip',
            'largest_asset': max(manifest, key=lambda item: item['bytes'])['path']}
