"""Build dark diagram copies by mapping the authored semantic palette, not inverting images."""
import re
from pathlib import Path

PALETTE = {
    'rgb(7%,16%,24%)': '#e7eff2', 'rgb(100%,100%,100%)': '#192730',
    'rgb(7%,39%,32%)': '#9bdac1', 'rgb(32%,41%,48%)': '#aabdc6',
    'rgb(89%,94%,92%)': '#203c35', 'rgb(74%,32%,12%)': '#efb384',
    'rgb(95%,96%,96%)': '#10191f', 'rgb(80%,84%,85%)': '#59707b',
    'rgb(100%,94%,88%)': '#382c23', 'rgb(73%,80%,77%)': '#68877d',
    'rgb(32%,40%,46%)': '#aabdc6', 'rgb(88%,93%,90%)': '#203c35',
    'rgb(83%,87%,88%)': '#435961', 'rgb(97%,89%,84%)': '#463125',
    'rgb(88%,91%,94%)': '#203540', 'rgb(7%,20%,28%)': '#e7eff2',
    'rgb(9%,39%,47%)': '#9bceeb', 'rgb(65%,40%,9%)': '#efc586',
    'rgb(65%,24%,19%)': '#ffaba5', 'rgb(89%,92%,94%)': '#203540',
    'rgb(100%,94%,89%)': '#382c23',
}


def build_dark_visuals(root: Path, metadata):
    output = root / 'assets' / 'dark-diagrams'
    output.mkdir(parents=True, exist_ok=True)
    for visual in metadata:
        source = root / visual['image']
        if source.suffix != '.svg':
            # Raster illustrations keep their authored colors, like photos in a dark reader.
            continue
        text = source.read_text(encoding='utf-8')
        colors = set(re.findall(r'rgb\([^)]*\)|#[0-9a-fA-F]{3,8}\b', text))
        unknown = colors - PALETTE.keys()
        if unknown:
            raise ValueError(f'Unmapped diagram colors in {source.name}: {unknown}')
        dark = re.sub(r'rgb\([^)]*\)', lambda match: PALETTE[match[0]], text)
        target = output / source.name
        target.write_text(dark, encoding='utf-8', newline='\n')
        visual['darkImage'] = target.relative_to(root).as_posix()
