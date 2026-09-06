# 과제 b1-1: 나를 소개하는 웹페이지 처음부터 만들기

> 순수 HTML5, CSS3, JavaScript(ES6+)만을 활용하여 제작한 반응형 포트폴리오 웹사이트입니다.

---

## 📌 프로젝트 소개 및 목적

외부 프레임워크/라이브러리(React, Vue, jQuery, Bootstrap, Tailwind 등)를 사용하지 않고 Vanilla Web Stack으로 구현된 포트폴리오 사이트입니다.
"사용자 이벤트 → 상태 변경 → DOM 업데이트"로 이어지는 핵심 프론트엔드 작동 흐름 체득에 목적을 두고 작성되었습니다.

---

## 🛠️ 사용 기술 스택

- **Markup**: HTML5 (시맨틱 마크업)
- **Styling**: CSS3 (CSS Variables, Flexbox, CSS Grid, Responsive Media Queries)
- **Scripting**: JavaScript (ES6+, Async/Await, Fetch API, DOM API, Intersection Observer)
- **External Resources**: Font Awesome 6.5.1 (CDN), Google Fonts (Noto Sans KR, Fira Code)

---

## ✨ 핵심 구현 기능

### 1. 반응형 레이아웃 & 시맨틱 마크업
- `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` 시맨틱 태그 활용
- Header/Nav: **Flexbox** 기반 (모바일 햄버거 메뉴 토글 지원)
- Projects Grid: **CSS Grid** (`repeat(auto-fit, minmax(300px, 1fr))`)를 활용한 디바이스 자동 대응
- Breakpoints: 768px (태블릿), 1024px (데스크톱)
- About 섹션 프로필 이미지(`images/profile.svg`)에 이름이 반영된 `alt` 제공

### 2. 다크 모드 (Dark Mode) & 상태 유지
- `:root` 및 `[data-theme="dark"]` CSS 변수로 테마 관리
- `localStorage`를 이용해 사용자의 테마 설정을 브라우저에 저장 및 새로고침 유지
- `prefers-color-scheme`으로 시스템 테마 자동 감지 지원

### 3. GitHub REST API 연동 및 비동기 처리
- `fetch` 및 `async/await`를 사용해 `https://api.github.com/users/{username}/repos` 호출
- **상태 관리**:
  - 🔄 **로딩 상태**: 로딩 스피너 애니메이션 표시
  - ✅ **성공 상태**: `Array.prototype.map`으로 동적 HTML 카드 생성 및 렌더링
  - ⚠️ **에러 상태**: 네트워크 실패 / 404 / 403 Rate Limit 예외 처리 및 재시도 버튼 제공
  - 📭 **빈 상태**: 결과 데이터가 없을 시 안내 문구 표출
- **언어별 필터링**: `Array.prototype.filter`를 활용하여 JavaScript, Python, HTML/CSS 언어별 실시간 필터링

### 4. 스크롤 인터랙션

과제가 "자유 변경 가능하나 README 에 명시" 를 요구한 기준값입니다.

| 항목 | 기준값 | 동작 |
|---|---|---|
| 헤더 배경 변화 | **60px** | `.header.scrolled` — 배경 불투명도와 그림자 추가 |
| 스크롤 탑 버튼 | **300px** | 우하단 버튼 노출, 클릭 시 맨 위로 |
| Intersection Observer | **threshold 0.2** | 섹션이 20% 보이면 등장 애니메이션 |

앵커 링크(`#about` 등)로 페이지에 바로 들어오면 Hero 는 이미 화면 위로 지나가
threshold 를 만족할 기회가 없습니다. 그래서 관찰 콜백은 "이미 화면 위로 지나간"
섹션도 표시 대상으로 봅니다.

### 5. 중앙 상태 관리

화면을 결정하는 값을 **객체 하나**에 모으고, `setState` 로만 바꿉니다.

