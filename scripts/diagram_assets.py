"""Compile selectable bilingual SVGs and text alternatives using local resources."""
import json
import re
import textwrap
import xml.etree.ElementTree as ET
from pathlib import Path
from theme_visuals import PALETTE

NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
ALLOWED = {'svg', 'title', 'desc', 'g', 'rect', 'path', 'polygon', 'polyline',
           'line', 'circle', 'ellipse', 'text', 'tspan', 'clipPath', 'defs'}


def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def validate_tree(tree):
    for node in tree.iter():
        if node.tag.split('}')[-1] not in ALLOWED:
            raise ValueError('Unsupported inline SVG element: ' + node.tag)
        for key, value in node.attrib.items():
            if key.lower().startswith('on') or 'href' in key.lower():
                raise ValueError('Executable or external SVG attribute: ' + key)
            if 'url(' in value and not re.fullmatch(r'.*url\(#[\w-]+\).*', value):
                raise ValueError('External SVG style reference')


def fit_labels(tree, metrics):
    texts = list(tree.iter('{' + NS + '}text'))
    rectangles = [tuple(float(n.get(k, '0')) for k in ('x', 'y', 'width', 'height'))
                  for n in tree.iter('{' + NS + '}rect')]
    for node in tree.iter('{' + NS + '}circle'):
        x, y, radius = (float(node.get(k, '0')) for k in ('cx', 'cy', 'r'))
        rectangles.append((x-radius, y-radius, radius*2, radius*2))
    width = float(tree.get('width'))
    for node in texts:
        style = node.get('style', '')
        match = re.search(r'font-size:\s*([\d.]+)px', style)
        if not match:
            continue
        size = float(match[1])
        bold = 'Bold' in style or 'bold' in style
        style = re.sub(r'font-family:[^;]+;', 'font-family:Arial,Helvetica,sans-serif;', style)
        if bold:
            style += 'font-weight:700;'
        node.set('style', style)
        x, y = float(node.get('x', 0)), float(node.get('y', 0))
        candidates = [r for r in rectangles if r[0] <= x < r[0]+r[2] and r[1] < y < r[1]+r[3]]
        box = min(candidates, key=lambda r: r[2]*r[3]) if candidates else (0, 0, width, 0)
        budget = box[0] + box[2] - x - 8
        following = [float(t.get('x', 0))-x-6 for t in texts
                     if abs(float(t.get('y', 0))-y) < 1 and float(t.get('x', 0)) > x]
        if following:
            budget = min(budget, min(following))
        budget = max(budget, size)
        measured = sum(metrics['bold' if bold else 'normal'].get(c, .6) for c in node.text or '') * size
        node.set('data-label-width', str(round(budget, 2)))
        if measured > budget:
            node.set('textLength', str(round(budget, 2)))
            node.set('lengthAdjust', 'spacingAndGlyphs')


def story_svg(story, title, description):
    tree = ET.Element('{' + NS + '}svg', {'width': '880', 'height': '580', 'viewBox': '0 0 880 580'})
    def element(tag, **attrs):
        return ET.SubElement(tree, '{' + NS + '}' + tag, {k: str(v) for k, v in attrs.items()})
    element('rect', x=0, y=0, width=880, height=580, rx=8, fill='rgb(95%,96%,96%)')
    y = 35
    for panel in story['panels']:
        element('rect', x=24, y=y, width=832, height=154, rx=8, fill='rgb(100%,100%,100%)')
        t = element('text', x=42, y=y+32, style='font-family:Arial; font-size:20px; font-weight:700;fill:rgb(7%,39%,32%);')
        t.text = panel['title']
        for index, line in enumerate(textwrap.wrap(panel['body'], 76)):
            t = element('text', x=42, y=y+65+index*23, style='font-family:Arial; font-size:17px;fill:rgb(7%,16%,24%);')
            t.text = line
        y += 174
    return tree


