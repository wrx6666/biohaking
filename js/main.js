document.addEventListener('DOMContentLoaded', () => {
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

