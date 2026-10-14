# Refactor Test Report

Date: 2026-10-14 · Baseline: commit `e102c99` · Nothing committed, pushed or uploaded to Shopify.

**Important:** no live Shopify store or `shopify theme dev` session was used. Every check below is either **static** or a **local browser harness** (described below). Nothing was tested inside Shopify.

## 1. Files

| Status | File | Purpose |
|---|---|---|
| Added | `blocks/faq-accordion.liquid` | Native FAQ theme block. Schema is byte-identical to the old block, so every setting ID, type, range and default is unchanged. |
| Added | `assets/component-faq-accordion.css` | Static FAQ styles. Per-instance values come from CSS custom properties. |
| Added | `assets/faq-accordion.js` | `<faq-accordion>` custom element, defined once, using event delegation. |
| Removed | `blocks/ai_gen_block_d283036.liquid` | Replaced by the three files above. Removed only after confirming zero references. |
| Modified | `templates/collection.ready-to-ship.json` | Block key `ai_gen_block_d283036_AKrGyn` → `faq_accordion_AKrGyn`, type → `faq-accordion`, `mailto:` added to the Q3 email link, orphaned `desktop_width_percent` removed. |
| Modified | `snippets/line-item.liquid` | `assign = line_item_index = …` → `assign line_item_index = …` (Liquid syntax fix, same runtime value). |
| Modified | `sections/main-cart.liquid` | Removed a dead "line item properties" block placed outside the items loop (`line_item` undefined there, so it always rendered nothing). |
| Added | `REFACTOR_AUDIT.md`, `REFACTOR_TEST_REPORT.md` | Reports |

## 2. Generated-block migration map

| Old | New | Settings mapping |
|---|---|---|
| `blocks/ai_gen_block_d283036.liquid` | `blocks/faq-accordion.liquid` | 1:1. All 41 IDs are identical. |
| Template block `ai_gen_block_d283036_AKrGyn` (in section `176769167824c721a8`, type `_blocks`) | `faq_accordion_AKrGyn` | All values copied unchanged, except `answer_3` (link `href` added) and `desktop_width_percent` (dropped: no schema setting, never rendered). |
| Inline `{% style %}` with `.ai-faq-*-<id>` classes | `.faq-accordion__*` BEM classes + `--faq-*` custom properties | Same property values and the same specificity (one class). |
| Inline `<script>` defining `FaqAccordion<id>` for each block | One `FaqAccordion` class, guarded by `customElements.get` | Same open/close and `allow_multiple` semantics. |

## 3. Tests performed

| # | Test | Method | Result |
|---|---|---|---|
| 1 | Theme Check before and after | `shopify theme check --output json` | **PASS:** 130 → 127 offenses. The `LiquidSyntaxError` and 2 `UndefinedObject` are fixed. No offenses in the new files. |
| 2 | All 43 JSON files parse (templates, section groups, config, locales) | Node `JSON.parse` | **PASS** (0 invalid) |
| 3 | Every template/group section type and `_blocks` block type resolves to a file, and every `order` entry exists | Node script | **PASS** (0 missing) |
| 4 | Stored FAQ settings vs the new schema | Node diff of the old and new template | **PASS:** only `answer_3` and `desktop_width_percent` changed (intended). 0 unknown setting IDs. Section order unchanged. All other sections byte-identical. |
| 5 | Schema unchanged | `diff` of the schema blocks | **PASS** (identical) |
| 6 | `faq-accordion.js` syntax | `node --check` | **PASS** |
| 7 | 10 questions render in their original order | Browser harness | **PASS** |
| 8 | Single-open mode (stored `allow_multiple: false`): opening one closes others, and clicking again closes it | Browser harness | **PASS** |
| 9 | `allow_multiple: true` instance keeps several items open | Browser harness | **PASS** |
| 10 | Two instances on one page work independently, with unique IDs and the script loaded twice without errors | Browser harness | **PASS** |
| 11 | Long answer (~1,900px tall) fully expanded, not clipped | Browser harness (panel height = content height) | **PASS** (the old block clipped at 500px) |
| 12 | `type="button"`, `aria-expanded`, `aria-controls` → panel with `role="region"` + `aria-labelledby`. Collapsed panels are `visibility: hidden` (out of the tab order) | Browser harness | **PASS** |
| 13 | Keyboard: Enter/Space (native button), ArrowUp/ArrowDown/Home/End move focus | Browser harness | **PASS** |
| 14 | Desktop computed styles match the stored settings (dark `#111111` question bar, white text, 16px/600, 18px padding, centered 32px heading, `#e6e2e1` 8px border, 18px open answer padding) | Browser harness | **PASS** |
| 15 | Mobile (≤749px): heading 25.6px, question 14.4px with 14.4px padding, answer 12.6px with 14.4px padding (the same ratios as the original), no horizontal scroll | Browser harness at 375px | **PASS** |
| 16 | Q3 email link is `mailto:support@crownmoissanite.com` (address taken from the existing `templates/product.json` contact button) | Browser harness | **PASS** |
| 17 | `ai_gen_block_` search | `grep -rn ai_gen_block_` | **PASS:** remaining occurrences are only in `REFACTOR_AUDIT.md` and this report (documentation) |

