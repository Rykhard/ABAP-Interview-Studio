"""User-facing topic tree, independent of source-document and difficulty boundaries."""
from collections import Counter


def topic_catalog(modules):
    def section(key, title, ids):
        return dict(id=key, title=title, questionIds=ids.split())
    def topic(key, title, icon, description, sections):
        return dict(id=key, title=title, icon=icon, description=description, sections=sections)
    def numbered(prefix, count):
        return ' '.join(f'{prefix}-{n:02}' for n in range(1, count + 1))
    result = [
        topic('cloud', 'ABAP Cloud architecture', 'cloud', 'Choose extension placement, API boundaries, components and identity for the target landscape.', [
            section('cloud-placement', 'Placement & business boundaries', 'CLOUD-01 CLOUD-02 CLOUD-07 CLOUD-09 CLOUD-12 CLOUD-14'),
            section('cloud-apis', 'API selection & contracts', 'CLOUD-03 CLOUD-05 CLOUD-10 CLOUD-11 CLOUD-13 CLOUD-17'),
            section('cloud-lifecycle', 'Components & lifecycle', 'CLOUD-04 CLOUD-06 CLOUD-15 CLOUD-18'),
            section('cloud-isolation', 'Isolation & identity', 'CLOUD-08 CLOUD-16')]),
        topic('rap', 'RAP business objects', 'rap', 'Model behavior and reason through transactional state, consumer contracts and failure.', [
            section('rap-model', 'Model, implementation & exposure', 'RAP-01 RAP-02 RAP-14 ADV-09 ADV-10 ADV-12 SRAP-01 SRAP-16 SRAP-22'),
            section('rap-transactions', 'Transactions & save ownership', 'RAP-03 RAP-04 RAP-05 RAP-15 SRAP-02 SRAP-03 SRAP-04 SRAP-15 SRAP-17 SRAP-20'),
            section('rap-eml', 'EML, responses & numbering', 'RAP-07 RAP-08 RAP-10 RAP-11 SRAP-05 SRAP-06 SRAP-07 SRAP-08'),
            section('rap-behavior', 'Rules, actions & augmentation', 'RAP-06 RAP-13 ADV-04 ADV-05 ADV-06 SRAP-11 SRAP-13 SRAP-14 SRAP-19'),
            section('rap-state', 'Draft, concurrency & access', 'RAP-09 RAP-12 ADV-01 ADV-02 ADV-03 ADV-13 SRAP-09 SRAP-10 SRAP-12 SRAP-23'),
            section('rap-feedback', 'Messages, side effects & events', 'ADV-07 ADV-08 ADV-11 SRAP-18 SRAP-21 SRAP-24')]),
        topic('clean-core', 'Clean Core & extensibility', 'core', 'Classify dependencies and choose supported APIs, extension options and bounded exceptions.', [
            section('core-levels', 'Levels & ATC interpretation', 'CORE-01 CORE-02 CORE-03 CORE-04 CORE-05 CORE-06 CORE-07 CORE-14 CORE-17 GOV-01 GOV-16 GOV-18'),
            section('core-contracts', 'Released APIs & dependency chains', 'CORE-08 CORE-12 CORE-13 GOV-02 GOV-03 GOV-09 GOV-10'),
            section('core-choices', 'Extension choices & API gaps', 'CORE-09 CORE-10 CORE-11 CORE-15 GOV-05 GOV-07 GOV-08 GOV-14'),
            section('core-exceptions', 'Exceptions & delivery governance', 'CORE-16 GOV-04 GOV-11 GOV-12 GOV-15'),
            section('core-modernization', 'Modernization & upgrade planning', 'CORE-18 GOV-06 GOV-13 GOV-17')]),
        topic('cds', 'CDS modeling & security', 'cds', 'Build correct identities, relationships and query semantics while protecting every consumption path.', [
            section('cds-model', 'Entities, keys & relationships', 'CDS-01 CDS-02 CDS-03 CDS-04 CDS-05 CDS-11 MODEL-06 MODEL-10'),
            section('cds-projections', 'Projections, annotations & evolution', 'CDS-08 CDS-12 MODEL-08 MODEL-17'),
            section('cds-security', 'DCL & authorization boundaries', 'CDS-07 MODEL-01 MODEL-02 MODEL-11 MODEL-12 MODEL-13 MODEL-14 MODEL-15 MODEL-16'),
            section('cds-query', 'Custom queries & virtual elements', 'CDS-06 CDS-09 MODEL-03 MODEL-04 MODEL-05 MODEL-09'),
            section('cds-analytics', 'Analytics, amounts & aggregation', 'CDS-10 MODEL-07 MODEL-18')]),
        topic('abap', 'ABAP, OO & patterns', 'abap', 'Predict language behavior and design clear contracts, lifetimes and replaceable collaborators.', [
            section('abap-language', 'Language & values', 'ABAP-04 ABAP-05 ABAP-06 ABAP-07 ABAP-08 ABAP-09 ABAP-10 ABAP-12 ABAP-13 ABAP-14 BASE-01 BASE-02 BASE-04 BASE-05 BASE-06 BASE-07 BASE-12 BASE-13 BASE-14'),
            section('abap-tables', 'Tables & expressions', 'ABAP-01 ABAP-02 ABAP-03 ABAP-11 BASE-03 BASE-08 BASE-09 BASE-10 BASE-11 BASE-15 BASE-16'),
            section('abap-oo', 'OO contracts', 'OO-01 OO-02 OO-03 OO-04 OO-05 OO-06 OO-07 OO-08 OO-13 OO-14 '+numbered('OODEEP',12)),
            section('abap-patterns', 'Patterns', 'OO-09 OO-10 OO-11 OO-12 OO-15 '+numbered('PAT',12))]),
        topic('sql', 'SQL & HANA performance', 'performance', 'Preserve result semantics, select a database implementation and measure actual cost.', [
            section('sql-queries', 'Selection, joins & result semantics', 'SQL-02 SQL-03 SQL-04 SQL-05 SQL-06 SQL-07 SQL-08'),
            section('sql-performance', 'Measurement, buffering & data design', 'SQL-09 SQL-10 SQL-11 SQL-12 SQL-13'),
            section('sql-pushdown', 'CDS, AMDP & pushdown', 'SQL-01 SQL-14 SQLX-01 SQLX-02')]),
        topic('integration', 'Protocols & integration', 'integration', 'Connect systems with explicit payload, security, transaction and recovery contracts.', [
            section('integration-http', 'HTTP, REST & formats', numbered('HTTP',12)),
            section('integration-odata', 'OData & Fiori', numbered('ODATA',12)),
            section('integration-rfc', 'RFC, BAPI & jobs', numbered('RFC',12)),
            section('integration-idoc', 'IDoc & AIF', numbered('INTF',12)),
            section('integration-btp', 'BTP services & connectivity', numbered('BTP',10))]),
        topic('quality', 'Testing, delivery & operations', 'quality', 'Turn design claims into test evidence, traceable delivery and recoverable production behavior.', [
            section('quality-tests', 'Test design & doubles', 'TEST-01 TEST-02 TEST-03 TEST-04 TEST-10 OPS-01 OPS-02 OPS-03 OPS-04 OPS-15 OPS-18'),
            section('quality-boundaries', 'Security & concurrency tests', 'TEST-06 TEST-07 OPS-05'),
            section('quality-operations', 'Diagnosis, performance & recovery', 'TEST-09 OPS-06 OPS-07 OPS-08 OPS-11 OPS-12 OPS-13 OPS-17'),
            section('quality-delivery', 'Delivery, compatibility & release evidence', 'TEST-05 TEST-08 OPS-09 OPS-10 OPS-14 OPS-16 DELIV-01')]),
        topic('extensions', 'Enhancements & workflow', 'extension', 'Scope classic deliverables and connect extension mechanisms, migration and approval processing.', [
            section('extensions-scope', 'Scoping, interfaces & migration', 'RICEFW-01 RICEFW-02 RICEFW-05 RICEFW-06 RICEFW-07 RICEFW-15'),
            section('extensions-hooks', 'Enhancements & forms', 'RICEFW-03 RICEFW-04 RICEFW-08'),
            section('extensions-workflow', 'Workflow & approval lifecycle', 'RICEFW-09 RICEFW-10 RICEFW-11 RICEFW-12 RICEFW-13 RICEFW-14')]),
        topic('interview', 'Interview stories & judgment', 'interview', 'Explain your own work, defend decisions and identify the evidence or context still missing.', [
            section('interview-stories', 'Project stories & results', 'STORY-01 STORY-02 STORY-04'),
            section('interview-decisions', 'Decisions & interviewer questions', 'STORY-03 STORY-05 STORY-06')])]
    expected={q['id'] for m in modules for q in m['questions']}
    actual=Counter(ident for t in result for s in t['sections'] for ident in s['questionIds'])
    if set(actual)!=expected or any(n!=1 for n in actual.values()):
        raise ValueError('Topic tree must assign every canonical question exactly once')
    levels={q['id']:q['level'] for m in modules for q in m['questions']}
    for t in result:
        for s in t['sections']:
            s['questionIds'].sort(key=lambda ident:['Core','Advanced','Senior'].index(levels[ident]))
    return result
