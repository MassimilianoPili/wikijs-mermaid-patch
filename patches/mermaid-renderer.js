/**
 * Mermaid v10 server-side preprocessor for WikiJS v2.
 *
 * Replaces the bundled html-mermaid renderer. Instead of rendering diagrams
 * server-side with Mermaid 8.8.2, it wraps code blocks in a <div class="mermaid-v10">
 * with the source stored in a data-code attribute. The companion page-view-patch.pug
 * template picks these up and renders them client-side using Mermaid v10 from CDN.
 *
 * The original <pre> markup is preserved inside the div as a no-JS fallback.
 */
module.exports = {
  init ($, config) {
    $('pre.prismjs > code.language-mermaid').each((i, elm) => {
      const raw = $(elm).text()
      const escaped = $(elm).html()
      $(elm).parent().replaceWith(
        `<div class="mermaid-v10" data-code="${encodeURIComponent(raw)}"><pre>${escaped}</pre></div>`
      )
    })
  }
}
