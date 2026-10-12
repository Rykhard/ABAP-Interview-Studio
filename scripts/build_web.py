"""Build only the offline web app; preserve existing printable artifacts."""
import json,re
from pathlib import Path
from study_catalog import ordered_modules, catalog
from study_topics import topic_catalog
from code_examples import load_examples, write_example_guide


def write_studio(root, modules, visual_metadata, quiz_items):
    def payload(data):
        return json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    template=(root/'scripts/study-template.html').read_text(encoding='utf-8-sig')
    app=(root/'scripts/studio.js').read_text(encoding='utf-8-sig').replace('__READING_APP__',(root/'scripts/studio-reading.js').read_text(encoding='utf-8-sig')).replace('__SEARCH_APP__',(root/'scripts/studio-search.js').read_text(encoding='utf-8-sig')).replace('__QUIZ_APP__',(root/'scripts/studio-quiz.js').read_text(encoding='utf-8-sig'))
    app=app.replace('__CODE_APP__', (root/'scripts/studio-code.js').read_text(encoding='utf-8'))
    examples=load_examples(root, {q['id'] for module in modules for q in module['questions']})
    write_example_guide(root, examples)
    values={'__CODE_CSS__':(root/'scripts/code-examples.css').read_text(encoding='utf-8'),'__CODE_DATA__':payload(examples),'__USABILITY_CSS__':(root/'scripts/usability.css').read_text(encoding='utf-8'),'__PRACTICE_CSS__':(root/'scripts/practice.css').read_text(encoding='utf-8'),'__APP__':app,'__DATA__':payload(modules),'__VISUALS__':payload(visual_metadata),'__QUIZ__':payload(quiz_items),'__TRACKS__':payload(catalog(modules)),'__TOPICS__':payload(topic_catalog(modules))}
    for token,value in values.items():template=template.replace(token,value)
    (root/'START_HERE.html').write_text(template,encoding='utf-8')
    questions={q['id']:(m,q) for m in modules for q in m['questions']}
    lines=['# Study topic map', '', 'The studio groups questions by subject. Core, Advanced and Senior levels stay inside each topic. Source documents keep their stable module names for printable exports.', '']
    for topic in topic_catalog(modules):
        count=sum(len(section['questionIds']) for section in topic['sections'])
        lines.extend([f"## {topic['title']}", '', f"{count} questions. {topic['description']}", ''])
        for section in topic['sections']:
            lines.extend([f"### {section['title']}", '', '| Question | Level |', '| --- | --- |'])
            for ident in section['questionIds']:
                module,question=questions[ident]
                label=(ident+' - '+question['question']).replace('|', r'\|')
                anchor=re.sub(r'[^\w -]', '', ident+' '+question['question']).lower().replace(' ','-')
                lines.append(f"| [{label}](../topics/{module['id']}.md#{anchor}) | {question['level']} |")
            lines.append('')
    (root/'study/Topic_Map.md').write_text('\n'.join(lines),encoding='utf-8')



if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    modules=ordered_modules([json.loads(p.read_text(encoding='utf-8-sig')) for p in sorted((root/'content').glob('*.json'))])
    visuals=json.loads((root/'visuals/catalog.json').read_text(encoding='utf-8'))
    quizzes=[q for p in sorted((root/'quiz').glob('*.json')) for q in json.loads(p.read_text(encoding='utf-8-sig'))]
    write_studio(root,modules,visuals,quizzes)
    print(f'Built offline studio: {len(topic_catalog(modules))} topics, {sum(len(m["questions"]) for m in modules)} questions, {len(quizzes)} challenges')
