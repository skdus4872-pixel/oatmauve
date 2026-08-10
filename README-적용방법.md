# 오트모브 메인 페이지 → 카페24 적용 가이드

원본 `otmove-main.html` 한 파일을 카페24 스마트디자인 구조에 맞게 4개로 쪼갰습니다.

| 파일 | 올릴 위치 | 역할 |
|---|---|---|
| `layout.html` | `/layout/basic/main.html` | 마퀴·유틸바·헤더·드로어·푸터 (메인 화면 레이아웃) |
| `index.html` | `/main/index.html` | 메인 본문 (히어로·신상품·위클리베스트·인스타) |
| `otmove-main.css` | `/layout/basic/css/otmove-main.css` | 전체 스타일 |
| `otmove-main.js` | `/layout/basic/otmove-main.js` | 드로어·헤더전환·히어로슬라이드·상품슬라이더·필터탭 |
| `auth.html` | `/layout/basic/auth.html` | 로그인·회원가입 전용 레이아웃 (CSS 내장) |
| `login.html` | `/member/login.html` | 로그인 페이지 (카페24 `member_login` 모듈 연동) |
| `images/` 4개 | 스킨 이미지 폴더 | 로고 1장, 히어로 사진 3장 |

> 레이아웃 파일명은 스킨이 쓰는 이름에 맞추세요. **아이베이스 반응형**의 메인 화면은
> `/layout/basic/main.html`을 레이아웃으로 씁니다 (`index.html` 첫 줄의 `@layout` 경로와 일치해야 함).

---

## 1. 백업부터

관리자 → **디자인 → 디자인 보관함** → 현재 스킨 **복사** → 복사본을 열어 작업.
운영 중인 스킨은 절대 직접 건드리지 마세요.

## 2. 이미지 업로드

디자인 편집창 왼쪽 파일 목록 → 이미지 폴더 → `images/` 안의 4개 파일 업로드.

원본 HTML은 사진이 base64로 박혀 있어 파일 하나가 **2.3MB**였습니다. 이대로는 편집창이 버벅이고 로딩도 느려서, 실제 이미지 파일로 뽑아냈습니다. 코드에서는 `{$image_path}/hero_01.jpg` 형태로 참조합니다.

> `{$image_path}`가 안 먹으면 편집창에서 이미지를 더블클릭해 실제 경로를 확인하고 그 경로로 바꾸세요.

## 3. CSS / JS 업로드

`layout.html` 상단·하단에 이미 링크가 들어가 있습니다.

```html
<!--@css(/layout/basic/css/otmove-main.css)-->   <!-- </head> 직전 -->
<!--@js(/layout/basic/otmove-main.js)-->          <!-- </body> 직전 -->
```

`<link>` / `<script>` 태그 대신 **`@css` / `@js` 형식**을 쓰세요. 카페24가 스킨 리소스를
`optimizer_user.php` 로 묶어서 내보냅니다.

> ⚠️ 경로가 실제 업로드 위치와 한 글자라도 다르면 **조용히 무시**됩니다(에러도 안 납니다).
> JS가 안 붙으면 드로어·히어로 슬라이드·필터탭이 전부 먹통이 되니, 편집창 파일 목록에서
> 파일이 어느 폴더에 있는지 눈으로 확인하고 경로를 맞추세요.

## 4. 레이아웃 붙여넣기

본문이 들어오는 자리는 **`<!--@contents-->`** 입니다. 이 한 줄은 절대 지우면 안 됩니다.

> ⚠️ `{$layout_contents}` 는 이 스킨(스마트디자인 classic)에서 동작하지 않습니다.
> 그대로 쓰면 페이지 본문이 통째로 안 나오고 `{$layout_contents}` 글자가 화면에 찍힙니다.

## 5. index.html 붙여넣기

맨 윗줄 `<!--@layout(/layout/basic/main.html)-->` 도 필수입니다.

---

