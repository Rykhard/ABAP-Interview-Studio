"""Validate authored process lessons and write a portable reading companion."""
import json
import re


def load_lessons(root, question_ids):
    lessons = [item for path in sorted((root / 'lessons').glob('*.json'))
               for item in json.loads(path.read_text(encoding='utf-8'))]
    seen = set()
    for lesson in lessons:
        ident = lesson['id']
        assert re.fullmatch(r'lesson-[a-z0-9-]+', ident), ident
        assert ident not in seen, 'Duplicate lesson: ' + ident
        seen.add(ident)
        for field in ['title', 'scenario', 'goal', 'takeaway', 'limitation']:
            assert isinstance(lesson.get(field), str) and lesson[field].strip(), ident + ': ' + field
        assert lesson['questions'] and len(lesson['questions']) == len(set(lesson['questions'])), ident
        assert set(lesson['questions']) <= question_ids, 'Unknown question: ' + ident
        nodes = lesson['nodes']
        assert 3 <= len(nodes) <= 6, ident + ': nodes'
        node_ids = {node['id'] for node in nodes}
        assert len(node_ids) == len(nodes), ident + ': duplicate node'
        assert all(re.fullmatch(r'[a-z][a-z0-9-]*', node['id']) and node['label'].strip() for node in nodes), ident
        assert 4 <= len(lesson['steps']) <= 6, ident + ': steps'
        previous = None
        for step in lesson['steps']:
            assert all(isinstance(step.get(f), str) and step[f].strip() for f in ['title', 'explanation', 'outcome']), ident
            assert step['active'] and set(step['active']) <= node_ids, ident + ': active nodes'
            assert 2 <= len(step['states']) <= 5, ident + ': state board'
            labels = [state['label'] for state in step['states']]
            assert len(labels) == len(set(labels)), ident + ': duplicate state label'
            assert all(isinstance(state.get(f), str) and state[f].strip() for state in step['states'] for f in ['label', 'value']), ident
            assert step['states'] != previous, ident + ': step must change the worked example'
            previous = step['states']
        assert lesson['references'], ident + ': references'
        for ref in lesson['references']:
            assert ref['title'].strip() and ref['url'].startswith('https://'), ident
    assert lessons, 'Authored guided lessons are missing'
    return lessons


def write_lesson_guide(root, lessons):
    lines = ['# Guided process lessons', '',
             'In the app, choose Step by step below a supported question. Each step updates the highlighted process stage and the example state. Values illustrate a scenario; this is not a live SAP execution.', '',
             'Explanation keeps the reading view with a compact diagram preview. Code shows a worked excerpt beside the explanation. Set your default in Reading preferences; Step by step remains a local choice. These views share the same question, sources and saved progress.', '']
    for lesson in lessons:
        lines.extend(['## ' + lesson['title'], '', lesson['scenario'], '', '**Learn:** ' + lesson['goal'], '',
                      'Questions: ' + ', '.join(f'[{qid}](https://abap-interview-studio.pages.dev/#q-{qid})' for qid in lesson['questions']), ''])
        for index, step in enumerate(lesson['steps'], 1):
            lines.extend([f"### {index}. {step['title']}", '', step['explanation'], '',
                          *[f"- **{state['label']}:** {state['value']}" for state in step['states']], '', step['outcome'], ''])
        lines.extend(['**Remember:** ' + lesson['takeaway'], '', '**Scope:** ' + lesson['limitation'], '', '**Sources:**', ''])
        lines.extend(f"- [{ref['title']}]({ref['url']})" for ref in lesson['references'])
        lines.append('')
    (root / 'study/Guided_Lessons.md').write_text('\n'.join(lines), encoding='utf-8')
