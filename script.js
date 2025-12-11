// جلوگیری از انتخاب متن با درگ (برای تکمیل UX)
document.addEventListener('dragstart', e => e.preventDefault());

/* --------- منوی همبرگری با انیمیشن کوچک ---------- */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');

function openMobileMenu() {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburgerBtn.classList.add('close');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburgerBtn.classList.remove('close');
}

if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}
if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}
if (mobileMenu) {
    mobileMenu.addEventListener('click', e => {
        if (e.target === mobileMenu) closeMobileMenu();
    });
}

/* --------- انیمیشن تایپ ترمینال (کدنویسی انگلیسی، چپ‌نویس) ---------- */

const terminalTextElement = document.getElementById('terminalText');

if (terminalTextElement) {
    const terminalLines = [
        "mobile_photos_organizer.py",
        "",
        "from pathlib import Path",
        "from datetime import datetime",
        "",
        "downloads = Path.home() / \"Downloads\"",
        "target    = Path.home() / \"Pictures\" / \"2025\"",
        "",
        "for photo in downloads.glob('*.jpg'):",
        "    taken = datetime.fromtimestamp(photo.stat().st_mtime)",
        "    if taken.year == 2025:",
        "        target.mkdir(parents=True, exist_ok=True)",
        "        photo.rename(target / photo.name)",
        "",
        "# organize your mobile photos with one tiny script ✨"
    ];

    const fullText = terminalLines.join("\n");
    let index = 0;

    function typeStep() {
        terminalTextElement.textContent = fullText.slice(0, index++);
        if (index <= fullText.length) {
            requestAnimationFrame(typeStep);
        } else {
            // مکث کوتاه و سپس تکرار ملایم
            setTimeout(() => {
                index = 0;
                typeStep();
            }, 3500);
        }
    }
    typeStep();
}

/* --------- اسلایدر نظرات با ۷ کارت، سه‌تایی دسکتاپ / تکی موبایل + لوپ ---------- */

const track = document.getElementById('testimonialsTrack');
const cards = track ? Array.from(track.querySelectorAll('.testimonial-card')) : [];
const prevBtn = document.getElementById('testimonialPrev');
const nextBtn = document.getElementById('testimonialNext');
const dotsContainer = document.getElementById('testimonialDots');

let testimonialIndex = 0;

function updateTestimonials() {
    if (!cards.length) return;

    cards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === testimonialIndex) {
            card.classList.add('active');
        }
    });

    if (dotsContainer) {
        const dotButtons = Array.from(dotsContainer.querySelectorAll('button'));
        dotButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === testimonialIndex);
        });
    }
}

function changeTestimonial(step) {
    if (!cards.length) return;
    testimonialIndex = (testimonialIndex + step + cards.length) % cards.length;
    updateTestimonials();
}

if (dotsContainer && cards.length) {
    cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            testimonialIndex = idx;
            updateTestimonials();
        });
        dotsContainer.appendChild(dot);
    });
}

if (prevBtn) prevBtn.addEventListener('click', () => changeTestimonial(-1));
if (nextBtn) nextBtn.addEventListener('click', () => changeTestimonial(1));

updateTestimonials();

/* سوایپ برای موبایل */
if (track && cards.length) {
    let startX = null;

    track.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
        }
    });

    track.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        const threshold = 40; // حداقل فاصله برای سوایپ

        if (Math.abs(dx) > threshold) {
            if (dx < 0) {
                changeTestimonial(1);  // سوایپ چپ -> نظر بعدی
            } else {
                changeTestimonial(-1); // سوایپ راست -> نظر قبلی
            }
        }
        startX = null;
    });
}
