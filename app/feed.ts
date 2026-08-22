const PODCAST_RSS = 'https://anchor.fm/s/110cb580c/podcast/rss';
const YOUTUBE_VIDEOS = 'https://www.youtube.com/@Ruthyfunmandarin/videos?hl=zh-TW';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char] || char));

function decodeXml(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ').trim();
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return decodeXml(match?.[1] || '');
}

async function podcastMarkup() {
  const response = await fetch(PODCAST_RSS, { headers: { 'user-agent': 'RuthyFunMandarinWebsite/1.0' } });
  if (!response.ok) throw new Error('Podcast feed unavailable');
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 3).map((match, index) => {
    const item = match[1];
    const published = tag(item, 'pubDate');
    const date = published ? new Intl.DateTimeFormat('zh-TW', { month: 'short', day: 'numeric', timeZone: 'Asia/Taipei' }).format(new Date(published)) : '最新集數';
    const title = tag(item, 'title');
    const url = tag(item, 'link') || 'https://open.spotify.com/show/6Rpce3YGQV7o61OqdkCJcv';
    return `<article class="episode-card reveal"><div class="episode-top"><span>${escapeHtml(date)}</span><b>${String(index + 1).padStart(2, '0')}</b></div><h3>${escapeHtml(title)}</h3><p class="english-title">Ruthy Fun華語</p><p>${escapeHtml(tag(item, 'description').slice(0, 150))}</p><div class="episode-bottom"><span>${escapeHtml(tag(item, 'itunes:duration') || '立即收聽')}</span><a href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="收聽：${escapeHtml(title)}">播放 <b>▶</b></a></div></article>`;
  }).join('');
}

function extractJsonObject(source: string, marker: string) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = source.indexOf('{', markerIndex + marker.length);
  let depth = 0, quoted = false, escaped = false;
  for (let index = start; index >= 0 && index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '{') depth += 1;
    else if (char === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  return null;
}

function textOf(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.simpleText) return value.simpleText;
  return Array.isArray(value.runs) ? value.runs.map((run: any) => run.text || '').join('') : '';
}

async function videoMarkup() {
  const response = await fetch(YOUTUBE_VIDEOS, { headers: { 'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' } });
  if (!response.ok) throw new Error('YouTube unavailable');
  const html = await response.text();
  const decodedHtml = html.replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const found: any[] = [], seen = new Set<string>();
  const compactPattern = /"compactVideoRenderer":\{"videoId":"([^"]+)"[\s\S]{0,5000}?"title":\{"runs":\[\{"text":"((?:\\.|[^"])*)"/g;
  for (const match of decodedHtml.matchAll(compactPattern)) {
    if (found.length >= 3) break;
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    let title = match[2];
    try { title = JSON.parse(`"${title}"`); } catch { /* Keep the readable source text. */ }
    found.push({ id, title, label: '最新影片', description: 'Watch on YouTube', thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` });
  }
  const lockupPattern = /"lockupViewModel":\{[\s\S]{0,2500}?\/vi\/([^/"?]+)\/[\s\S]{0,9000}?"lockupMetadataViewModel":\{"title":\{"content":"((?:\\.|[^"])*)"/g;
  for (const match of decodedHtml.matchAll(lockupPattern)) {
    if (found.length >= 3) break;
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    let title = match[2];
    try { title = JSON.parse(`"${title}"`); } catch { /* Keep the readable source text. */ }
    found.push({ id, title, label: '最新影片', description: 'Watch on YouTube', thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` });
  }
  const raw = extractJsonObject(decodedHtml, 'var ytInitialData =') || extractJsonObject(decodedHtml, 'ytInitialData =');
  const visit = (value: any) => {
    if (!value || found.length >= 3) return;
    if (Array.isArray(value)) return void value.forEach(visit);
    if (typeof value !== 'object') return;
    const renderer = value.videoRenderer || value.gridVideoRenderer || value.compactVideoRenderer;
    if (renderer?.videoId && !seen.has(renderer.videoId) && textOf(renderer.title)) {
      seen.add(renderer.videoId);
      const thumbnails = renderer.thumbnail?.thumbnails || [];
      found.push({ id: renderer.videoId, title: textOf(renderer.title), label: textOf(renderer.publishedTimeText) || '最新影片', description: textOf(renderer.descriptionSnippet) || 'Watch on YouTube', thumbnail: thumbnails.at(-1)?.url });
    }
    Object.values(value).forEach(visit);
  };
  if (!found.length && raw) visit(JSON.parse(raw));
  if (!found.length) throw new Error('No YouTube videos found');
  return found.map((video) => `<a class="video-card reveal" href="https://www.youtube.com/watch?v=${escapeHtml(video.id)}" target="_blank" rel="noopener"><div class="video-thumb purple"><img src="${escapeHtml(video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`)}" alt="" loading="lazy"><i>▶</i><small>${escapeHtml(video.label)}</small></div><h3>${escapeHtml(video.title)}</h3><p>${escapeHtml(video.description)}</p></a>`).join('');
}

export async function getLatestMarkup() {
  const [podcasts, videos] = await Promise.allSettled([podcastMarkup(), videoMarkup()]);
  return {
    podcasts: podcasts.status === 'fulfilled' ? podcasts.value : '',
    videos: videos.status === 'fulfilled' ? videos.value : ''
  };
}
