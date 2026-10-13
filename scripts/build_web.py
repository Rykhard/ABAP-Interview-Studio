"""Build only the offline web app; preserve existing printable artifacts."""
import json,re
from pathlib import Path
from study_catalog import ordered_modules, catalog
from study_topics import topic_catalog
from code_examples import load_examples, write_example_guide
from theme_visuals import build_dark_visuals
from diagram_assets import build_diagram_assets, diagram_theme_css
from guided_lessons import load_lessons, write_lesson_guide
from localization import localized_payloads, read_json, translate_app
from job_catalog import write_catalog


def write_studio(root, modules, visual_metadata, quiz_items):
    write_catalog(root, modules)
    build_dark_visuals(root, visual_metadata)
    diagrams=build_diagram_assets(root, visual_metadata)
    def payload(data):
        return json.dumps(data,ensure_ascii=False,separators=(',', ':')).replace('<','\\u003c')
    template=(root/'scripts/study-template.html').read_text(encoding='utf-8-sig')
    app=(root/'scripts/studio.js').read_text(encoding='utf-8-sig').replace('__READING_APP__',(root/'scripts/studio-reading.js').read_text(encoding='utf-8-sig')).replace('__SEARCH_APP__',(root/'scripts/studio-search.js').read_text(encoding='utf-8-sig')).replace('__QUIZ_APP__',(root/'scripts/studio-quiz.js').read_text(encoding='utf-8-sig'))
    app=app.replace('__CODE_APP__', (root/'scripts/studio-code.js').read_text(encoding='utf-8'))
    app=app.replace('__MOTION_APP__', (root/'scripts/studio-motion.js').read_text(encoding='utf-8'))
    app=app.replace('__CALM_APP__', (root/'scripts/studio-calm.js').read_text(encoding='utf-8'))
    app=app.replace('__LEARNING_APP__', (root/'scripts/studio-learning.js').read_text(encoding='utf-8'))
    lessons=load_lessons(root, {q['id'] for module in modules for q in module['questions']})
    write_lesson_guide(root, lessons)
    app=app.replace('__LESSON_APP__', (root/'scripts/studio-lessons.js').read_text(encoding='utf-8')+'\n'+(root/'scripts/studio-scenes.js').read_text(encoding='utf-8'))
    examples=load_examples(root, {q['id'] for module in modules for q in module['questions']})
    write_example_guide(root, examples)
    topic_data=topic_catalog(modules)
    russian=localized_payloads(root, modules, topic_data, examples, lessons, quiz_items, visual_metadata)
    ui_translations=read_json(root/'locales/ru/ui.json')
    app+='\n'+(root/'scripts/studio-language.js').read_text(encoding='utf-8')
    ru_app=translate_app(app, root, ui_translations)
    collections_app=(root/'scripts/studio-collections.js').read_text(encoding='utf-8')
    app=app.replace('__COLLECTION_APP__',collections_app)
    ru_app=ru_app.replace('__COLLECTION_APP__',collections_app)
    job_app=(root/'scripts/studio-job.js').read_text(encoding='utf-8')
    app+='\n'+job_app
    ru_app+='\n'+job_app
    bootstrap=(root/'scripts/studio-data.js').read_text(encoding='utf-8')+'\n'+(root/'scripts/studio-locale-bootstrap.js').read_text(encoding='utf-8')
    app=bootstrap+'\nif(studioLocale===\'ru\'){\n'+ru_app+'\n}else{\n'+app+'\n}'
    template=template.replace('__RU_DATA__',payload(russian)).replace('__UI_RU_DATA__',payload(ui_translations))
    template=template.replace('__LANGUAGE_CSS__',(root/'scripts/language.css').read_text(encoding='utf-8'))
    values={'__MOTION_CSS__':(root/'scripts/motion.css').read_text(encoding='utf-8'),'__CODE_CSS__':(root/'scripts/code-examples.css').read_text(encoding='utf-8'),'__CODE_DATA__':payload(examples),'__USABILITY_CSS__':(root/'scripts/usability.css').read_text(encoding='utf-8'),'__PRACTICE_CSS__':(root/'scripts/practice.css').read_text(encoding='utf-8'),'__APP__':app,'__DATA__':payload(modules),'__VISUALS__':payload(visual_metadata),'__QUIZ__':payload(quiz_items),'__TRACKS__':payload(catalog(modules)),'__TOPICS__':payload(topic_catalog(modules))}
    values['__CALM_CSS__']=(root/'scripts/calm.css').read_text(encoding='utf-8')
    learning=read_json(root/'curriculum/learning.json')
    values['__LEARNING_DATA__']=payload(learning)
    values['__CALM_CSS__']+='\n'+(root/'scripts/learning.css').read_text(encoding='utf-8')
    values['__CALM_CSS__']+='\n'+(root/'scripts/job-preparation.css').read_text(encoding='utf-8')
    values['__LESSON_DATA__']=payload(lessons)
    values['__SIMPLIFY_CSS__']=(root/'scripts/simplify.css').read_text(encoding='utf-8')
    values['__SIMPLIFY_CSS__']+='\n'+(root/'scripts/diagrams.css').read_text(encoding='utf-8')+'\n'+diagram_theme_css()
    values['__SIMPLIFY_CSS__']+='\n'+(root/'scripts/selects.css').read_text(encoding='utf-8')
    values['__DIAGRAM_DATA__']=payload(diagrams)
    values['__LESSON_CSS__']=(root/'scripts/lessons.css').read_text(encoding='utf-8')+'\n'+(root/'scripts/scenes.css').read_text(encoding='utf-8')
    values['__INTERACTIVE_DATA__']=payload({'en':read_json(root/'visuals/interactive-scenes.json'),'ru':read_json(root/'locales/ru/interactive-scenes.json')})
    for token,value in values.items():template=template.replace(token,value)
    if re.search(r'__(?!INSTANCE__)[A-Z][A-Z_]+__', template):
        raise ValueError('Unresolved application template token')
    (root/'START_HERE.html').write_text(template,encoding='utf-8',newline='\n')
    questions={q['id']:(m,q) for m in modules for q in m['questions']}
    lines=['# Study topic map', '', 'Learning levels describe the task: Core (basics), Applied (application), Advanced (complex scenarios). They are independent of the original interview rubric. The app offers optional topic paths; source documents keep their stable names for printable exports.', '']
    for topic in topic_catalog(modules):
        count=sum(len(section['questionIds']) for section in topic['sections'])
        lines.extend([f"## {topic['title']}", '', f"{count} questions. {topic['description']}", ''])
        for section in topic['sections']:
            lines.extend([f"### {section['title']}", '', '| Question | Level |', '| --- | --- |'])
            for ident in section['questionIds']:
                module,question=questions[ident]
                label=(ident+' - '+question['question']).replace('|', r'\|')
                anchor=re.sub(r'[^\w -]', '', ident+' '+question['question']).lower().replace(' ','-')
                lines.append(f"| [{label}](../topics/{module['id']}.md#{anchor}) | {learning['questions'][ident]['level']} |")
            lines.append('')
    (root/'study/Topic_Map.md').write_text('\n'.join(lines),encoding='utf-8')



if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    modules=ordered_modules([json.loads(p.read_text(encoding='utf-8-sig')) for p in sorted((root/'content').glob('*.json'))])
    visuals=json.loads((root/'visuals/catalog.json').read_text(encoding='utf-8'))
    quizzes=[q for p in sorted((root/'quiz').glob('*.json')) for q in json.loads(p.read_text(encoding='utf-8-sig'))]
    write_studio(root,modules,visuals,quizzes)
    print(f'Built offline studio: {len(topic_catalog(modules))} topics, {sum(len(m["questions"]) for m in modules)} questions, {len(quizzes)} challenges')