## 상품 모듈 마크업 규칙 (중요)

`index.html`의 `[모듈 교체 지점 1·2]` 주석 부분입니다. 카페24 상품 모듈은 아래 3가지를 지켜야 정상 출력됩니다.

1. **반복 단위는 `<ul>` 안의 `<li>`** 이고, `<li>`에 `id="anchorBoxId_{$product_no}"` 가 있어야 합니다.
   `<div class="card">` 처럼 쓰면 카페24가 반복 영역을 못 찾아 모듈 전체를 반복해 버립니다.
2. **`<li>`를 소스에 여러 벌 적어두어야** 카페24가 그 부분을 반복 영역으로 인식합니다.
   (한 벌만 두면 상품이 1개만 나옵니다. 실제 출력 개수는 `$count` 값과 진열 상품 수를 따릅니다.)
3. **`{$link_product_detail}` 은 URL 문자열**입니다. `<a href="{$link_product_detail}">` 로 감싸세요.
   `{$link_product_detail}...{$/link_product_detail}` 형태로 쓰면 URL이 그대로 글자로 찍힙니다.

그리고 `{$product_name}` 은 `<span>`으로 감싸져 출력되므로 `alt=""` 안에 넣으면 태그가 깨집니다.
이미지 대체텍스트는 **`{$seo_alt_tag}`** 를 쓰세요.

모듈코드 ↔ 진열 대응은 **관리자 > 상품 > 상품 진열 > 메인 진열 > [메인분류 관리]** 에서 확인합니다.
현재 오트모브 쇼핑몰 기준:

| 모듈코드 | 메인분류 |
|---|---|
| `product_listmain_1` | 추천상품 |
| `product_listmain_2` | 신상품 |

각 진열에 상품을 실제로 담아야 화면에 나옵니다. 비어 있으면 섹션이 통째로 안 보입니다.

---

## 로그인 페이지

`login.html` + `auth.html` 두 파일로 구성됩니다. 메인과 달리 마퀴·헤더·푸터가 없는
전체화면 분할 디자인이라 **전용 레이아웃(`auth.html`)** 을 따로 씁니다.

### 카페24 로그인 모듈 규칙

- 아이디/비밀번호 입력칸은 **`{$form.member_id}` / `{$form.member_passwd}`** 가 출력합니다.
  `<input>` 을 직접 쓰면 로그인이 동작하지 않습니다. 겉모양은 CSS로만 맞추세요.
- 로그인 실행은 `<a onclick="{$action_func_login}">` 입니다.
  내부적으로 `MemberAction.login(...)` → `/exec/front/Member/login/` 로 전송됩니다.
- 모듈 안의 `<!--@css(/css/module/member/login.css)-->` 와
  `<!--@js(/js/module/member/login.js)-->` 두 줄은 필수입니다. 지우면 로그인이 안 됩니다.

### 알아둘 것

- **네이버 / 카카오 버튼**은 쇼핑몰에 해당 SNS 로그인이 설정돼 있지 않으면
  카페24가 `{$display_naver|display}` 로 `.displaynone` 클래스를 붙여 **자동으로 숨깁니다**.
  쓰려면 관리자 > 회원 > SNS(간편) 로그인 설정에서 네이버·카카오를 연동하세요.
  연동 전에는 OR 구분선도 같이 숨기도록 `auth.html` 에 `:has()` 규칙을 넣어뒀습니다.
- **"아이디 저장" 체크박스**(`{$form.member_check_save_id}`)는 현재 아무것도 출력되지 않습니다.
  쇼핑몰 설정에서 아이디 저장 기능이 꺼져 있어서입니다. 켜면 자동으로 나타납니다.
- 입력칸 placeholder는 `login.html` 하단의 작은 스크립트가 채웁니다
  (모듈이 만든 input에는 placeholder가 비어 있습니다).
