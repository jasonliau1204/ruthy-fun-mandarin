const content = window.siteContent || { podcasts: [], videos: [] };
const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const podcastList = document.querySelector('#podcast-list');
if (!podcastList.children.length) podcastList.innerHTML = content.podcasts.map((item) => `
  <article class="episode-card reveal"><div class="episode-top"><span>${escapeHTML(item.category)}</span><b>${escapeHTML(item.number)}</b></div><h3>${escapeHTML(item.title)}</h3><p class="english-title">${escapeHTML(item.english)}</p><p>${escapeHTML(item.description)}</p><div class="episode-bottom"><span>${escapeHTML(item.duration)}</span><a href="${escapeHTML(item.url)}" target="_blank" rel="noopener" aria-label="收聽：${escapeHTML(item.title)}">播放 <b>▶</b></a></div></article>`).join('');
const videoList = document.querySelector('#video-list');
if (!videoList.children.length) videoList.innerHTML = content.videos.map((item, index) => `
  <a class="video-card reveal" href="${escapeHTML(item.url)}" target="_blank" rel="noopener"><div class="video-thumb ${escapeHTML(item.color)}"><span class="video-symbol">${['你好', '3秒', '一起學'][index % 3]}</span><i>▶</i><small>${escapeHTML(item.label)}</small></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.english)}</p></a>`).join('');
document.querySelector('#year').textContent = new Date().getFullYear();
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); nav.classList.toggle('open', !open); });
nav.addEventListener('click', () => { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else { document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible')); }