def build_diagram_assets(root, visuals, write_files=True):
    translations = [record for file in sorted((root/'locales/ru/diagram-labels').glob('*.json'))
                    for record in load_json(file)]
    lookup = {item['id']: item for item in translations}
    if len(lookup) != len(translations):
        raise ValueError('Duplicate diagram translation')
    svg_ids = {v['id'] for v in visuals if v['image'].endswith('.svg')}
    if set(lookup) != svg_ids:
        raise ValueError('Missing or extra diagram translations: ' + str(set(lookup) ^ svg_ids))
    stories = {item['id']: item for item in load_json(root/'visuals/accessible-stories.json')}
    if set(stories) != {v['id'] for v in visuals if not v['image'].endswith('.svg')}:
        raise ValueError('Missing accessible illustration replacement')
    ru_visuals = {v['id']: v for v in load_json(root/'locales/ru/visuals.json')}
    metrics = load_json(root/'scripts/diagram-font-metrics.json')
    result = {'en': {}, 'ru': {}}
    for visual in visuals:
        ident = visual['id']
        for locale in ('en', 'ru'):
            metadata = visual if locale == 'en' else ru_visuals[ident]
            if ident in stories:
                story = stories[ident][locale]
                description = story['description']
                tree = story_svg(story, metadata['title'], description)
                panels = story['panels']
            else:
                record = lookup[ident]
                tree = ET.parse(root/visual['image']).getroot()
                labels = list(tree.iter('{' + NS + '}text'))
                if [node.text or '' for node in labels] != [entry['en'] for entry in record['labels']]:
                    raise ValueError('Stale diagram label translation: ' + ident)
                for node, entry in zip(labels, record['labels']):
                    if not isinstance(entry['ru'], str) or (entry['en'].strip() and not entry['ru'].strip()) or '\ufffd' in entry['ru']:
                        raise ValueError('Invalid diagram label: ' + ident)
                    node.text = entry[locale]
                description = record['description'][locale]
                panels = []
            if len(description) < 160 or (locale == 'ru' and not re.search('[А-Яа-я]', description)):
                raise ValueError('Missing full diagram description: ' + ident)
            validate_tree(tree)
            for child in list(tree):
                if child.tag in ('{' + NS + '}title', '{' + NS + '}desc'):
                    tree.remove(child)
            title = ET.Element('{' + NS + '}title', {'id': '__INSTANCE__-title'})
            title.text = metadata['title']
            desc = ET.Element('{' + NS + '}desc')
            desc.text = metadata['caption']
            tree.insert(0, desc)
            tree.insert(0, title)
            tree.set('role', 'img')
            tree.set('aria-labelledby', '__INSTANCE__-title')
            tree.set('lang', locale)
            tree.set('class', 'selectable-diagram')
            fit_labels(tree, metrics)
            light = ET.tostring(tree, encoding='unicode')
            # Each rendered instance gets unique clip/title IDs, even in all-answers mode.
            light = re.sub(r'\bid="(?!__INSTANCE__)([^"]+)"', r'id="__INSTANCE__-\1"', light)
            light = re.sub(r'url\(#(?!__INSTANCE__)([^)]+)\)', r'url(#__INSTANCE__-\1)', light)
            inline = light
            for index, color in enumerate(PALETTE):
                inline = inline.replace(color, f'var(--diagram-color-{index}, {color})')
            paths = {}
            for theme in ('light', 'dark'):
                exported = light if theme == 'light' else re.sub(r'rgb\([^)]*\)', lambda m: PALETTE[m[0]], light)
                exported = exported.replace('__INSTANCE__', ident+'-'+locale)
                path = Path('assets/localized-diagrams')/locale/theme/(ident+'.svg')
                paths[theme] = path.as_posix()
                if write_files:
                    (root/path).parent.mkdir(parents=True, exist_ok=True)
                    (root/path).write_text(exported, encoding='utf-8')
            result[locale][ident] = {'svg': inline, 'description': description,
                                    'panels': panels, 'kind': stories[ident]['kind'] if panels else 'svg',
                                    'downloads': paths}
    return result


def diagram_theme_css():
    return '[data-theme=dark] .selectable-diagram{' + ';'.join(
        f'--diagram-color-{i}:{value}' for i, value in enumerate(PALETTE.values())) + '}'
