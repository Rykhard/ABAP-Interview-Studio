"""Keep the AI catalog canonical and outside the public asset boundary."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from job_catalog import make_catalog
from publication import publication_files


class JobCatalogTests(unittest.TestCase):
    def test_catalog_contains_every_question_once_without_answers(self):
        modules = [json.loads(path.read_text(encoding='utf-8-sig'))
                   for path in (ROOT / 'content').glob('*.json')]
        result = make_catalog(ROOT, modules)
        ids = [item['id'] for item in result]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(set(ids), {q['id'] for m in modules for q in m['questions']})
        self.assertTrue(all(set(item) == {'id', 'title', 'title_ru', 'topic', 'section', 'level'} for item in result))
        self.assertEqual(result, json.loads((ROOT / 'server/catalog.json').read_text(encoding='utf-8')))

    def test_only_api_route_configuration_is_public(self):
        files = publication_files(ROOT)
        self.assertIn('_routes.json', files)
        self.assertFalse(any(name.startswith(('server/', 'functions/', 'evals/')) for name in files))
        self.assertEqual(json.loads((ROOT / '_routes.json').read_text())['include'], ['/api/prepare-job'])


if __name__ == '__main__':
    unittest.main()
