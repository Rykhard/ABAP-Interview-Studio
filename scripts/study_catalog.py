"""Shared study order and meaningful curriculum tracks for every format."""
CLOUD_PREFIXES = ('16', '05', '17', '04', '18', '06', '19', '08', '20')
FOUNDATION_PREFIXES = ('01', '21', '02', '22', '23', '03')

def is_cloud(module):
    return module['id'][:2] in CLOUD_PREFIXES

def track_key(module):
    prefix=module['id'][:2]
    if prefix in CLOUD_PREFIXES:return 'cloud'
    if prefix in FOUNDATION_PREFIXES:return 'foundation'
    return 'integration'

def ordered_modules(modules):
    def order(module):
        prefix=module['id'][:2]
        if prefix in CLOUD_PREFIXES:return (0,CLOUD_PREFIXES.index(prefix))
        if prefix in FOUNDATION_PREFIXES:return (1,FOUNDATION_PREFIXES.index(prefix))
        return (2,module['id'])
    return sorted(modules,key=order)

def catalog(modules):
    return {'primary': [m['id'] for m in modules if is_cloud(m)],
            'foundation': [m['id'] for m in modules if track_key(m)=='foundation'],
            'integration': [m['id'] for m in modules if track_key(m)=='integration'],
            'primaryTitle': 'ABAP Cloud / RAP / Clean Core',
            'supportingTitle': 'ABAP foundations and integration'}