- 원본 디자인에 있던 **비회원 구매** 버튼과 비회원 주문조회 모듈은 뺐습니다.
  게스트 결제를 쓸 예정이면 `{$action_nomember_order}` 버튼을 다시 넣어야 합니다.
- `auth.html` 의 `body#auth a{color:inherit}` 가 버튼 글자색을 덮어쓰기 때문에,
  버튼 색은 `body#auth .btn-*` 로 같은 특이도에서 다시 지정해 뒀습니다. 순서를 바꾸지 마세요.

---

## 회원가입 페이지 (약관동의 → 가입폼 → 완료)

로그인과 같은 톤으로 맞췄습니다. **마크업은 카페24 것을 그대로 두고 CSS로만** 입혔습니다.
가입폼은 입력 155개에 중복확인·본인인증·주소검색 등 검증 로직이 붙어 있어서,
마크업을 다시 쓰면 가입이 동작하지 않습니다.

대상 파일 3개 — `/member/agreement.html`, `/member/join.html`, `/member/join_result.html`.
각 파일에 아래 두 가지만 적용했습니다.

1. 첫 줄 레이아웃을 `<!--@layout(/layout/basic/auth.html)-->` 로 변경
2. 기존 내용을 로고 상단바 + `<div class="auth-single"> … </div>` 로 감싸고 help 버블 추가

톤 스타일은 전부 `auth.html` 안의 `.auth-single ...` 규칙입니다.

### 주의점

- `auth.html` 상단의 **카페24 기본 UI CSS 4줄**(`common.css`, `ec-base-ui/button/tooltip.css`)은
  빼면 안 됩니다. 체크박스·단계표시(1.약관동의 → 2.정보입력 → 3.가입완료)·버튼이 전부 깨집니다.
- 카페24 버튼 클래스가 화면마다 다릅니다. 확인된 것: `btnSubmit`, `btnSubmitFix`, `btnEm`,
  `btnStrong`(주 버튼) / `btnNormal`, `btnBasic`(보조 버튼).
  새 화면에서 버튼 색이 이상하면 그 화면의 버튼 클래스를 확인해 목록에 추가하세요.
- **글자색이 안 보이면 특이도 문제**입니다. `body#auth a{color:inherit}` 가 클래스 규칙을 이깁니다.
  `body#auth .auth-single .버튼클래스{color:...}` 형태로 같은 특이도에서 다시 지정하세요.
  (이 함정에 두 번 걸렸습니다.)
- `join_result.html`은 실제 가입 직후에만 열립니다. 그냥 접근하면 가입폼으로 리다이렉트되므로
  미리보기로는 확인할 수 없습니다.
- **이미 로그인한 방문자에게는 `member_login` 모듈이 아무것도 출력하지 않습니다.**
  그러면 로고 바와 왼쪽 이미지만 남고 오른쪽이 텅 빈 화면이 되므로,
  `login.html` 하단 스크립트의 `alreadyLoggedIn()` 이 이를 감지해 `/index.html` 로 보냅니다.
  판정 기준은 "`.auth-panel` 은 있는데 `.auth-form` 이 없다" 입니다.
  (`.auth-panel` 조차 없으면 레이아웃이 깨진 상황이므로 리다이렉트하지 않고 그대로 둡니다.)
  ⚠️ 이 때문에 **관리자로 로그인한 채로는 로그인 페이지를 미리볼 수 없습니다.** 시크릿 창을 쓰세요.

---

## 공통 레이아웃 (카테고리·상품상세·장바구니·주문·게시판·마이페이지)

메인 외 나머지 페이지도 같은 톤으로 통일했습니다. 대상 레이아웃 파일 **2개**입니다.

| 파일 | body id | 적용 페이지 |
|---|---|---|
| `/layout/basic/layout.html` | `sub` | 카테고리·검색·장바구니·주문·게시판·마이페이지 등 대부분 |
| `/layout/basic/detail_layout.html` | `detail` | 상품상세 (별도 레이아웃을 씁니다) |