```js
const state = {
  theme:    { mode: 'light' },
  projects: { status: 'idle', username: '', repos: [], filter: 'all', error: null },
  form:     { errors: { name: '', email: '', message: '' }, success: false },
  nav:      { menuOpen: false, headerScrolled: false, showScrollTop: false, activeSection: 'hero' }
};

const RENDERERS = { theme: renderTheme, projects: renderProjects, form: renderForm, nav: renderNav };
```

- **이벤트 핸들러는 DOM 을 만지지 않습니다.** 상태만 바꾸면 해당 슬라이스의
  렌더 함수가 화면을 맞춥니다
- `setState` 는 **값이 실제로 달라진 슬라이스만** 다시 그립니다.
  임계값을 넘지 않는 스크롤 50회에서 `classList` 쓰기가 9회로 줄어듭니다
- API 진행 상태를 `status` 값으로 들고 있어 로딩·성공·에러·빈 상태 분기가
  `renderProjects` 한 곳에 모입니다
- 콘솔에서 `window.appState` 로 현재 상태를 그대로 확인할 수 있습니다

### 6. 폼 유효성 검사 (Contact Form)
- `submit` 이벤트 시 `event.preventDefault()`로 기본 제출 동작 차단
- 이름, 이메일, 메시지 필드 필수값 검증 및 이메일 정규표현식 검증
- 실시간 입력(`input` 이벤트)에 맞춰 에러 스타일 및 문구 동적 해제
- 제출 완료 시 성공 안내 메시지 표시

---

## 📁 폴더 구조

```
b1-1/
├── index.html         # 메인 HTML5 구조 (시맨틱 마크업)
├── css/
│   └── style.css      # 스타일시트 (CSS 변수, 반응형, 다크 모드)
├── js/
│   └── main.js        # DOM · 이벤트 · GitHub API · 폼 검증
├── images/
│   └── profile.svg    # About 섹션 프로필 이미지
├── config/
│   └── profile.json   # 이름·연락처·소개·스킬 목록 (내용과 마크업 분리)
├── scripts/
│   └── verify.sh      # 요구사항 자기 점검
├── b1-1.md            # 과제 요구사항 원문
├── plan.md            # 수행 계획 · 설계 결정 · 위험 요소
├── note.md            # 평가 대비 정리 · 수동 점검 절차
└── README.md          # 이 문서
```

### `config/profile.json` 을 둔 이유

이름·이메일·소개·스킬을 HTML 에 박아 두면 한 글자 고치려고 마크업을 열어야 한다.
JSON 하나로 빼서 **내용과 구조를 갈랐다.** 페이지는 이 파일을 `fetch` 로 읽어
DOM 에 주입한다 — GitHub API 말고도 "데이터를 받아 화면을 그리는" 흐름이
한 번 더 드러난다.

`file://` 로 열면 브라우저가 로컬 `fetch` 를 막으므로, `js/main.js` 안의
`defaultProfile` 이 같은 내용을 들고 대신 쓰인다. 두 곳이 어긋나면 여는 방법에
따라 화면이 달라지므로 `scripts/verify.sh` 가 두 값을 대조한다.

---

## 🚀 실행 방법

**로컬 서버로 여는 것을 권장합니다.** `config/profile.json` 을 `fetch` 로 읽기 때문에,
`file://` 로 직접 열면 브라우저가 로컬 요청을 막아 내장 기본값으로 대체됩니다.

```bash
# VS Code 라면 Live Server 확장으로 index.html 을 엽니다.
# 또는 이 폴더에서:
python3 -m http.server 8000
```

## ✅ 자기 점검

```bash
bash scripts/verify.sh
```

폴더 구조, 시맨틱 태그, `img`/`alt`, `label` for-id, CSS 변수, 모바일 퍼스트,
금지 항목(`var` · `onclick` · 인라인 스타일 · 외부 라이브러리), JS 기능,
설정 파일 정합, 문서 존재 여부를 검사합니다.

브라우저에서만 확인 가능한 항목(다크 모드 유지, API 4상태, 폼 검증, 스크롤
임계값)은 [note.md](note.md) 의 "수동 점검 절차" 에 순서를 적어 두었습니다.
