# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Static HTML/CSS/JS skin files for **오트모브 (OAT MAUVE)**, a fashion shop hosted on **카페24 (Cafe24)**,
a Korean e-commerce SaaS platform. There is no build system, package manager, or test suite — files are
edited directly and pasted into the Cafe24 admin "스마트디자인" (Smart Design) HTML editor. The target skin
is **아이베이스 반응형 (Ibase Responsive)**.

Read `README-적용방법.md` first — it is the authoritative deployment/integration guide (in Korean) and
documents pitfalls discovered by trial and error in the live admin editor. This CLAUDE.md summarizes the
parts relevant to writing/editing code; the README has the full detail and should be kept in sync when
Cafe24-specific behavior changes.

## No commands

There is no build, lint, or test tooling. "Testing" a change means pasting the file into the Cafe24 design
editor (or a copied skin, never the live one) and checking the storefront preview.

## File → Cafe24 upload map

| Local file | Cafe24 destination | Role |
|---|---|---|
| `layout.html` | `/layout/basic/main.html` | Main-page layout: marquee, util bar, header, drawer, footer |
| `index.html` | `/main/index.html` | Main page body (hero, new arrivals, weekly best, instagram) |
| `otmove-main.css` | `/layout/basic/css/otmove-main.css` | All styles |
| `otmove-main.js` | `/layout/basic/otmove-main.js` | Drawer, header scroll state, hero slider, product slider, filter tabs |
| `auth.html` | `/layout/basic/auth.html` | Layout for login/signup screens (CSS embedded inline) |
| `login.html` | `/member/login.html` | Login page body, wired to Cafe24's `member_login` module |
| `kakao-callback.html`, `naver-callback.html` | OAuth redirect URIs for Kakao/Naver social login | Stash the `code` in `localStorage` and bounce to `/member/login.html` |
| `naver-pay.html` | standalone info page | Static NaverPay explainer, no module dependency |
| `_backup_layout-basic-STOCK.html` | — | Stock/rollback copy of `/layout/basic/layout.html`; restore by pasting this back if the sub-page layout breaks |

There are two more layout files that exist only on the Cafe24 side (not as local files here, per the
README): `/layout/basic/layout.html` (`body#sub`, used by category/cart/order/board/mypage pages) and
`/layout/basic/detail_layout.html` (`body#detail`, product detail page). Both follow the same
crome-then-`<!--@contents-->`-then-footer structure as `layout.html` in this repo.

## Architecture: layout vs. page

Cafe24 templates use a two-file composition model:

- A **page file** starts with `<!--@layout(/path/to/layout.html)-->` on its first line and contains only
  the content that goes inside `<!--@contents-->`.
- A **layout file** contains the chrome (header/footer/nav) and the literal marker `<!--@contents-->`
  where the page body gets injected. Never delete that marker. `{$layout_contents}` does **not** work in
  this skin — only `<!--@contents-->` does.
- CSS/JS are linked via `<!--@css(...)-->` / `<!--@js(...)-->` comments, not `<link>`/`<script>` tags —
  Cafe24 bundles resources through `optimizer_user.php`. A path that's even one character off from the
  actual upload location fails silently (no error, no console warning) — if the drawer/hero/filter tabs
  stop working after an edit, check the `@js` path first.

Two layout families exist for two visual tones:
- **Main chrome** (`layout.html` here → `/layout/basic/main.html`, `/layout/basic/layout.html`,
  `/layout/basic/detail_layout.html`): marquee + util bar + header + drawer + footer.
- **Auth chrome** (`auth.html`): full-screen split login/signup layout, no marquee/header/footer. Used by
  `login.html`, `agreement.html`, `join.html`, `join_result.html`.

## Cafe24 templating conventions that constrain markup

These are hard platform rules, not style choices — violating them breaks the page silently or partially:

- **Product list modules** (`product_listmain_1`, `product_listmain_2` in `index.html`) require the
  repeating unit to be an `<li id="anchorBoxId_{$product_no}">` inside a `<ul>`. Using `<div class="card">`
  instead makes Cafe24 unable to find the repeat region, so it repeats the *entire module*. The `<li>` must
  also be duplicated several times in source (not left as a single copy) for Cafe24 to recognize it as a
  repeating block; actual rendered count follows `$count` and how many products are shelved.
- `{$link_product_detail}` is a URL string — wrap it as `<a href="{$link_product_detail}">`. Writing
  `{$link_product_detail}...{$/link_product_detail}` prints the URL as literal text instead of linking.
