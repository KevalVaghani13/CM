# Refactor Audit — Crown Moissanite Shopify Theme

Audit date: 2026-10-14 · Baseline commit: `e102c99` (working tree clean before any change)

## 1. Existing architecture

| Area | Contents | Notes |
|---|---|---|
| Theme | **Sahara 1.2.10** (vendor theme, `config/settings_schema.json`) | The theme is a commercial OS 2.0 theme, not an AI-generated codebase. |
| `layout/` | `theme.liquid`, `password.liquid` | |
| `sections/` | 61 `.liquid` + 3 groups (`header-group`, `footer-group`, `overlay-group`) | Vendor sections plus a few store-specific ones (see §4). |
| `blocks/` | 1 file: `ai_gen_block_d283036.liquid` | The only theme block, and the only AI-generated file. |
| `snippets/` | 107 | |
| `assets/` | 131 (`component-*.css`, `section-*.css`, per-feature JS) | Convention: `component-<name>.css`, `<feature>.js` with custom elements. |
| `templates/` | 22 JSON + 3 Liquid (+ `customers/`) | |
| `locales/` | 10 files | |

Sahara's convention is: section-level `{% style %}` blocks that turn merchant settings into scoped CSS, static CSS in `assets/`, and behavior in custom elements under `assets/*.js`. Those per-section `{% style %}` blocks are **intentional, setting-driven CSS**. They are not stray inline code, so they are kept.

## 2. `ai_gen_block_` occurrences (full repository search)

| File | Occurrence | Classification |
|---|---|---|
| `blocks/ai_gen_block_d283036.liquid` | The file itself | **Active block implementation** |
| `templates/collection.ready-to-ship.json` | Block key `ai_gen_block_d283036_AKrGyn`, `"type": "ai_gen_block_d283036"`, `block_order` entry | **Active reference from a JSON template** (inside a `_blocks` section, id `176769167824c721a8`) |
| Section groups / config / other templates | none | — |
| Docs / comments | none | — |

### `ai_gen_block_d283036`: FAQ accordion

- **Appearance:** centered H2 heading, followed by up to 10 bordered, rounded items. Each item has a full-width question button with a chevron that rotates 180° when open, and an answer panel below.
- **Behavior:** a click toggles the `active` class. When `allow_multiple` is false, the other items close. The script updates `aria-expanded`.
- **Settings:** 41 IDs (`heading*`, `question_1..10`, `answer_1..10`, style colors and sizes, `allow_multiple`). Mobile (≤749px) scales the heading by 0.8×, the question by 0.9× in size and 0.8× in padding, the answer by 0.9× in size and 0.8× in padding.
- **Used by:** only `templates/collection.ready-to-ship.json`.
- **Stored content:** 10 Ready To Ship–specific Q&As with custom colors (dark question bar `#111111` and white text/icon).

**Defects found:**
1. The open answer uses `max-height: 500px`, so long answers get **clipped**.
2. A new uniquely named custom element class and `customElements.define` are emitted **per block instance**. CSS and JS are inline and duplicated for every instance.
3. The buttons have no `type="button"`, `aria-controls` or `id`. The panels have no region role or label. Collapsed answers stay in the accessibility tree.
4. The Q3 answer contains `<a><strong>support@crownmoissanite.com</strong></a>`, a link **without `href`** (not clickable). The address is confirmed as the store's support address by `templates/product.json` (`"button_url": "mailto:support@crownmoissanite.com"`).
5. The stored setting `desktop_width_percent: 100` has no matching schema setting (orphaned value, never rendered).

**Migration decision:** create the native theme block `blocks/faq-accordion.liquid`. It keeps **identical setting IDs, types, ranges and defaults**, so every stored value maps 1:1 without conversion. Static CSS goes to `assets/component-faq-accordion.css` (per-instance values passed as CSS custom properties). Behavior goes to `assets/faq-accordion.js`, a single `<faq-accordion>` custom element that is defined once. The vendor `accordions` section was considered and rejected because its design differs, which would be a visual change.

## 3. Theme Check baseline (`shopify theme check`, CLI 4.9.3)

