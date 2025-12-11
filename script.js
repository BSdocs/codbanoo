// script.js

document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    setupTerminalTyping();
    setupScrollAnimations();
    setupTestimonials();
    loadImagesFromJSON();
});

/* =========================
   Navigation / Mobile Menu
   ========================= */

function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    const closeBtn = document.querySelector(".mobile-close");

    if (!toggle || !mobileNav) return;

    const openNav = () => {
        mobileNav.classList.add("is-open");
        document.body.classList.add("nav-open");
    };

    const closeNav = () => {
        mobileNav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
    };

    toggle.addEventListener("click", openNav);
    closeBtn && closeBtn.addEventListener("click", closeNav);

    mobileNav.addEventListener("click", (e) => {
        if (e.target === mobileNav) {
            closeNav();
        }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNav);
    });
}

/* =========================
   Terminal Typing Animation
   ========================= */

function setupTerminalTyping() {
    const codeEl = document.querySelector("#terminalText");
    if (!codeEl) return;

    const codeLines = [
        "# mobile_photos_organizer.py",
        "",
        "from pathlib import Path",
        "from datetime import datetime",
        "",
        "downloads = Path.home() / \"Downloads\"",
        "photos_root = Path.home() / \"Pictures\" / \"mobile\"",
        "current_year = datetime.now().year",
        "",
        "for file in downloads.iterdir():",
        "    if file.suffix.lower() in {'.jpg', '.jpeg', '.png', '.heic'}:",
        "        taken = datetime.fromtimestamp(file.stat().st_mtime)",
        "        if taken.year == current_year:",
        "            month = taken.strftime('%m')",
        "            target = photos_root / str(current_year) / month",
        "            target.mkdir(parents=True, exist_ok=True)",
        "            file.rename(target / file.name)",
        "",
        "# one script, a clean photo library ✨"
    ];

    const fullText = codeLines.join("\n");
    let index = 0;

    const type = () => {
        index++;
        codeEl.textContent = fullText.slice(0, index);
        if (index < fullText.length) {
            const delay = fullText[index - 1] === "\n" ? 80 : 25;
            setTimeout(type, delay);
        }
    };

    type();
}

/* =========================
   Scroll Animations
   ========================= */

function setupScrollAnimations() {
    const observed = document.querySelectorAll(".fade-in-up");
    if (!("IntersectionObserver" in window) || observed.length === 0) {
        observed.forEach((el) => el.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    observed.forEach((el) => observer.observe(el));
}

function setupTestimonials() {
    const slider = document.querySelector(".testimonials-slider");
    const cards = Array.from(document.querySelectorAll(".testimonial-card"));
    const dots = Array.from(document.querySelectorAll(".testimonial-dots .dot"));

    if (!slider || cards.length === 0 || dots.length === 0) return;

    let index = 0;
    let timer = null;

    // برای تشخیص اینکه کاربر در حال تعامل است یا نه
    let isHover = false;      // برای دسکتاپ
    let isTouching = false;   // برای موبایل
    let startX = 0;
    let deltaX = 0;

    const AUTO_DELAY = 8000;   // فاصله زمانی بین اسلایدها (میلی‌ثانیه)
    const SWIPE_THRESHOLD = 40; // حداقل جابجایی انگشت برای تشخیص سوایپ

    // نمایش یک اسلاید (با لوپ بی‌نهایت)
    const show = (i) => {
        const total = cards.length;
        index = (i + total) % total;  // این خط حلقه بی‌نهایت را تضمین می‌کند

        cards.forEach((card, idx) =>
            card.classList.toggle("is-active", idx === index)
        );
        dots.forEach((dot, idx) =>
            dot.classList.toggle("is-active", idx === index)
        );
    };

    const next = () => show(index + 1);
    const prev = () => show(index - 1);

    const stopAuto = () => {
        if (timer) clearInterval(timer);
        timer = null;
    };

    const startAuto = () => {
        stopAuto();
        timer = setInterval(() => {
            // فقط وقتی که کاربر در حال تعامل نباشد
            if (!isHover && !isTouching) {
                next();
            }
        }, AUTO_DELAY);
    };

    // کلیک روی دات‌ها (هم دسکتاپ هم موبایل)
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const i = Number(dot.dataset.index || "0");
            show(i);
            startAuto();
        });
    });

    // توقف خودکار وقتی موس روی اسلایدر است (دسکتاپ)
    slider.addEventListener("mouseenter", () => {
        isHover = true;
    });

    slider.addEventListener("mouseleave", () => {
        isHover = false;
    });

    // سوایپ افقی روی موبایل
    slider.addEventListener(
        "touchstart",
        (e) => {
            if (e.touches.length !== 1) return;
            isTouching = true;
            startX = e.touches[0].clientX;
            deltaX = 0;
        },
        { passive: true }
    );

    slider.addEventListener(
        "touchmove",
        (e) => {
            if (!isTouching) return;
            deltaX = e.touches[0].clientX - startX;
        },
        { passive: true }
    );

    slider.addEventListener("touchend", () => {
        if (!isTouching) return;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            if (deltaX < 0) {
                // سوایپ به چپ → نظر بعدی
                next();
            } else {
                // سوایپ به راست → نظر قبلی
                prev();
            }
        }

        isTouching = false;
        deltaX = 0;
        startAuto(); // بعد از سوایپ دوباره اسلاید خودکار را راه‌اندازی کن
    });

    // شروع اولیه
    show(0);
    startAuto();
}


