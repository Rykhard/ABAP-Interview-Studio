"""Compile reviewed offline localization resources without a translation service."""
import json
import re
from pathlib import Path


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def translate_ui(source, translations):
    # Phrases are authored presentation fragments. Word boundaries protect
    # identifiers, selectors, file names and technical enum values.
    pattern = re.compile(r'(?<![\w.\-/])(?:' + '|'.join(re.escape(key) for key in sorted(translations, key=len, reverse=True)) + r')(?![\w.\-/])')
    return pattern.sub(lambda match: translations[match.group()], source)


def translate_app(source, root, translations):
    for item in read_json(root/'locales/ru/source.json'):
        if item['from'] not in source:
            raise ValueError('Stale localized UI expression: ' + item['from'])
        source=source.replace(item['from'], item['to'])
    return translate_ui(source, translations)


def localized_payloads(root, modules, topics, examples, lessons, quizzes, visuals):
    locale = root / 'locales/ru'
    def collection(directory):
        return [item for path in sorted((locale / directory).glob('*.json')) for item in read_json(path)]
    translated_modules = [read_json(locale / (module['id'] + '.json')) for module in modules]
    translated_topics = read_json(locale / 'topics.json')
    result = {'study-data': translated_modules, 'topic-data': translated_topics,
              'code-data': collection('examples'), 'lesson-data': collection('lessons'),
              'quiz-data': collection('quiz'), 'visual-data': read_json(locale / 'visuals.json')}
    visual_lookup={item['id']:item for item in visuals}
    for item in result['visual-data']:
        if 'darkImage' in visual_lookup[item['id']]:
            item['darkImage']=visual_lookup[item['id']]['darkImage']
    originals = {'study-data': modules, 'topic-data': topics, 'code-data': examples,
                 'lesson-data': lessons, 'quiz-data': quizzes, 'visual-data': visuals}
    immutable = {'id', 'questionId', 'questionIds', 'questions', 'startFor', 'level', 'url',
                 'code', 'language', 'correctOption', 'image', 'darkImage', 'icon', 'lines', 'active'}
    def check(original, translated, path='', field=''):
        if field in immutable and not (field == 'questions' and isinstance(original, list) and original and isinstance(original[0], dict)):
            if original != translated:
                raise ValueError('Localization changed a technical value: ' + path)
            return
        if isinstance(original, dict):
            if original.keys() != translated.keys():
                raise ValueError('Localization field mismatch: ' + path)
            for key, value in original.items():
                check(value, translated[key], path + '/' + key, key)
        elif isinstance(original, list):
            if len(original) != len(translated):
                raise ValueError('Localization item count mismatch: ' + path)
            # Top-level records and questions are joined by ID, never position.
            if original and isinstance(original[0], dict) and 'id' in original[0]:
                lookup = {item['id']: item for item in translated}
                if len(lookup) != len(translated):
                    raise ValueError('Duplicate localization ID: ' + path)
                for item in original:
                    check(item, lookup[item['id']], path + '/' + item['id'])
            else:
                for index, (value, counterpart) in enumerate(zip(original, translated)):
                    check(value, counterpart, path + '/' + str(index), field)
        elif isinstance(original, str):
            if not isinstance(translated, str) or (original.strip() and not translated.strip()):
                raise ValueError('Empty translation: ' + path)
            if re.search(r'\?{4,}', translated) or '\ufffd' in translated:
                raise ValueError('Damaged translation encoding: ' + path)
            if field == 'detail':
                phase_pattern = r'(?m)^(\d+)\. ([A-Z][A-Z0-9_]+) - '
                if re.findall(phase_pattern, original) != re.findall(phase_pattern, translated):
                    raise ValueError('Localization changed a structured process step: ' + path)
            if field in {'question','answer','detail','pitfall','prompt','explanation','intro','scenario','goal','takeaway','limitation','outcome','caveat','note','evidence'} and len(original.split())>4 and not re.search('[А-Яа-яЁё]',translated):
                raise ValueError('Untranslated prose: ' + path)
        elif original != translated:
            raise ValueError('Localization changed a non-text value: ' + path)
    for key in originals:
        check(originals[key], result[key], key)
    return result
