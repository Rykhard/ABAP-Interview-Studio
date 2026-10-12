"""Load and validate the question-specific teaching excerpts using stdlib only."""
import json
import re


def load_examples(root, question_ids):
    examples = [item for path in sorted((root / 'examples').glob('*.json'))
                for item in json.loads(path.read_text(encoding='utf-8'))]
    seen = set()
    for item in examples:
        ident = item['id']
        assert re.fullmatch(r'[a-z][a-z0-9-]+', ident), ident
        assert ident not in seen, 'Duplicate code example: ' + ident
        seen.add(ident)
        for field in ['title', 'intro', 'context', 'code', 'outcome', 'caveat']:
            assert isinstance(item.get(field), str) and item[field].strip(), ident + ': ' + field
        assert item['language'] in {'ABAP', 'CDS', 'BDEF', 'HTTP', 'JSON', 'XML', 'SQL'}, ident
        assert item['questions'] and len(item['questions']) == len(set(item['questions'])), ident
        assert set(item['questions']) <= question_ids, 'Unknown question in ' + ident
        assert set(item.get('startFor', [])) <= set(item['questions']), ident
        focused = [qid for step in item['highlights'] for qid in step.get('questions', [])]
        assert len(focused) == len(set(focused)) and set(focused) <= set(item['questions']), ident
        lines = item['code'].split('\n')
        assert 2 <= len(lines) <= 45, 'Unbounded or empty excerpt: ' + ident
        assert '\t' not in item['code'], 'Use spaces for stable line layout: ' + ident
        assert 2 <= len(item['highlights']) <= 4, ident
        for step in item['highlights']:
            assert step['label'].strip() and step['explanation'].strip(), ident
            assert step['lines'] and len(set(step['lines'])) == len(step['lines']), ident
            assert all(type(line) is int and 1 <= line <= len(lines) for line in step['lines']), ident
        assert item['references'], ident
        for ref in item['references']:
            assert ref['title'].strip() and ref['url'].startswith('https://'), ident
    assert examples, 'Code example sources are missing'
    return examples


def write_example_guide(root, examples):
    lines = ['# Worked code examples', '',
             'Read these excerpts alongside their linked questions in the app. Select a step there to highlight the important lines. These are teaching fragments with stated prerequisites, not complete activated SAP applications.', '']
    for item in examples:
        lines.extend(['## ' + item['title'], '', item['intro'], '',
                      'Questions: ' + ', '.join(f'[{qid}](https://abap-interview-studio.pages.dev/#q-{qid})' for qid in item['questions']), '',
                      '**Where this belongs:** ' + item['context'], '',
                      '```' + {'BDEF': 'abap', 'CDS': 'sql', 'HTTP': 'http'}.get(item['language'], item['language'].lower()),
                      item['code'], '```', '', '**Read it step by step:**', ''])
        for index, step in enumerate(item['highlights'], 1):
            lines.append(f"{index}. **{step['label']}** (lines {', '.join(map(str, step['lines']))}): {step['explanation']}")
        lines.extend(['', '**What happens:** ' + item['outcome'], '', '**Scope:** ' + item['caveat'], '', '**Primary references:**', ''])
        lines.extend(f"- [{ref['title']}]({ref['url']})" for ref in item['references'])
        lines.append('')
    (root / 'study/Code_Examples.md').write_text('\n'.join(lines), encoding='utf-8')