두 파일 모두 아래 구조로 재작성했습니다. 본문 마크업은 건드리지 않았습니다.

```
<head>
  [카페24 기본 CSS/JS 그대로]      ← 본문(상품목록·주문·게시판)이 의존. 지우면 깨짐
  [Google Fonts + otmove-main.css]  ← 기본 CSS 뒤에 두어야 덮어쓴다
  <style> body#sub(또는 #detail) 스코프 톤 보정 </style>
</head>
<body id="sub">
  [마퀴 · 유틸바 · 헤더 · 드로어]   ← main.html 과 동일한 오트모브 크롬
  <div id="wrap"><div id="container"><div id="contents">
      <!--@contents-->
  </div></div></div>
  [오트모브 푸터] + otmove-main.js
</body>
```

### 주의점

- 헤더에 **`header-scrolled` 클래스를 직접 붙였습니다.** 서브 페이지엔 히어로가 없어
  `otmove-main.js`의 배경 전환 로직이 동작하지 않기 때문입니다. 빼면 헤더가 투명해져
  아이보리 배경 위에서 글자가 안 보입니다.
- 유틸바 글자색도 `body#sub .util-bar{color:var(--taupe)}` 로 따로 지정했습니다.
  원본은 히어로 위에 얹히는 흰색이라 서브 페이지에서는 안 보입니다.
- **회원가입 링크는 `/member/agreement.html`** 입니다. `/member/join.html` 로 직접 걸면
  **약관동의 단계를 건너뛰고 가입폼으로 직행**합니다. 헤더 유틸바와 드로어 양쪽 모두 해당하며,
  `main.html` · `layout.html` · `detail_layout.html` 세 파일에 각각 2곳씩 있습니다.
- **로고 링크는 전 레이아웃에서 `/index.html`** 입니다.
  원래 크롬의 로고는 `href="#top"`(히어로 맨 위로 스크롤)이었는데, 서브 페이지엔 `#top` 요소가 없어
  주소 끝에 `#top`만 붙고 아무 일도 안 일어났습니다. 그래서 헤더 로고와 드로어 로고를
  `main.html` · `layout.html` · `detail_layout.html` **세 파일 모두** `/index.html`로 바꿨습니다.
  (`auth.html` 계열은 원래부터 `/index.html`)
  이제 어느 페이지에서 눌러도 메인으로 이동하고, 메인에서 누르면 새로고침됩니다.
- **저장 후 반영이 안 되면 캐시입니다.** 관리자 상단 `사이트캐시 삭제`를 누르세요.
  카테고리 페이지는 캐시가 강해서 이걸 안 하면 계속 예전 화면이 나옵니다.
- 되돌리려면 `_backup_layout-basic-STOCK.html` 내용을 `/layout/basic/layout.html` 에
  붙여넣고 저장하면 됩니다.

---

## 메인 히어로 배너 (최대 5장)

`index.html`의 히어로는 `.hero-slide` 5칸 구조입니다. 이미지는 **고정 파일명**을 씁니다.

```
스킨 이미지 폴더 / hero_01.jpg ~ hero_05.jpg
```

| 하고 싶은 것 | 방법 |
|---|---|
| 배너 이미지 교체 | 관리자 > 디자인 > **파일업로더** 에서 **같은 파일명으로 덮어쓰기** (코드 수정 불필요) |
| 배너 4·5번째 추가 | `hero_04.jpg` / `hero_05.jpg` 업로드 → 자동으로 5장이 됨 |
| 배너 줄이기 | 해당 파일을 지우면 그 칸은 자동으로 빠짐 |

`otmove-main.js`의 `heroNodes()` 가 **이미지가 로드되지 않은 칸을 슬라이드에서 자동 제외**합니다.
그래서 3장만 올라가 있으면 `01 / 03`, 5장이면 `01 / 05` 로 표시가 알아서 바뀝니다.
`heroNodes()` 는 새 구조(`.hero-slide`)를 우선 쓰고 없으면 예전 구조(`.hero-media img`)로 넘어가므로,
HTML을 되돌려도 슬라이더는 계속 동작합니다.

