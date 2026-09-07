from pathlib import Path
from PIL import Image

source = Path('public/assets/chess-icon-source.png')
res = Path('android/app/src/main/res')
image = Image.open(source).convert('RGB')
# Keep the supplied square artwork intact and create crisp launcher variants.
sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
for density, size in sizes.items():
    icon = image.resize((size, size), Image.Resampling.LANCZOS)
    for name in ('ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'):
        target = res / f'mipmap-{density}' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        icon.save(target, 'PNG', optimize=True)
