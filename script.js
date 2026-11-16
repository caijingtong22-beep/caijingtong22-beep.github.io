(() => {
  const button = document.getElementById('language-toggle');
  const saved = (() => { try { return localStorage.getItem('jc-language'); } catch { return null; } })();
  function setLanguage(language) {
    const lang = language === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-lang]').forEach(el => { el.hidden = el.dataset.lang !== lang; });
    button.textContent = lang === 'en' ? '中文' : 'EN';
    button.setAttribute('aria-label', lang === 'en' ? 'Switch to Chinese' : 'Switch to English');
    document.querySelector('nav').setAttribute('aria-label', lang === 'en' ? 'Main navigation' : '主导航');
    document.querySelector('.profile')?.setAttribute('aria-label', lang === 'en' ? 'Personal profile' : '个人信息');
    try { localStorage.setItem('jc-language', lang); } catch { /* Browsing without storage still works. */ }
  }
  setLanguage(saved || 'en');
  button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'));
  document.getElementById('year').textContent = new Date().getFullYear();
  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-5% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main > section').forEach(section => observer.observe(section));
  }
})();
