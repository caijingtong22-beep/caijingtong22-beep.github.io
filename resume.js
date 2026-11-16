const pages = document.querySelector('#pages');
const status = document.querySelector('#status');
const zoom = document.querySelector('#zoom');
let pdf, rendering = false, pending = false;
async function renderPages() {
  if (rendering) { pending = true; return; }
  rendering = true;
  zoom.disabled = true;
  try {
    const fragment = document.createDocumentFragment();
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const base = page.getViewport({scale: 1});
      const scale = zoom.value === 'fit' ? Math.min(900, Math.max(200, pages.clientWidth - 32)) / base.width : Number(zoom.value);
      const viewport = page.getViewport({scale});
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const wrapper = document.createElement('section');
      wrapper.className = 'pdf-page';
      wrapper.setAttribute('aria-label', `简历第 ${n} 页`);
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `简历第 ${n} 页，可在下方展开文字版`);
      await page.render({canvasContext: canvas.getContext('2d'), viewport, transform: [ratio, 0, 0, ratio, 0, 0]}).promise;
      wrapper.append(canvas);
      fragment.append(wrapper);
    }
    pages.replaceChildren(fragment);
    status.hidden = true;
  } finally {
    rendering = false;
    zoom.disabled = false;
    if (pending) { pending = false; renderPages().catch(showFallback); }
  }
}
function showFallback(error) {
  console.error('PDF display failed', error);
  status.textContent = '下方为简历预览。可使用顶部链接下载原始 PDF。';
  status.hidden = false;
  const wrapper = document.createElement('div');
  wrapper.className = 'fallback';
  const img = document.createElement('img');
  img.src = 'assets/resume-preview.png';
  img.alt = '蔡静桐的简历';
  wrapper.append(img);
  pages.replaceChildren(wrapper);
  zoom.disabled = true;
}
try {
  const pdfjs = await import('./vendor/pdfjs/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
  pdf = await pdfjs.getDocument({url: 'assets/jingtong-cai-resume.pdf', cMapUrl: 'vendor/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: 'vendor/pdfjs/standard_fonts/', wasmUrl: 'vendor/pdfjs/wasm/'}).promise;
  document.querySelector('#page-count').textContent = `${pdf.numPages} 页 · PDF`;
  await renderPages();
  const text = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    text.push(content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join(''));
  }
  document.querySelector('#text-content').textContent = text.join('\n\n');
  document.querySelector('#text-view').hidden = false;
  zoom.addEventListener('change', () => renderPages().catch(showFallback));
  let resize;
  window.addEventListener('resize', () => {
    clearTimeout(resize);
    if (zoom.value === 'fit') resize = setTimeout(() => renderPages().catch(showFallback), 180);
  });
} catch (error) { showFallback(error); }
