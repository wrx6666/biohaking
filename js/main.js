function setHeaderActive(hash) {
  document.querySelectorAll('.site-nav-link').forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === hash);
  });
}

function initStackedScroll() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canUseStack = window.matchMedia('(min-width: 1100px) and (min-height: 620px)').matches;
  const panels = Array.from(document.querySelectorAll('.stack-section'));

  if (reduceMotion || !canUseStack || panels.length < 2) {
    return;
  }

  const stage = document.createElement('div');
  const viewport = document.createElement('div');
  const firstPanel = panels[0];

  stage.className = 'scroll-stack-stage';
  viewport.className = 'scroll-stack-viewport';
  stage.style.setProperty('--panel-count', panels.length);

  firstPanel.parentNode.insertBefore(stage, firstPanel);
  stage.appendChild(viewport);

  panels.forEach((panel, index) => {
    panel.classList.add('scroll-stack-panel');
    panel.style.zIndex = String(20 + index);
    viewport.appendChild(panel);
  });

  document.body.classList.add('stack-scroll-enabled');

  let stageTop = 0;
  let stageEnd = 0;
  let targetProgress = 0;
  let easedProgress = 0;
  let animationFrame = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const getStackTop = () => {
    const styles = getComputedStyle(document.documentElement);
    const headerTop = Number.parseFloat(styles.getPropertyValue('--header-top'));
    const headerHeight = Number.parseFloat(styles.getPropertyValue('--header-height'));
    const headerClearance = Number.parseFloat(styles.getPropertyValue('--header-clearance'));
    const value = headerTop + headerHeight + headerClearance;
    return Number.isFinite(value) ? value : 98;
  };

  function measure() {
    const rect = stage.getBoundingClientRect();
    stageTop = window.scrollY + rect.top - getStackTop();
    stageEnd = stageTop + (panels.length - 1) * window.innerHeight * 0.9;
    stage.style.height = `${(panels.length - 1) * 90 + 100}vh`;
  }

  function getPanelScrollY(index) {
    const normalizedIndex = clamp(index, 0, panels.length - 1);
    const segment = window.innerHeight * 0.9;
    return stageTop + normalizedIndex * segment;
  }

  function updateTargetProgress() {
    const total = Math.max(stageEnd - stageTop, 1);
    const rawProgress = clamp((window.scrollY - stageTop) / total, 0, 1);
    targetProgress = rawProgress * (panels.length - 1);
  }

  function render(progress) {
    const activeIndex = Math.max(0, Math.min(Math.round(progress), panels.length - 1));
    let activePanel = panels[activeIndex];

    if (!activePanel.id) {
      for (let index = activeIndex; index >= 0; index -= 1) {
        if (panels[index].id) {
          activePanel = panels[index];
          break;
        }
      }
    }

    if (window.scrollY < stageTop - 2) {
      setHeaderActive('#');
    } else if (activePanel && activePanel.id) {
      setHeaderActive(`#${activePanel.id}`);
    }

    panels.forEach((panel, index) => {
      let y = 104;
      let scale = 1;

      if (index === 0) {
        y = 0;
      } else {
        const entry = clamp(progress - (index - 1), 0, 1);
        y = (1 - entry) * 104;
      }

      const nextEntry = clamp(progress - index, 0, 1);
      if (nextEntry > 0 && index < panels.length - 1) {
        scale = 1 - nextEntry * 0.018;
      }

      panel.style.transform = `translate3d(0, ${y}%, 0) scale(${scale})`;
      panel.style.opacity = '1';
    });
  }

  function tick() {
    easedProgress += (targetProgress - easedProgress) * 0.18;
    render(easedProgress);

    if (Math.abs(targetProgress - easedProgress) > 0.002) {
      animationFrame = window.requestAnimationFrame(tick);
    } else {
      easedProgress = targetProgress;
      render(easedProgress);
      animationFrame = null;
    }
  }

  function requestRender() {
    updateTargetProgress();

    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(tick);
  }

  measure();
  updateTargetProgress();
  easedProgress = targetProgress;
  render(easedProgress);

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    requestRender();
  }, { passive: true });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash) {
      return;
    }

    if (hash === '#') {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    const target = document.querySelector(hash);
    const panelIndex = panels.indexOf(target);

    if (panelIndex === -1) {
      return;
    }

    event.preventDefault();
    measure();

    window.scrollTo({
      top: getPanelScrollY(panelIndex),
      behavior: 'smooth'
    });

    history.replaceState(null, '', hash);
    updateTargetProgress();
    requestRender();
  });
}

