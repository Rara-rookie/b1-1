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

  // Application State
  let repositoriesState = [];
  let currentFilter = 'all';
  let typingTimer = null;

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
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const themeToApply = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(themeToApply);
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  };

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  /* ==========================================================================
     2. Mobile Navigation & Hamburger Menu
     ========================================================================== */
  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      hamburgerBtn.classList.remove('active');
      navMenu.classList.remove('active');

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
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navLink) {
          navLinks.forEach((l) => l.classList.remove('active'));
          navLink.classList.add('active');
        }
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
    threshold: 0.2
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

  const renderErrorState = (errorMessage, username) => {
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
      // 직전 이름으로 되돌아간다. (Rate Limit 재시도는 이름이 그대로라 그대로 동작한다)
      retryBtn.addEventListener('click', () => {
        const current = githubUsernameInput ? githubUsernameInput.value.trim() : '';
        fetchGitHubProjects(current || username);
      });
    }
  };

  const renderEmptyState = () => {
    projectsContainer.innerHTML = `
      <div class="state-box">
        <i class="fa-solid fa-folder-open"></i>
        <h3>표시할 프로젝트가 없습니다</h3>
        <p>해당 조건에 일치하는 저장소가 존재하지 않습니다.</p>
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

  const filterAndRenderRepos = () => {
    if (currentFilter === 'all') {
      renderProjectsGrid(repositoriesState);
      return;
    }

    const filtered = repositoriesState.filter((repo) => {
      if (!repo.language) return false;
      const repoLang = repo.language.toLowerCase();
      if (currentFilter === 'html') {
        return repoLang === 'html' || repoLang === 'css';
      }
      return repoLang === currentFilter;
    });

    renderProjectsGrid(filtered);
  };

  const fetchGitHubProjects = async (username = 'Rara-rookie') => {
    if (!username.trim()) {
      renderErrorState('올바른 GitHub 사용자명을 입력하세요.', username);
      return;
    }

    renderLoadingState();

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?sort=updated&per_page=12`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`사용자 '${username}'을(를) 찾을 수 없습니다.`);
        } else if (response.status === 403) {
          throw new Error('API 호출 한도(Rate Limit)가 초과되었습니다. 잠시 후 다시 시도해 주세요.');
        } else {
          throw new Error(`GitHub API 오류가 발생했습니다 (HTTP ${response.status}).`);
        }
      }

      const repos = await response.json();
      repositoriesState = repos;
      filterAndRenderRepos();
    } catch (error) {
      renderErrorState(error.message || '네트워크 연결 상태를 확인하세요.', username);
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
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.getAttribute('data-filter');
      filterAndRenderRepos();
    });
  });

  /* ==========================================================================
     6. Contact Form Validation & State Feedback
     ========================================================================== */
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const clearFormErrors = () => {
    nameInput.classList.remove('invalid');
    emailInput.classList.remove('invalid');
    messageInput.classList.remove('invalid');
    nameError.textContent = '';
    emailError.textContent = '';
    messageError.textContent = '';
    formSuccess.classList.add('hidden');
  };

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors();

    let isValid = true;

    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      nameInput.classList.add('invalid');
      nameError.textContent = '이름을 입력해 주세요.';
      isValid = false;
    }

    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      emailInput.classList.add('invalid');
      emailError.textContent = '이메일을 입력해 주세요.';
      isValid = false;
    } else if (!validateEmail(emailVal)) {
      emailInput.classList.add('invalid');
      emailError.textContent = '올바른 이메일 형식이 아닙니다 (예: name@domain.com).';
      isValid = false;
    }

    const messageVal = messageInput.value.trim();
    if (!messageVal) {
      messageInput.classList.add('invalid');
      messageError.textContent = '메시지 내용을 입력해 주세요.';
      isValid = false;
    }

    if (isValid) {
      formSuccess.classList.remove('hidden');
      contactForm.reset();
      
      setTimeout(() => {
        formSuccess.classList.add('hidden');
      }, 5000);
    }
  });

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) {
      nameInput.classList.remove('invalid');
      nameError.textContent = '';
    }
  });

  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value.trim())) {
      emailInput.classList.remove('invalid');
      emailError.textContent = '';
    }
  });

  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) {
      messageInput.classList.remove('invalid');
      messageError.textContent = '';
    }
  });

  /* ==========================================================================
     7. Initialization
     ========================================================================== */
  initTheme();
  loadProfileFromFile();
});
