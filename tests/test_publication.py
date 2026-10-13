"""Publication regressions: excluded files, escaped links and repeatable output."""
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from publication import local_target, package_site, publication_files


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        for name in ('START_HERE.html', 'README.md', '404.html', '_headers'):
            (self.root / name).write_text('Public fixture', encoding='utf-8')

    def test_private_sources_are_not_selected(self):
        for name in ('tasks/note.md', 'content/question.json', '.env', 'tests/test.js'):
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('Private fixture', encoding='utf-8')
        self.assertEqual(set(publication_files(self.root)),
                         {'index.html', 'START_HERE.html', 'README.md', '404.html', '_headers'})

    def test_nested_hidden_assets_are_rejected(self):
        path = self.root / 'assets/.private/secret.svg'
        path.parent.mkdir(parents=True)
        path.write_text('<svg/>', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'Non-public'):
            publication_files(self.root)

    def test_encoded_link_cannot_escape(self):
        with self.assertRaisesRegex(ValueError, 'escapes'):
            local_target(self.root, Path(), '%2e%2e/private.txt')
        self.assertEqual(local_target(self.root, Path('docs'), '../README.md#read'), 'README.md')
        self.assertIsNone(local_target(self.root, Path(), 'https://example.com/'))

    def test_unpublished_link_fails_before_output(self):
        (self.root / 'README.md').write_text('[Private](tasks/private.md)', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'unpublished'):
            package_site(self.root)
        self.assertFalse((self.root / 'dist').exists())

    def test_unexpected_output_is_preserved(self):
        path = self.root / 'dist/keep.txt'
        path.parent.mkdir()
        path.write_text('Keep me', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'Unexpected files'):
            package_site(self.root)
        self.assertEqual(path.read_text(), 'Keep me')

    def test_repeatable_zip_and_manifest(self):
        package_site(self.root)
        first = (self.root / 'dist.zip').read_bytes()
        package_site(self.root)
        self.assertEqual(first, (self.root / 'dist.zip').read_bytes())
        for item in json.loads((self.root / 'dist/deployment-manifest.json').read_text()):
            data = (self.root / 'dist' / item['path']).read_bytes()
            self.assertEqual(item['sha256'], hashlib.sha256(data).hexdigest())
            self.assertEqual(item['bytes'], len(data))


if __name__ == '__main__':
    unittest.main()