배너 클릭 시 이동 주소는 5칸 모두 `/product/list.html` 입니다.
각각 다른 곳으로 보내려면 `index.html` 의 `<a href="/product/list.html">` 를 칸별로 바꾸세요.

### ⚠️ CSS 함정

`otmove-main.css` 에 예전 규칙 `.hero-media img{opacity:0}` 이 남아 있습니다.
이게 새 구조의 이미지까지 투명하게 만들어서, **`.hero-media .hero-slide img{opacity:1}` 로 덮어쓰고 있습니다.**
이 한 줄을 지우면 배너가 통째로 안 보이게 되니 주의하세요.

---

## 카테고리 번호

`layout.html` 의 `?cate_no=NN` 값입니다. 현재 쇼핑몰 기준으로 이미 채워져 있습니다.

| 메뉴 | 분류명 | cate_no |
|---|---|---|
| TOPS | Tops | 25 |
| OUTWEAR | Outerwear | 24 |
| BOTTOM | Bottoms | 27 |
| DRESS | Dresses | 26 |
| SHOES | Shoes | 42 |
| ACC | Accessories | 28 |

- 하위메뉴(T-Shirts, 플랫 …)는 쇼핑몰에 해당 분류가 없어서 **부모 대분류 번호로 연결**해 뒀습니다.
  나중에 하위분류를 만들면 그 번호로 바꾸세요.
- **NEW-5%, 26SS SALE** 은 대응 분류가 없어 `cate_no=00` 그대로입니다 (헤더·드로어 각 1개씩, 총 4곳).
  기획전이나 전용 분류를 만든 뒤 연결하세요.

---

## 남은 작업

### ① 상품 이미지
현재 등록된 상품 3개에 이미지가 없어 카드가 회색 카메라 플레이스홀더로 나옵니다.
관리자 > 상품 > 상품목록에서 상품 이미지를 등록하세요.

### ② 가격 표기
`{$product_price}` 는 `38000` 처럼 숫자만 출력됩니다. 원화 기호·천 단위 콤마가 필요하면
CSS/JS로 가공하거나 카페24의 가격 표시 설정을 확인하세요.

### ③ Weekly Best 필터탭
All/Top/Pants/Skirts/Dress/Shoes 탭은 원래 하드코딩된 6개 상품 기준으로 만든 기능입니다.
모듈은 카테고리명을 그대로 주지 않아서, 상품 **요약설명**에 `top`, `pants` 같은 값을 적어두고
`data-category="{$product_summary}"` 로 연결하는 방식으로 임시 처리해뒀습니다.
번거로우면 필터탭을 지우고 카테고리 링크로 바꾸는 게 훨씬 안정적입니다.
`.rank`의 `{$count}` 는 이 모듈에서 값이 없어 빈 칸으로 나옵니다.

### ④ 인스타그램 섹션
지금은 회색 플레이스홀더입니다. 이미지 6장을 넣거나, 카페24 앱스토어의 인스타그램 위젯 앱으로 대체하세요.

### ⑤ 푸터 링크
공지사항·교환/반품·이용약관 등이 `#none` 입니다. 게시판 주소는 쇼핑몰마다 달라서 비워뒀습니다.

### ⑥ 모바일 스킨
카페24는 PC/모바일 스킨이 분리돼 있습니다. 이 파일들은 PC용입니다.

---

## 잔손질 한 가지

원본 JS의 히어로 "아래로 스크롤" 버튼이 존재하지 않는 `.quick-cats` 요소를 찾고 있어서 눌러도 반응이 없었습니다. 신상품 섹션(`#new`)으로 가도록 고쳐뒀습니다.
