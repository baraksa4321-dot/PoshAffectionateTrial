import fitz
from pathlib import Path
pdf = Path('attached_assets/\u200e⁨תוכנית_אימונים_ראשונית_תומר_יוספן⁩_1789275140995.pdf')
out = Path('.agents/outputs/tomer-training-pdf')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf)
print('pages', doc.page_count)
print('metadata', doc.metadata)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    path = out / f'page-{i+1}.png'
    pix.save(path)
    print(path, page.rect)