// =========================
// Testimonials carousel
// =========================

const slider = document.querySelector(".testimonials-slider");
const testimonialCards = Array.from(document.querySelectorAll(".testimonial-card"));
const testimonialDots = Array.from(document.querySelectorAll(".testimonial-dots .dot"));
const prevTestimonialBtn = document.querySelector(".testimonial-prev");
const nextTestimonialBtn = document.querySelector(".testimonial-next");

const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

let currentTestimonial = 0;
let testimonialTimer;
let isUserInteracting = false;

/* ---------- ۱) لوپ مخفی در موبایل (اسکرول افقی بینهایت) ---------- */

let mobileLoopWidth = 0;

if (slider && isMobile()) {
    // یک‌بار دیگر کارت‌ها را کپی می‌کنیم تا حلقه بسازیم
    const originals = Array.from(slider.children);
    originals.forEach(card => slider.appendChild(card.cloneNode(true)));

    // نصفِ کل اسکرول‌ویدث = طول مجموعه‌ی اصلی
    mobileLoopWidth = slider.scrollWidth / 2;

    slider.addEventListener("scroll", () => {
        if (!mobileLoopWidth) return;
        if (slider.scrollLeft >= mobileLoopWidth) {
            slider.scrollLeft -= mobileLoopWidth; // برگشت نامحسوس به اول
        } else if (slider.scrollLeft <= 0) {
            slider.scrollLeft += mobileLoopWidth;
        }
    });
}

/* ---------- ۲) چیدمان سه‌لایه در دسکتاپ ---------- */

function layoutTestimonials() {
    const total = testimonialCards.length;
    if (!total || !slider) return;

    // در موبایل از اسکرول افقی استفاده می‌کنیم، نه این چیدمان
    if (isMobile()) {
        testimonialDots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentTestimonial);
        });
        return;
    }

    testimonialCards.forEach((card, index) => {
        const rawOffset = index - currentTestimonial;
        let offset = rawOffset;

        // حلقه‌ای کردن ترتیب
        if (rawOffset > total / 2) offset = rawOffset - total;
        if (rawOffset < -total / 2) offset = rawOffset + total;

        let shift = 0;
        let scale = 0.8;
        let opacity = 0;
        let z = 0;

        if (offset === 0) {
            // کارت وسط (بزرگ)
            shift = 0;
            scale = 1;
            opacity = 1;
            z = 3;
            card.style.pointerEvents = "auto";
        } else if (offset === 1 || offset === -1) {
            // دو تای کناری
            shift = -offset * 140; // RTL
            scale = 0.9;
            opacity = 0.9;
            z = 2;
            card.style.pointerEvents = "auto";
        } else if (offset === 2 || offset === -2) {
            // دو تای بعدی
            shift = -offset * 220;
            scale = 0.8;
            opacity = 0.6;
            z = 1;
            card.style.pointerEvents = "none";
        } else {
            // بقیه پنهان
            shift = -offset * 260;
            scale = 0.75;
            opacity = 0;
            z = 0;
            card.style.pointerEvents = "none";
        }

        card.style.setProperty("--shift", shift + "px");
        card.style.setProperty("--scale", scale);
        card.style.setProperty("--opacity", opacity);
        card.style.setProperty("--z", z);
    });

    testimonialDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentTestimonial);
    });
}

