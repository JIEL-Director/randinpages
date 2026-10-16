/* AI력 사무소 랜딩 — 화면을 움직이는 코드
   1. 스크롤하면 상단 메뉴에 그림자
   2. 지금 보는 섹션을 메뉴에 표시
   3. 섹션이 화면에 들어오면 부드럽게 나타나기
   4. 히어로의 대화 예시를 실제 대화처럼 재생
   5. 고객 정보 가명 처리 미리 보기
   컴퓨터에서 「움직임 줄이기」를 켠 사용자에게는 애니메이션 없이 결과만 보여 준다. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------- 1. 상단 메뉴 그림자 ---------- */
const header = document.querySelector('.site-header');

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();


/* ---------- 2. 지금 보는 섹션을 메뉴에 표시 ---------- */
// 화면 한가운데 가는 띠를 지나는 섹션이 「지금 보는 섹션」이다
const navLinks = document.querySelectorAll('.site-nav a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
      link.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  });
}, { rootMargin: '-45% 0px -54% 0px' });

document.querySelectorAll('main > section[id]').forEach((section) => navObserver.observe(section));


/* ---------- 3. 화면에 들어오면 나타나기 ---------- */
const revealItems = document.querySelectorAll('.reveal');

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // 한 번 나타나면 끝
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach((item) => revealObserver.observe(item));
}


/* ---------- 4. 대화 예시 재생 ---------- */
const chatBox = document.querySelector('[data-chat]');
const bubbles = chatBox.querySelectorAll('[data-chat-step]');
const typing = chatBox.querySelector('.typing');
const replayButton = document.querySelector('[data-chat-replay]');
let chatTimers = [];

function later(action, ms) {
  chatTimers.push(setTimeout(action, ms));
}

// 말풍선이 하나씩 늘 때 아래 내용이 들썩이지 않게, 다 보였을 때의 높이를 미리 잡아 둔다
function lockChatHeight() {
  chatBox.style.minHeight = '';
  bubbles.forEach((bubble) => bubble.classList.add('is-shown'));
  typing.hidden = true;
  chatBox.style.minHeight = chatBox.offsetHeight + 'px';
}

function playChat() {
  chatTimers.forEach(clearTimeout);
  chatTimers = [];
  lockChatHeight();
  if (reduceMotion) return; // 다 보인 상태로 둔다

  bubbles.forEach((bubble) => bubble.classList.remove('is-shown'));

  let time = 400;
  bubbles.forEach((bubble) => {
    // 상대가 답할 차례면 「입력 중」을 먼저 보여 준다
    if (bubble.classList.contains('bubble-them')) {
      later(() => { typing.hidden = false; }, time);
      time += 1100;
    }
    later(() => {
      typing.hidden = true;
      bubble.classList.add('is-shown');
    }, time);
    time += 900;
  });
}

replayButton.hidden = false;
replayButton.addEventListener('click', playChat);
playChat();


/* ---------- 5. 가명 처리 미리 보기 ---------- */
const maskButton = document.querySelector('[data-mask-toggle]');
const maskTitle = document.querySelector('[data-mask-title]');
const privateParts = document.querySelectorAll('[data-mask]');
let masked = false;

// 원래 글자를 기억해 둔다
privateParts.forEach((part) => {
  part.dataset.original = part.textContent;
});

maskButton.hidden = false;
maskButton.addEventListener('click', () => {
  masked = !masked;
  maskButton.textContent = masked ? '원래 메시지 보기' : 'AI에 넣기 전 모습 보기';
  maskTitle.textContent = masked ? 'AI에 넣는 메시지' : '사장님이 보내신 메시지';
  privateParts.forEach((part) => {
    part.textContent = masked ? part.dataset.mask : part.dataset.original;
    part.classList.toggle('is-masked', masked);
  });
});
