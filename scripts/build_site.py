"""Build the static Cloudflare Pages artifact; imports have no build side effects."""
import json
import subprocess
import sys
from pathlib import Path
from publication import package_site

ROOT = Path(__file__).resolve().parents[1]


def main():
    subprocess.run([sys.executable, str(ROOT / 'scripts/build_web.py')], check=True)
    print(json.dumps(package_site(ROOT), indent=2))


if __name__ == '__main__':
    main()