function goToTestimonial(index) {
    const total = testimonialCards.length;
    currentTestimonial = (index + total) % total;
    layoutTestimonials();
}

function nextTestimonial() {
    goToTestimonial(currentTestimonial + 1);
}

function prevTestimonial() {
    goToTestimonial(currentTestimonial - 1);
}

/* ---------- ۳) اسکرول افقی در موبایل ---------- */

function scrollMobile(direction) {
    if (!slider) return;
    const card = slider.querySelector(".testimonial-card");
    if (!card) return;

    const gap = 12; // حدود فاصله بین کارت‌ها
    const step = card.offsetWidth + gap;

    slider.scrollBy({
        left: direction === "next" ? step : -step,
        behavior: "smooth"
    });
}

/* ---------- ۴) کنترل اسلاید خودکار + مکث هنگام تعامل ---------- */

function startAuto() {
    if (testimonialTimer) clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => {
        // فقط وقتی که کاربر در حال تعامل نباشد و روی دسکتاپ باشیم
        if (!isUserInteracting && !isMobile()) {
            nextTestimonial();
        }
    }, 8000);
}

function stopAuto() {
    if (testimonialTimer) clearInterval(testimonialTimer);
}

/* ---------- ۵) راه‌اندازی و لیسنرها ---------- */

if (testimonialCards.length) {
    layoutTestimonials();
    startAuto();

    // دات‌ها
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            isUserInteracting = true;
            goToTestimonial(index);
            startAuto();
        });
    });

    // کارت‌ها
    testimonialCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            // روی موبایل کلیک فقط اسکرول نمی‌کند؛ ولی اشکالی ندارد
            isUserInteracting = true;
            goToTestimonial(index);
            startAuto();
        });
    });

    // فلش‌ها
    if (nextTestimonialBtn) {
        nextTestimonialBtn.addEventListener("click", () => {
            isUserInteracting = true;
            if (isMobile()) {
                scrollMobile("next");
            } else {
                nextTestimonial();
            }
            startAuto();
        });
    }

    if (prevTestimonialBtn) {
        prevTestimonialBtn.addEventListener("click", () => {
            isUserInteracting = true;
            if (isMobile()) {
                scrollMobile("prev");
            } else {
                prevTestimonial();
            }
            startAuto();
        });
    }

    // مکث/ادامه‌ی خودکار با Hover و Touch
    const interactiveElems = [slider, prevTestimonialBtn, nextTestimonialBtn, ...testimonialCards, ...testimonialDots].filter(Boolean);

    interactiveElems.forEach(el => {
        el.addEventListener("mouseenter", () => {
            isUserInteracting = true;
        });
        el.addEventListener("mouseleave", () => {
            isUserInteracting = false;
        });
        el.addEventListener("touchstart", () => {
            isUserInteracting = true;
        }, { passive: true });
        el.addEventListener("touchend", () => {
            isUserInteracting = false;
        }, { passive: true });
    });
}

/* =========================
   Load Images from links.json
   ========================= */

function loadImagesFromJSON() {
    fetch("links.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error("links.json not found");
            }
            return res.json();
        })
        .then((map) => {
            // برای <img data-image-key="...">
            document
                .querySelectorAll("img[data-image-key]")
                .forEach((img) => {
                    const key = img.getAttribute("data-image-key");
                    const url = map[key];
                    if (url) {
                        img.src = url;
                    }
                });

            // در صورت نیاز برای بک‌گراندها به data-bg-key
            document
                .querySelectorAll("[data-bg-key]")
                .forEach((el) => {
                    const key = el.getAttribute("data-bg-key");
                    const url = map[key];
                    if (url) {
                        el.style.backgroundImage = `url('${url}')`;
                    }
                });
        })
        .catch((err) => {
            console.warn("Could not load links.json:", err);
        });
}
