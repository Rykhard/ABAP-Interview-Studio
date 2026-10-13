"""Generate the server-only question index from the same sources as the studio."""
import json
from pathlib import Path

from study_catalog import ordered_modules
from study_topics import topic_catalog


def make_catalog(root, modules):
    placements = {ident: (topic['title'], section['title'])
                  for topic in topic_catalog(modules) for section in topic['sections']
                  for ident in section['questionIds']}
    learning = json.loads((root / 'curriculum/learning.json').read_text(encoding='utf-8'))
    result = []
    for module in modules:
        russian = json.loads((root / 'locales/ru' / (module['id'] + '.json')).read_text(encoding='utf-8-sig'))
        translated = {question['id']: question['question'] for question in russian['questions']}
        for question in module['questions']:
            ident = question['id']
            topic, section = placements[ident]
            result.append(dict(id=ident, title=question['question'], title_ru=translated[ident],
                               topic=topic, section=section, level=learning['questions'][ident]['level']))
    return sorted(result, key=lambda question: question['id'])


def write_catalog(root, modules):
    target = root / 'server/catalog.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(make_catalog(root, modules), ensure_ascii=False, indent=2) + '\n',
                      encoding='utf-8', newline='\n')


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    modules = ordered_modules([json.loads(path.read_text(encoding='utf-8-sig'))
                               for path in sorted((root / 'content').glob('*.json'))])
    write_catalog(root, modules)
