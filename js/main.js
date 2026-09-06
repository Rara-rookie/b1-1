/**
 * Assignment b1-1: Responsive Developer Portfolio
 * Pure Vanilla JavaScript (ES6+) with Config/JSON File Separation
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements Initialization
  const header = document.querySelector('#header');
  const navMenu = document.querySelector('#nav-menu');
  const hamburgerBtn = document.querySelector('#hamburger');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggleBtn = document.querySelector('#theme-toggle');
  const scrollTopBtn = document.querySelector('#scroll-top-btn');

  const githubUsernameInput = document.querySelector('#github-username-input');
  const githubSearchBtn = document.querySelector('#github-search-btn');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectsContainer = document.querySelector('#projects-container');

  const contactForm = document.querySelector('#contact-form');
  const nameInput = document.querySelector('#contact-name');
  const emailInput = document.querySelector('#contact-email');
  const messageInput = document.querySelector('#contact-message');
  const nameError = document.querySelector('#name-error');
  const emailError = document.querySelector('#email-error');
  const messageError = document.querySelector('#message-error');
  const formSuccess = document.querySelector('#form-success');

  /* ==========================================================================
     상태 (Single Source of Truth)

     화면을 결정하는 값을 전부 이 객체 하나에 모은다. 예전에는 값마다 let 변수가
     따로 있었고, 테마는 아예 변수가 없어 DOM(data-theme)에서 되읽어야 했다.
     그러면 "지금 화면이 어떤 상태인가" 를 코드에 물어볼 수가 없다.

     규칙 하나: **DOM 을 직접 만지지 않는다. setState 로 상태를 바꾸면
     해당 슬라이스의 render 함수가 화면을 맞춘다.**
     ========================================================================== */
  const state = {
    // mode 를 null 로 시작하는 이유: 첫 setState 가 반드시 렌더를 타게 해서
    // localStorage 기록과 아이콘 초기화를 건너뛰지 않게 한다.
    theme: { mode: null },

    projects: {
      status: 'idle',      // idle | loading | success | error
      username: '',
      repos: [],
      filter: 'all',
      error: null
    },

    form: {
      errors: { name: '', email: '', message: '' },
      success: false
    },

    nav: {
      menuOpen: false,
      headerScrolled: false,
      showScrollTop: false,
      activeSection: 'hero'
    }
  };

  /**
   * 상태를 바꾸고, 바뀐 슬라이스만 다시 그린다.
   *
   * setState({ projects: { filter: 'python' } })
   *
   * 값이 실제로 달라졌을 때만 렌더를 부른다. 스크롤은 초당 수십 번 들어오는데
   * 대부분 같은 값이라, 이 비교가 없으면 헛된 DOM 쓰기가 계속 일어난다.
   */
  const setState = (patch) => {
    const dirty = [];

    Object.keys(patch).forEach((slice) => {
      const before = state[slice];
      const after = { ...before, ...patch[slice] };
      const changed = Object.keys(after).some((key) => after[key] !== before[key]);

      if (changed) {
        state[slice] = after;
        dirty.push(slice);
      }
    });

    // RENDERERS 는 render 함수들이 모두 정의된 뒤 아래쪽에서 만든다.
    dirty.forEach((slice) => {
      const render = RENDERERS[slice];
      if (render) render();
    });
  };

  // 화면 상태가 아니라 자원 핸들이라 state 에 넣지 않는다.
  let typingTimer = null;

  // 과제가 "자유 변경 가능하나 README 에 명시" 를 요구한 값들.
  const SCROLL_HEADER_THRESHOLD = 60;
  const SCROLL_TOP_THRESHOLD = 300;
  const ANIMATION_THRESHOLD = 0.2;
  const FORM_SUCCESS_DURATION = 5000;
  const DEFAULT_USERNAME = 'Rara-rookie';

  /* ==========================================================================
     0. Dynamic Profile Configuration & External File Loading (config/profile.json)
     ========================================================================== */
  // config/profile.json 을 읽지 못할 때(file:// 로 열었을 때) 쓰는 사본이다.
  // 두 곳의 값이 어긋나면 열어보는 방법에 따라 화면이 달라진다.
  // scripts/verify.sh 가 email·username·name 이 같은지 검사한다.
  const defaultProfile = {
    name: 'Rara-rookie',
    username: 'Rara-rookie',
    role: 'Software Engineer / Developer',
    email: 'nahyulee@gmail.com',
    location: 'Seoul, Republic of Korea',
    avatar: 'images/profile.svg',
    hero: {
      badge: 'Welcome to my portfolio',
      subtitle: '사용자 경험을 최우선으로 생각하며, 견고하고 확장 가능한 웹 서비스를 만들어 나갑니다.'
    },
    codeWindow: {
      title: 'developer.js',
      passions: ['Clean Code', 'Web Accessibility', 'Performance'],
      learning: 'Always Hungry for Knowledge'
    },
    about: {
      subtitle: '문제 해결에 집중하는 호기심 많은 개발자',
      description: '웹의 본질과 동작 원리에 관심이 깊으며, HTML/CSS/JavaScript의 튼튼한 기본기를 바탕으로 기술적 문제를 하나씩 풀어가는 과정을 좋아합니다.'
    },
    skills: [
      {
        category: 'Frontend',
        icon: 'fa-solid fa-laptop-code',
        items: [
          { name: 'HTML5 (Semantic Markup)', icon: 'fa-brands fa-html5' },
          { name: 'CSS3 (Flexbox, Grid, Variables)', icon: 'fa-brands fa-css3-alt' },
          { name: 'JavaScript (ES6+, Async/Await)', icon: 'fa-brands fa-js' },
          { name: 'React Basics', icon: 'fa-brands fa-react' }
        ]
      },
      {
        category: 'Backend & DB',
        icon: 'fa-solid fa-server',
        items: [
          { name: 'Python', icon: 'fa-brands fa-python' },
          { name: 'Node.js Basics', icon: 'fa-brands fa-node-js' },
          { name: 'RESTful API Design', icon: 'fa-solid fa-database' },
          { name: 'MySQL / SQLite', icon: 'fa-solid fa-hard-drive' }
        ]
      },
      {
        category: 'Tools & Environment',
        icon: 'fa-solid fa-toolbox',
        items: [
          { name: 'Git & GitHub', icon: 'fa-brands fa-git-alt' },
          { name: 'Docker Basics', icon: 'fa-brands fa-docker' },
          { name: 'Linux CLI (Bash)', icon: 'fa-brands fa-linux' },
          { name: 'VS Code', icon: 'fa-solid fa-code' }
        ]
      }
    ]
  };

  /**
   * Bonus Feature: Typewriter Effect for Hero Subtitle
   */
  const startTypewriterEffect = (text) => {
    const heroSubtitleEl = document.querySelector('#hero-subtitle');
    if (!heroSubtitleEl || !text) return;

    if (typingTimer) clearInterval(typingTimer);

    heroSubtitleEl.textContent = '';
    let index = 0;

    typingTimer = setInterval(() => {
      if (index < text.length) {
        heroSubtitleEl.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typingTimer);
      }
    }, 40);
  };

  /**
   * Renders Skills & Tools grid dynamically from configuration data
   */
  const renderSkillsGrid = (skills) => {
    const gridContainer = document.querySelector('#skills-grid');
    if (!gridContainer || !skills || skills.length === 0) return;

    const html = skills.map((cat) => `
      <div class="skill-category">
        <h3><i class="${cat.icon || 'fa-solid fa-code'}"></i> ${cat.category}</h3>
        <ul class="skill-list">
          ${cat.items.map((item) => `
            <li><i class="${item.icon || 'fa-solid fa-check'}"></i> ${item.name}</li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    gridContainer.innerHTML = html;
  };

  /**
   * Applies loaded profile data to DOM elements
   */
  const applyProfileConfig = (customConfig = {}) => {
    const profile = {
      ...defaultProfile,
      ...customConfig,
      hero: { ...defaultProfile.hero, ...(customConfig.hero || {}) },
      codeWindow: { ...defaultProfile.codeWindow, ...(customConfig.codeWindow || {}) },
      about: { ...defaultProfile.about, ...(customConfig.about || {}) }
    };

    // 1. Header Logo
    const logoEl = document.querySelector('#header-logo-text');
    if (logoEl) logoEl.textContent = `${profile.name}.dev`;

    // 2. Hero Section
    const heroBadgeEl = document.querySelector('#hero-badge');
    if (heroBadgeEl) heroBadgeEl.textContent = profile.hero.badge;

    const heroNameEl = document.querySelector('#hero-name');
    if (heroNameEl) heroNameEl.textContent = profile.name;

    // Start Typewriter Effect for Hero Subtitle
    startTypewriterEffect(profile.hero.subtitle);

    // 3. Code Window
    const codeTitleEl = document.querySelector('#code-window-title');
    if (codeTitleEl) codeTitleEl.textContent = profile.codeWindow.title;

    const codeNameEl = document.querySelector('#code-dev-name');
    if (codeNameEl) codeNameEl.textContent = `'${profile.name}'`;

    const codeRoleEl = document.querySelector('#code-dev-role');
    if (codeRoleEl) codeRoleEl.textContent = `'${profile.role}'`;

    const codePassionsEl = document.querySelector('#code-dev-passions');
    if (codePassionsEl) {
      codePassionsEl.textContent = JSON.stringify(profile.codeWindow.passions || []);
    }

    const codeLearningEl = document.querySelector('#code-dev-learning');
    if (codeLearningEl) {
      codeLearningEl.textContent = `'${profile.codeWindow.learning}'`;
    }

    // 4. About Section
    // 프로필 이미지 — 경로와 alt 를 이름에 맞춰 갱신한다.
    // alt 는 "무엇이 보이는지" 를 적어야 하므로 이름을 넣는다.
    const avatarImgEl = document.querySelector('#about-avatar-img');
    if (avatarImgEl) {
      avatarImgEl.src = profile.avatar;
      avatarImgEl.alt = `${profile.name} 프로필 이미지`;
    }

    const avatarNameEl = document.querySelector('#about-avatar-name');
    if (avatarNameEl) avatarNameEl.textContent = profile.name;

    const avatarRoleEl = document.querySelector('#about-avatar-role');
    if (avatarRoleEl) avatarRoleEl.textContent = profile.role;

    const aboutTitleEl = document.querySelector('#about-title');
    if (aboutTitleEl) aboutTitleEl.textContent = profile.about.subtitle;

    const aboutDescEl = document.querySelector('#about-description');
    if (aboutDescEl) aboutDescEl.textContent = profile.about.description;

    // 5. Render Skills Grid
    renderSkillsGrid(profile.skills || defaultProfile.skills);

    // 6. GitHub Search Input
    if (githubUsernameInput) githubUsernameInput.value = profile.username;

    // 7. Contact Section
    const contactEmailEl = document.querySelector('#contact-email-text');
    if (contactEmailEl) contactEmailEl.textContent = profile.email;

    const contactGithubEl = document.querySelector('#contact-github-link');
    if (contactGithubEl) {
      contactGithubEl.textContent = `github.com/${profile.username}`;
      contactGithubEl.href = `https://github.com/${profile.username}`;
    }

    const contactLocEl = document.querySelector('#contact-location-text');
    if (contactLocEl) contactLocEl.textContent = profile.location;

    // 8. Footer Section
    const footerCopyEl = document.querySelector('#footer-copy-text');
    if (footerCopyEl) footerCopyEl.textContent = `© 2026 ${profile.name}. All rights reserved.`;

    const footerGithubEl = document.querySelector('#footer-github-link');
    if (footerGithubEl) footerGithubEl.href = `https://github.com/${profile.username}`;

    // 9. Fetch GitHub Repositories for profile.username
    fetchGitHubProjects(profile.username);
  };

  /**
   * Loads config/profile.json from file system via fetch API
   */
  const loadProfileFromFile = async () => {
    try {
      const response = await fetch('config/profile.json');
      if (response.ok) {
        const configData = await response.json();
        applyProfileConfig(configData);
        return;
      }
    } catch (err) {
      // Local file:// protocol fallback
    }
    applyProfileConfig(defaultProfile);
  };

  window.initPortfolio = applyProfileConfig;

  /* ==========================================================================
     1. Theme Management (Dark / Light Mode)
     ========================================================================== */
  // 렌더 — state.theme 을 화면과 저장소에 반영한다.
  const renderTheme = () => {
    const { mode } = state.theme;

    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);

    const icon = themeToggleBtn.querySelector('i');
    icon.className = mode === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    setState({ theme: { mode: savedTheme || (prefersDark ? 'dark' : 'light') } });
  };

  // 이벤트는 상태만 바꾼다. DOM 은 renderTheme 이 맡는다.
  themeToggleBtn.addEventListener('click', () => {
    setState({ theme: { mode: state.theme.mode === 'dark' ? 'light' : 'dark' } });
  });

  /* ==========================================================================
     2. Mobile Navigation & Hamburger Menu
     ========================================================================== */
  // 렌더 — state.nav 를 클래스로 옮긴다. 메뉴·헤더·스크롤탑·활성 링크가 한곳에서 결정된다.
  const renderNav = () => {
    const { menuOpen, headerScrolled, showScrollTop, activeSection } = state.nav;

    hamburgerBtn.classList.toggle('active', menuOpen);
    navMenu.classList.toggle('active', menuOpen);
    header.classList.toggle('scrolled', headerScrolled);
    scrollTopBtn.classList.toggle('visible', showScrollTop);

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeSection}`);
    });
  };

  hamburgerBtn.addEventListener('click', () => {
    setState({ nav: { menuOpen: !state.nav.menuOpen } });
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      setState({ nav: { menuOpen: false } });

      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ==========================================================================
     3. Scroll Event Listeners (Header & Scroll Top)
     ========================================================================== */
  const sectionElements = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    let activeSection = state.nav.activeSection;
    sectionElements.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (scrollY > sectionTop && scrollY <= sectionTop + section.offsetHeight) {
        activeSection = section.getAttribute('id');
      }
    });

    // 값이 그대로면 setState 가 렌더를 건너뛴다. 스크롤 한 번마다
    // 클래스를 다시 쓰던 예전 방식과 달라지는 지점이다.
    setState({
      nav: {
        headerScrolled: scrollY > SCROLL_HEADER_THRESHOLD,
        showScrollTop: scrollY > SCROLL_TOP_THRESHOLD,
        activeSection
      }
    });
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================================================
     4. Intersection Observer for Scroll Animations
     ========================================================================== */
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: ANIMATION_THRESHOLD
  };

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      // 이미 화면 위로 지나간 섹션은 threshold 0.2 를 만족할 기회가 없다.
      // #about 처럼 앵커로 바로 들어오면 Hero 가 그 상태가 되어, 위로
      // 되돌아가기 전까지 opacity 0 인 채 빈 화면으로 남는다.
      // 관찰 시작 시점에도 콜백이 한 번 오므로 여기서 같이 처리한다.
      const passedAbove = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;

      if (entry.isIntersecting || passedAbove) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const sectionsToAnimate = document.querySelectorAll('.section, .hero-section');
  sectionsToAnimate.forEach((section) => {
    section.classList.add('animate-on-scroll');
    animationObserver.observe(section);
  });

  /* ==========================================================================
     5. GitHub API Integration & UI Rendering
     ========================================================================== */
  const renderLoadingState = () => {
    projectsContainer.innerHTML = `
      <div class="state-box">
        <div class="spinner"></div>
        <p>GitHub에서 프로젝트를 불러오는 중입니다...</p>
      </div>
    `;
  };

  const renderErrorState = (errorMessage) => {
    projectsContainer.innerHTML = `
      <div class="state-box error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>프로젝트를 불러올 수 없습니다</h3>
        <p>${errorMessage}</p>
        <button id="retry-btn" class="btn btn-secondary retry-btn">
          <i class="fa-solid fa-rotate-right"></i> 다시 시도
        </button>
      </div>
    `;

    const retryBtn = document.querySelector('#retry-btn');
    if (retryBtn) {
      // 실패한 이름을 그대로 다시 보내면, 사용자가 오타를 고쳐도 영원히 같은
      // 에러가 난다. 지금 입력창에 있는 값을 우선 쓰고, 비어 있을 때만
      // 직전에 시도한 이름(state)으로 되돌아간다.
      retryBtn.addEventListener('click', () => {
        const current = githubUsernameInput ? githubUsernameInput.value.trim() : '';
        fetchGitHubProjects(current || state.projects.username);
      });
    }
  };

  const renderEmptyState = (detail = '해당 조건에 일치하는 저장소가 존재하지 않습니다.') => {
    projectsContainer.innerHTML = `
      <div class="state-box">
        <i class="fa-solid fa-folder-open"></i>
        <h3>표시할 프로젝트가 없습니다</h3>
        <p>${detail}</p>
      </div>
    `;
  };

  // 언어 이름을 CSS 가 알아볼 수 있는 값으로 낮춘다. 색은 style.css 의
  // .lang-dot[data-lang="..."] 규칙이 정한다 — 인라인 style 을 쓰지 않기 위해서다.
  const toLanguageKey = (language) => (language || '').trim().toLowerCase();

  const renderProjectsGrid = (repos) => {
    if (!repos || repos.length === 0) {
      renderEmptyState();
      return;
    }

    const cardsHtml = repos.map((repo) => {
      const { name, description, html_url, stargazers_count, language, updated_at } = repo;
      const updatedDate = new Date(updated_at).toLocaleDateString('ko-KR');
      const langKey = toLanguageKey(language);

      return `
        <article class="project-card">
          <div class="project-card-header">
            <i class="fa-solid fa-folder-closed folder-icon"></i>
            <span class="stars"><i class="fa-solid fa-star"></i> ${stargazers_count}</span>
          </div>
          <h3><a href="${html_url}" target="_blank" rel="noopener noreferrer">${name}</a></h3>
          <p>${description ? description : '설명이 등록되어 있지 않은 저장소입니다.'}</p>
          <div class="project-card-footer">
            <span class="lang-badge">
              <span class="lang-dot" data-lang="${langKey}"></span>
              ${language || '기타'}
            </span>
            <span class="updated-date">수정일: ${updatedDate}</span>
          </div>
        </article>
      `;
    }).join('');

    projectsContainer.innerHTML = cardsHtml;
  };

  /** 순수 함수 — 저장소 목록에서 필터에 맞는 것만 고른다. 상태를 건드리지 않는다. */
  const selectRepos = (repos, filter) => {
    if (filter === 'all') return repos;

    return repos.filter((repo) => {
      if (!repo.language) return false;
      const repoLang = repo.language.toLowerCase();
      if (filter === 'html') {
        return repoLang === 'html' || repoLang === 'css';
      }
      return repoLang === filter;
    });
  };

  /**
   * 렌더 — state.projects 하나만 보고 어떤 화면을 그릴지 정한다.
   *
   * 예전에는 fetch 안에서 렌더 함수를 직접 골라 불렀다. 그러면 "지금 로딩
   * 중인가" 를 코드에 물어볼 수가 없고, 컨테이너의 innerHTML 을 들여다봐야 한다.
   * 이제는 status 가 답을 갖고 있다.
   */
  const renderProjects = () => {
    const { status, repos, filter, error } = state.projects;

    // 필터 버튼의 활성 표시도 상태에서 나온다.
    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });

    if (status === 'idle') {
      projectsContainer.innerHTML = '';
      return;
    }

    if (status === 'loading') {
      renderLoadingState();
      return;
    }

    if (status === 'error') {
      renderErrorState(error);
      return;
    }

    const visible = selectRepos(repos, filter);

    if (visible.length === 0) {
      // repos 를 상태로 들고 있으니 두 경우를 구분해 말할 수 있다.
      renderEmptyState(
        repos.length === 0
          ? '이 사용자에게 공개된 저장소가 없습니다.'
          : '해당 언어로 작성된 저장소가 없습니다.'
      );
      return;
    }

    renderProjectsGrid(visible);
  };

  /**
   * GitHub 저장소를 받아 온다. **DOM 을 직접 만지지 않는다** — 상태만 바꾸고,
   * 화면은 renderProjects 가 맡는다. 로딩·성공·에러가 전부 status 값이 된다.
   */
  const fetchGitHubProjects = async (username = DEFAULT_USERNAME) => {
    const trimmed = (username || '').trim();

    if (!trimmed) {
      setState({
        projects: { status: 'error', error: '올바른 GitHub 사용자명을 입력하세요.' }
      });
      return;
    }

    setState({ projects: { status: 'loading', username: trimmed, error: null } });

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(trimmed)}/repos?sort=updated&per_page=12`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`사용자 '${trimmed}'을(를) 찾을 수 없습니다.`);
        } else if (response.status === 403) {
          throw new Error('API 호출 한도(Rate Limit)가 초과되었습니다. 잠시 후 다시 시도해 주세요.');
        } else {
          throw new Error(`GitHub API 오류가 발생했습니다 (HTTP ${response.status}).`);
        }
      }

      const repos = await response.json();
      setState({ projects: { status: 'success', repos, error: null } });
    } catch (error) {
      setState({
        projects: {
          status: 'error',
          error: error.message || '네트워크 연결 상태를 확인하세요.'
        }
      });
    }
  };

  githubSearchBtn.addEventListener('click', () => {
    const inputVal = githubUsernameInput.value.trim();
    fetchGitHubProjects(inputVal);
  });

  githubUsernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const inputVal = githubUsernameInput.value.trim();
      fetchGitHubProjects(inputVal);
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // 데이터를 다시 받지 않는다. 필터 상태만 바꾸면 renderProjects 가
      // state.projects.repos 에서 다시 골라 그린다.
      setState({ projects: { filter: button.getAttribute('data-filter') } });
    });
  });

  /* ==========================================================================
     6. Contact Form Validation & State Feedback
     ========================================================================== */
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // 필드 이름 → [입력 요소, 에러 문구 자리] 짝. 렌더와 초기화가 이 표를 함께 쓴다.
  const FORM_FIELDS = {
    name: [nameInput, nameError],
    email: [emailInput, emailError],
    message: [messageInput, messageError]
  };

  /** 순수 함수 — 값을 받아 에러 표를 만든다. DOM 도 상태도 건드리지 않는다. */
  const validateForm = ({ name, email, message }) => ({
    name: name ? '' : '이름을 입력해 주세요.',
    email: !email
      ? '이메일을 입력해 주세요.'
      : (validateEmail(email) ? '' : '올바른 이메일 형식이 아닙니다 (예: name@domain.com).'),
    message: message ? '' : '메시지 내용을 입력해 주세요.'
  });

  /** 렌더 — state.form 을 화면에 옮긴다. 에러 문구와 성공 배너가 여기서만 결정된다. */
  const renderForm = () => {
    const { errors, success } = state.form;

    Object.keys(FORM_FIELDS).forEach((field) => {
      const [input, slot] = FORM_FIELDS[field];
      const message = errors[field];

      input.classList.toggle('invalid', Boolean(message));
      slot.textContent = message;
    });

    formSuccess.classList.toggle('hidden', !success);
  };

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const values = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim()
    };

    const errors = validateForm(values);
    const isValid = Object.keys(errors).every((field) => !errors[field]);

    setState({ form: { errors, success: isValid } });

    if (isValid) {
      contactForm.reset();
      setTimeout(() => setState({ form: { success: false } }), FORM_SUCCESS_DURATION);
    }
  });

  // 입력 중에는 그 필드의 조건이 풀렸을 때만 에러를 지운다.
  // 이미 깨끗하면 setState 를 부르지 않아 헛된 렌더가 생기지 않는다.
  const clearFieldError = (field, isResolved) => {
    if (!state.form.errors[field] || !isResolved) return;
    setState({ form: { errors: { ...state.form.errors, [field]: '' } } });
  };

  nameInput.addEventListener('input', () => {
    clearFieldError('name', Boolean(nameInput.value.trim()));
  });

  emailInput.addEventListener('input', () => {
    clearFieldError('email', validateEmail(emailInput.value.trim()));
  });

  messageInput.addEventListener('input', () => {
    clearFieldError('message', Boolean(messageInput.value.trim()));
  });

  /* ==========================================================================
     7. 렌더러 레지스트리와 초기화

     setState 는 이 표를 보고 "바뀐 슬라이스" 에 해당하는 render 만 부른다.
     상태를 추가하려면 여기에 한 줄 늘리면 되고, 상태를 바꾸는 쪽은
     어떤 함수를 불러야 할지 알 필요가 없다.
     ========================================================================== */
  const RENDERERS = {
    theme: renderTheme,
    projects: renderProjects,
    form: renderForm,
    nav: renderNav
  };

  // 디버깅용. 콘솔에서 window.appState 로 현재 상태를 그대로 볼 수 있다.
  window.appState = state;

  initTheme();
  loadProfileFromFile();
});
