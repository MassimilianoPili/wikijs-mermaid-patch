# WikiJS Mermaid v10 Patch

Upgrade [Wiki.js](https://js.wiki) v2 from **Mermaid 8.8.2** (bundled, Dec 2020) to **Mermaid 10.9.3** using client-side rendering via CDN. No build changes, no dependency modifications — just three files mounted as Docker volumes.

## The Problem

Wiki.js v2 bundles Mermaid 8.8.2, which is over 5 years old and missing many features:

| Feature | Mermaid 8.8.2 | With this patch (v10) |
|---------|:---:|:---:|
| `flowchart` directive | - | + |
| Bidirectional arrows `<-->` | - | + |
| Ampersand chaining `A --> B & C` | - | + |
| Mindmaps | - | + |
| Timeline diagrams | - | + |
| Sankey diagrams | - | + |
| Block diagrams | - | + |

A simple `npm update` is impossible because Mermaid 9+ is ESM-only while Wiki.js v2 uses Webpack 4 with CommonJS. The maintainer [explicitly confirmed this](https://github.com/requarks/wiki/pull/7714) — upgrading Mermaid would require rebuilding the entire build pipeline.

## How It Works

Instead of fighting the build system, this patch takes a different approach:

1. **Server-side** (`mermaid-renderer.js`): Intercepts Mermaid code blocks and wraps them in `<div class="mermaid-v10">` elements with the source code stored in a `data-code` attribute. The original code is preserved inside a `<pre>` tag as a no-JavaScript fallback.

2. **Client-side** (`page-view-patch.pug`): Loads Mermaid v10.9.3 from jsDelivr CDN and renders all `.mermaid-v10` elements. A `MutationObserver` handles Wiki.js's Vue.js SPA navigation, automatically rendering new diagrams when navigating between pages.

3. **YAML fix** (`page-helper-patch.js`): Independently fixes a [git sync bug](https://github.com/requarks/wiki/discussions/6818) where page titles containing `:`, `"`, `#`, or `'` produce invalid YAML frontmatter, breaking round-trip export/import.

## Installation

### With `docker-compose.override.yml` (recommended)

1. Clone this repository next to your Wiki.js `docker-compose.yml`:

```bash
git clone https://github.com/massimilianopili/wikijs-mermaid-patch.git
```

2. Copy the override file:

```bash
cp wikijs-mermaid-patch/docker-compose.override.yml .
```

3. Adjust the paths in `docker-compose.override.yml` if your directory layout differs:

```yaml
services:
  wiki:
    volumes:
      - ./wikijs-mermaid-patch/patches/page-helper-patch.js:/wiki/server/helpers/page.js:ro
      - ./wikijs-mermaid-patch/patches/mermaid-renderer.js:/wiki/server/modules/rendering/html-mermaid/renderer.js:ro
      - ./wikijs-mermaid-patch/patches/page-view-patch.pug:/wiki/server/views/page.pug:ro
```

4. Restart Wiki.js:

```bash
docker compose up -d
```

### Manual volume mounts

Add these three lines to the `volumes` section of your Wiki.js service in `docker-compose.yml`:

```yaml
- ./patches/page-helper-patch.js:/wiki/server/helpers/page.js:ro
- ./patches/mermaid-renderer.js:/wiki/server/modules/rendering/html-mermaid/renderer.js:ro
- ./patches/page-view-patch.pug:/wiki/server/views/page.pug:ro
```

## Applying only specific patches

Each patch is independent. You can mount only the ones you need:

| Patch | File | What it does |
|-------|------|-------------|
| Mermaid v10 renderer | `mermaid-renderer.js` + `page-view-patch.pug` | Upgrades Mermaid to v10 (both files required) |
| YAML frontmatter fix | `page-helper-patch.js` | Fixes git sync with special characters in titles |

## Compatibility

- Tested with `ghcr.io/requarks/wiki:2` (v2.5.x)
- Requires internet access to load Mermaid from jsDelivr CDN
- If the CDN is unreachable, diagrams gracefully degrade to showing the raw source code

## Caveats

- **Bind-mount override**: These patches replace files inside the container. After upgrading the Wiki.js Docker image, verify the target files haven't changed significantly. The patched files are based on Wiki.js v2.5.x.
- **CDN dependency**: Mermaid is loaded from `cdn.jsdelivr.net`. For air-gapped environments, you can self-host the Mermaid JS file and update the CDN URL in `page-view-patch.pug`.
- **Mermaid version**: Pinned to `10.9.3`. To use a different version, edit the `script(src=...)` line in `page-view-patch.pug`.

## Examples

See the [examples/](examples/) directory for Mermaid diagrams that work with this patch but fail on vanilla Wiki.js v2.

## License

MIT
