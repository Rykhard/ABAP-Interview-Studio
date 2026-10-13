"""Reject stale committed web artifacts after a build, ignoring platform newlines."""
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
paths = ('START_HERE.html', 'study/Code_Examples.md', 'study/Guided_Lessons.md',
         'study/Topic_Map.md', 'server/catalog.json')
for name in paths:
    committed = subprocess.check_output(['git', 'show', 'HEAD:' + name], cwd=root)
    current = (root / name).read_bytes()
    if committed.replace(b'\r\n', b'\n') != current.replace(b'\r\n', b'\n'):
        raise SystemExit('Stale generated artifact; rebuild and commit: ' + name)
print('Committed web artifacts match their sources.')
