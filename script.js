// script.js

document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    setupTerminalTyping();
    setupScrollAnimations();
    setupTestimonialsCarousel();
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
   function wrapTerminalCode(text, maxChars) {
    const lines = text.split("\n");
    const out = [];

    for (const line of lines) {
        if (!line.trim()) {
            out.push(line);
            continue;
        }

        const indentMatch = line.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : "";
        const content = line.slice(indent.length);

        const words = content.split(" ");
        let current = indent;

        for (const word of words) {
            const candidate = (current.trim() === indent.trim() ? indent + word : current + " " + word);

            if (candidate.length <= maxChars) {
                current = candidate;
            } else {
                // خط قبلی را ببند
                out.push(current);
                // کلمه را کامل به خط بعد ببر (بدون نصف شدن)
                current = indent + word;
            }
        }

        out.push(current);
    }

    return out.join("\n");
}

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
        "        mtime = file.stat().st_mtime",
        "        taken = datetime.fromtimestamp(mtime)",
        "        if taken.year == current_year:",
        "            month = taken.strftime('%m')",
        "            target = photos_root / str(current_year) / month",
        "            target.mkdir(parents=True, exist_ok=True)",
        "            file.rename(target / file.name)",
        "",
        "# one script, a clean photo library ✨"
    ];

    const fullText = codeLines.join("\n");
    // فقط روی نسخه‌های ریسپانسیو (موبایل/تبلت)
    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    const finalText = isMobile ? wrapTerminalCode(fullText, 44) : fullText;
    let index = 0;

    const type = () => {
        index++;
        codeEl.textContent = finalText.slice(0, index);
        if (index < finalText.length) {
            const delay = finalText[index - 1] === "\n" ? 80 : 25;
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

function setupTestimonialsCarousel() {
    const slider = document.querySelector(".testimonials-slider");
    const testimonialCards = Array.from(document.querySelectorAll(".testimonial-card"));
    const testimonialDots = Array.from(document.querySelectorAll(".testimonial-dots .dot"));
    const prevTestimonialBtn = document.querySelector(".testimonial-prev");
    const nextTestimonialBtn = document.querySelector(".testimonial-next");

    if (!slider || testimonialCards.length === 0) return;

    const mobileMQ = window.matchMedia("(max-width: 768px)");

    let currentTestimonial = 0;
    let testimonialTimer = null;
    let isUserInteracting = false;

    const AUTO_DELAY = 8000;

    function setDots() {
        if (!testimonialDots.length) return;
        testimonialDots.forEach((dot, i) => dot.classList.toggle("is-active", i === currentTestimonial));
    }

    function layoutTestimonials() {
        const total = testimonialCards.length;
        if (!total) return;

        // موبایل: چیدمان را CSS انجام می‌دهد (اسکرول افقی)
        if (mobileMQ.matches) {
            setDots();
            return;
        }

        testimonialCards.forEach((card, index) => {
            const rawOffset = index - currentTestimonial;
            let offset = rawOffset;

            // حلقه‌ای کردن ترتیب (برای چیدمان سه‌لایه)
            if (rawOffset > total / 2) offset = rawOffset - total;
            if (rawOffset < -total / 2) offset = rawOffset + total;

            let shift = 0;
            let scale = 0.8;
            let opacity = 0;
            let z = 0;

            if (offset === 0) {
                shift = 0;
                scale = 1;
                opacity = 1;
                z = 3;
                card.style.pointerEvents = "auto";
            } else if (offset === 1 || offset === -1) {
                shift = -offset * 140; // RTL
                scale = 0.9;
                opacity = 0.9;
                z = 2;
                card.style.pointerEvents = "auto";
            } else if (offset === 2 || offset === -2) {
                shift = -offset * 220;
                scale = 0.8;
                opacity = 0.6;
                z = 1;
                card.style.pointerEvents = "none";
            } else {
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

        setDots();
    }

    function goToTestimonial(i) {
        const total = testimonialCards.length;
        currentTestimonial = (i + total) % total;
        layoutTestimonials();
    }

    function nextTestimonial() {
        goToTestimonial(currentTestimonial + 1);
    }

    function prevTestimonial() {
        goToTestimonial(currentTestimonial - 1);
    }

    // موبایل: اسکرول افقی با دکمه‌ها
    function scrollMobile(direction) {
        const card = slider.querySelector(".testimonial-card");
        if (!card) return;

        const gap = 12;
        const step = card.offsetWidth + gap;
        const isRTL = getComputedStyle(document.documentElement).direction === "rtl";
        const delta = (direction === "next" ? step : -step) * (isRTL ? -1 : 1);
        
        slider.scrollBy({
          left: delta,
          behavior: "smooth"
        });
        
    }

    function startAuto() {
        stopAuto();
        testimonialTimer = setInterval(() => {
            if (!isUserInteracting && !mobileMQ.matches) {
                nextTestimonial();
            }
        }, AUTO_DELAY);
    }

    function stopAuto() {
        if (testimonialTimer) clearInterval(testimonialTimer);
        testimonialTimer = null;
    }

    // --- دات‌ها
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            isUserInteracting = true;
            goToTestimonial(index);
            startAuto();
        });
    });

    // --- کلیک روی کارت‌ها (دسکتاپ: بیا وسط)
    testimonialCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            isUserInteracting = true;
            goToTestimonial(index);
            startAuto();
        });
    });

    // --- فلش‌ها (موبایل: اسکرول / دسکتاپ: چیدمان)
    if (nextTestimonialBtn) {
        nextTestimonialBtn.addEventListener("click", () => {
            isUserInteracting = true;
            if (mobileMQ.matches) scrollMobile("next");
            else nextTestimonial();
            startAuto();
        });
    }

    if (prevTestimonialBtn) {
        prevTestimonialBtn.addEventListener("click", () => {
            isUserInteracting = true;
            if (mobileMQ.matches) scrollMobile("prev");
            else prevTestimonial();
            startAuto();
        });
    }

    // --- موبایل: وقتی کاربر دستی اسکرول کرد، دات فعال هماهنگ شود
    let scrollRAF = null;
    slider.addEventListener("scroll", () => {
        if (!mobileMQ.matches) return;

        isUserInteracting = true;

        if (scrollRAF) cancelAnimationFrame(scrollRAF);
        scrollRAF = requestAnimationFrame(() => {
            const cards = Array.from(slider.querySelectorAll(".testimonial-card"));
            const sliderRect = slider.getBoundingClientRect();
            const center = sliderRect.left + sliderRect.width / 2;

            let bestIndex = 0;
            let bestDist = Infinity;

            cards.forEach((c, i) => {
                const r = c.getBoundingClientRect();
                const cCenter = r.left + r.width / 2;
                const dist = Math.abs(center - cCenter);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIndex = i;
                }
            });

            // چون در موبایل clone نداریم، bestIndex همان index واقعی است
            currentTestimonial = Math.min(bestIndex, testimonialCards.length - 1);
            setDots();
        });
    }, { passive: true });

    // --- مکث تعامل
    const interactiveElems = [slider, prevTestimonialBtn, nextTestimonialBtn, ...testimonialCards, ...testimonialDots].filter(Boolean);

    interactiveElems.forEach((el) => {
        el.addEventListener("mouseenter", () => { isUserInteracting = true; });
        el.addEventListener("mouseleave", () => { isUserInteracting = false; });
        el.addEventListener("touchstart", () => { isUserInteracting = true; }, { passive: true });
        el.addEventListener("touchend", () => { isUserInteracting = false; }, { passive: true });
    });

    // اگر اندازه عوض شد (چرخش موبایل/ریسایز)، دوباره layout کن
    mobileMQ.addEventListener?.("change", () => {
        layoutTestimonials();
        startAuto();
    });

    // شروع
    layoutTestimonials();
    startAuto();
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
// =========================
// نوار پیشرفت اسکرول
// =========================
(function () {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + "%";
    }

    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress();
})();