130 offenses: 107 `OrphanedSnippet`, 9 `UnusedAssign`, 1 `LiquidSyntaxError`, 2 `ParserBlockingScript`, 2 `AssetPreload`, 5 `RemoteAsset`, 4 `UndefinedObject`.

- **`OrphanedSnippet` ×107 is a false positive for 92 snippets.** Theme Check flags every snippet. A manual trace of `render`/`include` across layout, sections, snippets, blocks and templates shows only 15 snippets with no reference (§5).
- **`LiquidSyntaxError` in `snippets/line-item.liquid:11`:** `assign = line_item_index = …`. Shopify's lax parser matches `assign` with an unanchored regex, so this works in production today, but it is invalid Liquid. This value drives `/cart/change.js` line numbers through `assets/cart.js`. The fix is a pure lint correction with no semantic change.
- **`UndefinedObject line_item` in `sections/main-cart.liquid:37-39`:** a pasted "line item properties" block sits **outside** the cart items loop. `line_item` is undefined there, so it always renders nothing. `snippets/line-item.liquid:45` already renders properties. This is dead code.
- The remaining findings are in vendor code and harmless (unused assigns, the `store-locator` template-literal variable, the `hero-banner` loop variable).

## 4. Store-specific and risky code

| Item | Finding | Decision |
|---|---|---|
| `snippets/meta-tags.liquid:43-77` | An invisible 190vw `#fv-loading-icon` element, plus `preload_asset.js` and `global-script.js` loaded parser-blocking from **another store's CDN path** (`/files/1/0693/0287/8457/`), plus an "async-hide" snippet configured with a placeholder `GTM-XXXXXX`. This is the pattern used by "PageSpeed score booster" scripts, which alter how pages load for Lighthouse. | **Not modified.** It is third-party code with unknown dependencies. **Flagged for the owner to review** (see the test report). |
| `sections/custom-countdown-timer.liquid` | A variant of the vendor `countdown-timer` with a `datetime` text setting and color overrides. Used in `index`, `collection`, `product`, `product.ready-to-ship`. | Kept. Consolidating it requires a text→numeric setting migration across 4 live templates and timer verification. Documented as a future candidate. |
| `sections/custom-promise-marquee.liquid` | Custom section with a self-contained `<style>`. Used on product templates. | Kept. It works and is scoped by `#shopify-section-{{ section.id }}`. |
| `snippets/product-ring-size-engraving.liquid` | Business logic (ring size/engraving line-item properties). | Kept unchanged. Checkout-critical. |
| `templates/product.json` `custom_liquid` | Delivery-date estimator. | Kept. Merchant content. |
| `snippets/meta-tags`, `store-locator` remote assets | External integrations. | Kept. |

## 5. Unreferenced snippets (manual trace)

`icon-arrow-left`, `icon-arrow-right-small`, `icon-arrow-right`, `icon-before-and-after-slider`, `icon-chevron-left`, `icon-chevron-right`, `icon-header`, `icon-heart`, `icon-pin-location`, `icon-play`, `icon-video-mute`, `icon-video-pause`, `icon-video-play`, `icon-video-unmute`, `product-modal-media`. None of them appear in any Liquid, JSON (including `custom_liquid` settings) or JS file.

Decision: **kept**. They are unmodified Sahara vendor files. Deleting them gains nothing at runtime (unrendered snippets cost nothing) and makes future Sahara updates harder to diff. They are listed here so they can be removed deliberately later.

## 6. Planned changes

| # | Change | Files |
|---|---|---|
| 1 | Replace the AI FAQ block with a native theme block (same settings) | + `blocks/faq-accordion.liquid`, + `assets/component-faq-accordion.css`, + `assets/faq-accordion.js`, − `blocks/ai_gen_block_d283036.liquid` |
| 2 | Migrate the template reference, preserving all 10 Q&As and all values. Fix the `mailto:` link. Drop the orphaned `desktop_width_percent`. | `templates/collection.ready-to-ship.json` |
| 3 | Fix the invalid `assign` syntax (no behavior change) | `snippets/line-item.liquid` |
| 4 | Remove the dead line-item properties block outside the loop | `sections/main-cart.liquid` |

Out of scope by design: a wholesale rewrite of vendor sections' setting-driven `{% style %}` blocks. That would be a large visual-regression risk with no functional gain, and it can't be verified without a live store.
