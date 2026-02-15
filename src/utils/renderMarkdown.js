import toolboxPages from '../data/toolboxPages';

/**
 * Render markdown text to HTML with link handling.
 *
 * Toolbox link patterns (all resolve to internal /toolbox/{slug} routes):
 * - [label](/Toolbox-{slug})          — legacy format in content data
 * - [label](./Toolbox-{slug})         — legacy relative format
 * - [label](/toolbox/{slug})           — new canonical format
 * - [label](https://docs.neoflix.care/...) — GitBook URL, resolved via registry
 *
 * Other links:
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
      // Legacy format: /Toolbox-{slug} or ./Toolbox-{slug} or ./Toolbox_{slug}
      const legacyMatch = url.match(/^\.?\/Toolbox[-_](.+)$/);
      if (legacyMatch) {
        const slug = legacyMatch[1].replace(/_/g, '-');
        return `<a href="/toolbox/${slug}" data-internal="true" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
      }

      // New format: /toolbox/{slug}
      const newMatch = url.match(/^\/toolbox\/(.+)$/);
      if (newMatch) {
        return `<a href="${url}" data-internal="true" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
      }

      // GitBook docs URLs — resolve to internal toolbox route if possible
      if (/docs\.neoflix\.care/i.test(url)) {
        const matched = findSlugFromGitBookUrl(url);
        if (matched) {
          return `<a href="/toolbox/${matched.slug}" data-internal="true" style="color:#0ea5e9;text-decoration:underline">${label}</a>`;
        }
        // Fallback: open externally if no matching slug found
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

/**
 * Try to find a matching slug in the toolboxPages registry from a GitBook URL.
 * Compares the URL path against registry entries.
 */
function findSlugFromGitBookUrl(url) {
  const normalized = url.replace(/\/+$/, '').toLowerCase();

  for (const page of toolboxPages) {
    const pageUrl = page.url.replace(/\/+$/, '').toLowerCase();
    if (normalized === pageUrl) {
      return page;
    }
    // Also match if the path portion matches
    const pagePath = pageUrl.replace('https://docs.neoflix.care', '');
    if (pagePath && normalized.endsWith(pagePath)) {
      return page;
    }
  }

  return null;
}