- `{$product_name}` renders pre-wrapped in a `<span>`; don't put it inside an `alt=""` attribute (it will
  break the tag). Use `{$seo_alt_tag}` for image alt text instead.
- Which module code maps to which Cafe24 "메인분류" (main display category) is configured in
  관리자 > 상품 > 상품 진열 > 메인 진열 > [메인분류 관리], not in the HTML. Currently
  `product_listmain_1` = 추천상품, `product_listmain_2` = 신상품. A display with no products shelved in it
  renders as an empty section, not an error.
- **Login form**: `{$form.member_id}` / `{$form.member_passwd}` render the actual `<input>` elements —
  writing your own `<input>` breaks login. Style via CSS only. Submit via
  `<a onclick="{$action_func_login}">`, which calls `MemberAction.login(...)` →
  `/exec/front/Member/login/`. The `<!--@css(/css/module/member/login.css)-->` and
  `<!--@js(/js/module/member/login.js)-->` lines inside the module block are required.
- `{$display_naver|display}` / `{$display_kakao|display}` auto-add a `.displaynone` class when that SNS
  login isn't configured in 관리자 > 회원 > SNS(간편) 로그인 설정 — the buttons (and their OR divider,
  handled via a `:has()` CSS rule in `auth.html`) disappear on their own; no JS toggle needed.
- Signup flow (`agreement.html` → `join.html` → `join_result.html`, not present as local files) keeps
  Cafe24's own markup and validation logic untouched — only CSS was layered on. Do not rewrite that
  markup; the join form's dedup-check/identity-verification/address-search JS depends on it exactly as
  Cafe24 generates it.
- CSS specificity gotcha used in both `auth.html` and sub-page layouts: `body#auth a{color:inherit}` (and
  the analogous sub-page rule) overrides button text color. Button colors must be re-declared at the same
  specificity, e.g. `body#auth .btn-*{color:...}` — ordering matters, don't move these rules earlier.

## Hero banner

`index.html`'s hero is 5 `.hero-slide` slots, image filenames fixed as `hero_01.jpg`…`hero_05.jpg`.
Swapping/adding/removing banners is done by uploading/deleting same-named files in Cafe24's file uploader —
no HTML change needed. `otmove-main.js`'s `heroNodes()` auto-excludes slide slots whose image didn't load,
so the slide count/indicator adapts automatically; it prefers the new `.hero-slide` structure but falls
back to an older `.hero-media img` structure if present. `otmove-main.css` has a legacy
`.hero-media img{opacity:0}` rule still in place, overridden by `.hero-media .hero-slide img{opacity:1}` —
don't remove that override or the hero goes invisible.

## Social login callback flow

`kakao-callback.html` / `naver-callback.html` are OAuth redirect targets: they pull `code` (and `state` for
Naver) off the query string, stash them in `localStorage` (`kakao_login_code`/`kakao_login_status`,
`naver_login_code`/`naver_login_state`/`naver_login_status`), then redirect to `/member/login.html`, which
is expected to pick the pending code up from `localStorage`.

## Sub-page layout notes (layout.html / detail_layout.html, Cafe24-side only)

- `header-scrolled` class is applied unconditionally on sub-pages (no hero to trigger the scroll-based class
  toggle in `otmove-main.js`); removing it makes the header transparent against the ivory background.
- Signup entry point must be `/member/agreement.html`, not `/member/join.html` — linking straight to
  `join.html` skips the terms-agreement step. This link appears twice per layout file (util bar + drawer)
  across `main.html`, `layout.html`, `detail_layout.html`.
- Logo links are `/index.html` everywhere (not `#top`) since sub-pages have no `#top` hero anchor.
- Cafe24 admin caches aggressively, especially category pages — use 관리자 상단 `사이트캐시 삭제` after
  changes that don't seem to take effect.

## Category numbers

`?cate_no=` values used throughout the nav/drawer are shop-specific and already filled in: TOPS=25,
OUTWEAR=24, BOTTOM=27, DRESS=26, SHOES=42, ACC=28. Sub-menu items (T-Shirts, 플랫, etc.) currently all point
at their parent category's `cate_no` because no child categories exist yet in the shop — update them
individually once child categories are created. `NEW-5%` and `26SS SALE` are placeholders at `cate_no=00`
(4 occurrences: header + drawer) pending a dedicated 기획전/분류.