function initHeaderPanel() {
  function updateHeaderState() {
    const scrollPosition = window.scrollY;
    document.body.classList.toggle('header-condensed', scrollPosition > 24);

    if (scrollPosition < 80) {
      setHeaderActive('#');
    }
  }

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  window.addEventListener('resize', updateHeaderState, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeaderPanel();
  initStackedScroll();

  const scoreValue = document.querySelector('.health-score-value');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (scoreValue && !reduceMotion) {
    const targetScore = Number.parseFloat(scoreValue.dataset.score || scoreValue.textContent);
    const startScore = Math.max(targetScore - 4.4, 0);
    const duration = 760;
    const startTime = performance.now();

    const easeOut = (progress) => 1 - Math.pow(1 - progress, 3);

    function renderScore(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = startScore + (targetScore - startScore) * easeOut(progress);
      scoreValue.textContent = value.toFixed(1);

      if (progress < 1) {
        window.requestAnimationFrame(renderScore);
      }
    }

    window.requestAnimationFrame(renderScore);
  }

  const whoChips = document.querySelectorAll('.quiz-chip-who');
  const needChips = document.querySelectorAll('.quiz-chip-need');
  const btnChatYes = document.getElementById('btn-chat-yes');
  const btnChatNo = document.getElementById('btn-chat-no');
  const recFormat = document.getElementById('recommendation-format');
  const recDesc = document.getElementById('recommendation-desc');

  let selectedWho = 'family';
  let selectedNeed = 'hormones';
  let chatRegular = true;

  function updateRecommendation() {
    if (selectedWho === 'family' || chatRegular) {
      if (selectedWho === 'family' && (selectedNeed === 'age' || selectedNeed === 'seniors')) {
        recFormat.textContent = 'VIP (Семейный максимум)';
        recDesc.textContent = 'Полное медицинское кураторство семьи из нескольких поколений, персональный ассистент здоровья, приоритетные консилиумы и координация обследований.';
      } else {
        recFormat.textContent = 'Premium (Расширенный)';
        recDesc.textContent = 'Глубокая работа с гормональным статусом, метаболизмом, энергией и постоянная связь с семейным врачом в чате для своевременной коррекции.';
      }
    } else {
      recFormat.textContent = 'Basic (Профилактический)';
      recDesc.textContent = 'Плановый контроль дефицитов, регулярные чек-апы и разовые экспертные консультации для поддержания стабильного ресурса организма.';
    }
  }

  whoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      whoChips.forEach(c => {
        c.classList.remove('bg-forest', 'text-white', 'border-forest', 'shadow-sm');
        c.classList.add('bg-white', 'text-forest', 'border-clinical-border');
      });
      chip.classList.add('bg-forest', 'text-white', 'border-forest', 'shadow-sm');
      chip.classList.remove('bg-white', 'text-forest', 'border-clinical-border');
      selectedWho = chip.dataset.value;
      updateRecommendation();
    });
  });

  needChips.forEach(chip => {
    chip.addEventListener('click', () => {
      needChips.forEach(c => {
        c.classList.remove('bg-forest', 'text-white', 'border-forest', 'shadow-sm');
        c.classList.add('bg-white', 'text-forest', 'border-clinical-border');
      });
      chip.classList.add('bg-forest', 'text-white', 'border-forest', 'shadow-sm');
      chip.classList.remove('bg-white', 'text-forest', 'border-clinical-border');
      selectedNeed = chip.dataset.value;
      updateRecommendation();
    });
  });

  btnChatYes.addEventListener('click', () => {
    chatRegular = true;
    btnChatYes.className = 'px-5 py-2 rounded-lg text-[13px] font-bold bg-forest text-white transition-all';
    btnChatNo.className = 'px-5 py-2 rounded-lg text-[13px] font-semibold text-clinical-subtle hover:text-forest transition-all';
    updateRecommendation();
  });

  btnChatNo.addEventListener('click', () => {
    chatRegular = false;
    btnChatNo.className = 'px-5 py-2 rounded-lg text-[13px] font-bold bg-forest text-white transition-all';
    btnChatYes.className = 'px-5 py-2 rounded-lg text-[13px] font-semibold text-clinical-subtle hover:text-forest transition-all';
    updateRecommendation();
  });
});

const consultationForm = document.getElementById('consultation-form');
if (consultationForm) {
  consultationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Заявка принята. Медицинский координатор свяжется с вами в течение 15 минут.');
  });
}

