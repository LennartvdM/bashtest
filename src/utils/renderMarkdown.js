import { getPageBySlug } from '../data/toolboxPages';

/**
 * Render markdown text to HTML with link handling.
 *
 * - [label](/Toolbox-{slug}) or [label](./Toolbox-{slug}) -> opens GitBook page directly (new tab)
 * - [label](https://docs.neoflix.care/...) -> opens GitBook page directly (new tab)
 * - [label](mailto:...) -> email link (no target blank)
 * - All other URLs -> external link (target="_blank")
 * - **bold** and *italic* supported
 * - \n -> <br/>
 */
export function renderMarkdown(text) {
  if (!text) return '';

  return text
    .replace(/\n/g, '<br/>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      // Check for internal Toolbox route patterns: /Toolbox-{slug} or ./Toolbox-{slug} or ./Toolbox_{slug}
      // Resolve to the actual GitBook URL and open directly in a new tab
      const toolboxRouteMatch = url.match(/^\.?\/Toolbox[-_](.+)$/);
      if (toolboxRouteMatch) {
        const slug = toolboxRouteMatch[1].replace(/_/g, '-');
        const page = getPageBySlug(slug);
        const href = page ? page.url : `https://docs.neoflix.care`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
      }

      // docs.neoflix.care URLs — open directly in a new tab
      if (/docs\.neoflix\.care/i.test(url)) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
      }

      // mailto links — no target blank
      if (url.startsWith('mailto:')) {
        return `<a href="${url}" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
      }

      // External link
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
    });
}
