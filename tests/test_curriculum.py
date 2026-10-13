"""Validate learning metadata against the canonical question and topic catalog."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from study_topics import topic_catalog


class CurriculumTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.modules = [json.loads(path.read_text(encoding='utf-8'))
                       for path in sorted((ROOT / 'content').glob('*.json'))]
        cls.canonical = {question['id']: question
                         for module in cls.modules for question in module['questions']}
        cls.topics = {topic['id']: topic for topic in topic_catalog(cls.modules)}
        cls.curriculum = json.loads(
            (ROOT / 'curriculum' / 'learning.json').read_text(encoding='utf-8'))

    def test_every_question_has_exactly_one_learning_level(self):
        definitions = self.curriculum['levels']
        self.assertEqual([level['id'] for level in definitions],
                         ['Core', 'Applied', 'Advanced'])
        for definition in definitions:
            for field in ('title', 'titleRu', 'description', 'descriptionRu'):
                self.assertTrue(definition[field].strip(), (definition['id'], field))
        questions = self.curriculum['questions']
        self.assertEqual(set(questions), set(self.canonical))
        for ident, metadata in questions.items():
            self.assertIn(metadata['level'], ('Core', 'Applied', 'Advanced'), ident)
        # Learning difficulty must not simply inherit the old Senior label.
        self.assertEqual(questions['CLOUD-02']['level'], 'Core')

    def test_one_bounded_route_per_topic(self):
        paths = self.curriculum['paths']
        self.assertEqual(len(paths), len(self.topics))
        self.assertEqual({path['topic'] for path in paths}, set(self.topics))
        for path in paths:
            with self.subTest(topic=path['topic']):
                for field in ('title', 'titleRu', 'goal', 'goalRu'):
                    self.assertTrue(path[field].strip(), field)
                ids = path['questionIds']
                self.assertGreaterEqual(len(ids), 6)
                self.assertLessEqual(len(ids), 8)
                self.assertEqual(len(ids), len(set(ids)))
                topic_ids = {ident for section in self.topics[path['topic']]['sections']
                             for ident in section['questionIds']}
                self.assertLessEqual(set(ids), topic_ids)
                checkpoint = path['checkpoint']
                self.assertIn(checkpoint['questionId'], ids)
                for field in ('prompt', 'promptRu', 'answer', 'answerRu'):
                    self.assertTrue(checkpoint[field].strip(), field)

    def test_prerequisites_exist_are_earlier_and_have_no_cycles(self):
        edges = {}
        for path in self.curriculum['paths']:
            ids = path['questionIds']
            positions = {ident: index for index, ident in enumerate(ids)}
            self.assertLessEqual(set(path['prerequisites']), set(ids))
            for ident, prerequisites in path['prerequisites'].items():
                self.assertLessEqual(len(prerequisites), 2, ident)
                self.assertEqual(len(prerequisites), len(set(prerequisites)), ident)
                for prerequisite in prerequisites:
                    self.assertIn(prerequisite, self.canonical)
                    self.assertIn(prerequisite, positions)
                    self.assertLess(positions[prerequisite], positions[ident], ident)
                edges.setdefault(ident, set()).update(prerequisites)

        visited, active = set(), set()

        def visit(ident):
            self.assertNotIn(ident, active, f'Prerequisite cycle at {ident}')
            if ident in visited:
                return
            active.add(ident)
            for prerequisite in edges.get(ident, ()):
                visit(prerequisite)
            active.remove(ident)
            visited.add(ident)

        for ident in edges:
            visit(ident)


if __name__ == '__main__':
    unittest.main()
