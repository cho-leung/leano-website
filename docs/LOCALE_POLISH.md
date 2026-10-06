# Leano v0.1.1 locale polish

This pass adjusts the existing five locales within one shared HTML structure. Sections, palette, decorative blocks, RFQ architecture, service scope and commercial positioning remain unchanged. The comparison baseline is production commit `a1d1892b998f564b2190a8d888735e23005bfce1`.

| Locale | Direction |
| --- | --- |
| zh-CN | Dedicated Simplified Chinese sans stack across the page; sans, upright terracotta hero emphasis; near-zero tracking, more line height, mixed-script labels without forced uppercase; natural procurement-support wording instead of 采购服务台 |
| fr | Smaller, wider editorial type with balanced hero wrapping; professional sourcing/approvisionnement vocabulary; shorter capability headings and form microcopy; Latin serif-italic emphasis retained |
| es | Independent sizing and heading rhythm; concise solicitud CTA and clear RFQ labels; balanced hero wrapping with emphasis on complejas; Latin serif-italic emphasis retained |
| ru | System/sans stack with native Cyrillic support, upright accent emphasis, more open tracking and line height; shorter natural headings and place-of-delivery label; narrow-screen sizing protects long words |
| en | Existing copy and serif-italic emphasis preserved; only a nonbreaking hero hyphen, balanced wrapping and a small mobile size adjustment prevent splitting cross-border |

French and Spanish hero line breaks follow balanced natural text instead of the English forced breaks. Chinese keeps its three semantic hero phrases; narrow screens balance the first phrase into natural Chinese groups. Capability/process/audience/principle/RFQ typography is scoped per locale. At 1024px the localized form uses a single column to keep labels and placeholders comfortable; the same native form fields and transport remain.

## Verification

Static/syntax and i18n checks, the existing 45-state responsive/behavior suite, and a new 20-state art-direction suite are used for this release. Required widths: 1440, 1024, 768 and 390px for EN, ZH, FR, RU and ES. Screenshots cover header, language controls, hero and decorative blocks, requirement strip, all H2s, capability rows, process, audience, principle, form and footer. Live verification uses the same suite against Pages and compares all three hosted browser assets with local SHA-256 hashes.

The art-direction check measures overflow, neighbouring grid overlap, accidental word splitting, actual font usage and Chinese/English/Russian emphasis styles. The existing browser suite also covers localization, URL/storage preferences, clipboard feedback, keyboard focus, motion, validation and intercepted form transport. Font readiness and two animation frames precede geometry measurements so locale font changes and balanced wrapping have settled.

RFQ frontend smoke requests use synthetic `.invalid` addresses and are intercepted before production transmission. This pass creates **zero production RFQ fixtures**, Sheet rows or Gmail notifications. The previous production technical gate is historical evidence; it is not rerun or replaced here.

Scope comparison confirms the central endpoint, form structure and page logic outside translation strings are unchanged. Both Apps Script source and manifest are byte-identical to the baseline. No Google configuration, schema, Gmail or deployment change is included.

Raw screenshots and reports are ignored under `audit-artifacts/locale-v0.1.1/`. Execution results and the final live deployment status accompany the release commit in the completion report. Tests run in Chrome on macOS with viewport emulation; system fonts may vary on Windows/Linux, and Safari/Firefox/physical-device rendering and independent native-speaker review are not certified by these checks.