**About the harness:** a Node script rendered `blocks/faq-accordion.liquid` with the real stored Ready To Ship settings. It loaded the real CSS and JS (the script twice) and served them on localhost, where the page was driven in the built-in browser. It does not include the theme's global CSS (fonts, base styles), so it proves behavior and setting-driven styles, **not** pixel parity with the live page.

## 4. Theme Check

| Check | Before | After |
|---|---|---|
| LiquidSyntaxError | 1 | 0 |
| UndefinedObject | 4 | 2 (vendor: `store-locator` JS template literal, `hero-banner` loop variable; false positives) |
| ParserBlockingScript | 2 | 2 (`meta-tags.liquid`, see known issue 1) |
| RemoteAsset / AssetPreload | 5 / 2 | 5 / 2 (same) |
| UnusedAssign | 9 | 9 (vendor, harmless) |
| OrphanedSnippet | 107 | 107. Theme Check flags every snippet in this CLI version, which is a false positive. A manual trace finds 15 truly unreferenced vendor snippets (listed in the audit §5), which were kept on purpose. |

## 5. Intentional visible changes

1. Long FAQ answers now expand to their full height. Previously anything beyond 500px was cut off.
2. The Q3 email address is now a clickable link. It was previously a link with no `href`.
3. Expand/collapse animates height with a grid-row transition instead of `max-height`. The duration (0.3s) and easing are the same. Users with `prefers-reduced-motion` get no animation.

Everything else (colors, sizes, spacing, borders, icon rotation, hover) uses the same values.

## 6. Known issues (not changed; need an owner decision)

1. **`snippets/meta-tags.liquid:43-77`:** an invisible full-viewport "🔄" element, two parser-blocking scripts loaded from **another store's file CDN** (`cdn.shopify.com/s/files/1/0693/0287/8457/files/preload_asset.js` and `global-script.js`), and an anti-flicker snippet with a placeholder `GTM-XXXXXX`. This matches the pattern of "PageSpeed booster" scripts that change how pages load for Lighthouse. Their contents are outside the repository and can change at any time. Recommendation: confirm who installed them and whether they are still needed. Removing them likely *improves* real-world load time, but it was not done without your approval.
2. `sections/custom-countdown-timer.liquid` duplicates about 95% of the vendor `countdown-timer`. Consolidating it requires migrating its `datetime` text setting in 4 templates. Deferred.
3. 15 unreferenced vendor snippets (audit §5) are kept to ease future Sahara updates.
4. Vendor sections still use setting-driven `{% style %}` blocks. This is the theme's intended architecture and was left as is.

## 7. Manual tests still required (on a preview/unpublished theme)

- [ ] `/collections/ready-to-ship`: the FAQ renders, looks the same as the live site, opens and closes, and the Q3 email link opens a mail client.
- [ ] Theme editor: select the FAQ block, edit a question and the colors, toggle "Allow multiple open", and confirm the controls still appear under the same labels.
- [ ] Cart page and cart drawer: change quantity, remove a line, and confirm line-item properties (ring size and engraving) still show. This covers the `line-item.liquid` and `main-cart.liquid` edits.
- [ ] Spot check: the homepage, other collections, product pages (variants, add to cart), search, header and footer. These were not modified, but they should be checked before publishing.

Suggested command: `shopify theme push --unpublished` (or `shopify theme dev`), run by you, then check the preview.
