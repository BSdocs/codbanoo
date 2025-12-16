// script.js

document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    setupTerminalTyping();
    setupScrollAnimations();
    setupTestimonialsCarousel();
    loadImagesFromJSON();
});
// Anti-copy (deterrent) + allow phone/email copy
(() => {
  const REPLACEMENT = "© تمامی حقوق این وب‌سایت برای کُدبانو محفوظ است.";

  const isAllowedTarget = (node) => {
    if (!node) return false;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;

    // هر چیزی که داخل allow-copy باشد، کپی آزاد است
    if (el.closest(".allow-copy")) return true;

    // ورودی‌ها/تکست‌اریاها هم آزاد
    const tag = el.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return true;

    // لینک‌های tel/mailto آزاد
    const a = el.closest("a");
    if (a && (a.href.startsWith("tel:") || a.href.startsWith("mailto:"))) return true;

    return false;
  };

  document.addEventListener("copy", (e) => {
    const sel = window.getSelection();
    const anchorNode = sel && sel.anchorNode;

    if (isAllowedTarget(anchorNode)) return; // اجازه بده متن واقعی کپی بشه

    // در غیر اینصورت: متن جایگزین
    e.preventDefault();
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", REPLACEMENT);
      e.clipboardData.setData("text/html", REPLACEMENT);
    }
  });

  // (اختیاری) راست‌کلیک را هم ببند، ولی روی allow-copy نه
  document.addEventListener("contextmenu", (e) => {
    if (e.target && e.target.closest(".allow-copy")) return;
    e.preventDefault();
  });

  // (اختیاری) Ctrl+C / Cmd+C را هم بگیر، ولی روی allow-copy نه
  document.addEventListener("keydown", (e) => {
    const key = e.key?.toLowerCase();
    const isCopy = (e.ctrlKey || e.metaKey) && key === "c";
    if (!isCopy) return;

    if (e.target && e.target.closest(".allow-copy")) return;
    // جلوگیری از رفتار پیش‌فرض؛ رویداد copy بالا متن جایگزین را ست می‌کند
    e.preventDefault();

    // بعضی مرورگرها وقتی فقط keydown را می‌گیریم، copy را trigger نمی‌کنند:
    // پس اینجا مستقیم می‌نویسیم داخل کلیپ‌بورد (اگر اجازه بده)
    navigator.clipboard?.writeText(REPLACEMENT).catch(() => {});
  });
})();

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

    // نسخه دسکتاپ: هر کد به صورت آرایه خطوط
    const desktopCodes = [
        [/*کد پایتون*/"# mobile_photos_organizer.py", "", "from pathlib import Path", "from datetime import datetime", "", "downloads = Path.home() / \"Downloads\"", "photos_root = Path.home() / \"Pictures\" / \"mobile\"", "current_year = datetime.now().year", "", "for file in downloads.iterdir():", "    if file.suffix.lower() in {'.jpg', '.jpeg', '.png', '.heic'}:", "        mtime = file.stat().st_mtime", "        taken = datetime.fromtimestamp(mtime)", "        if taken.year == current_year:", "            month = taken.strftime('%m')", "            target = photos_root / str(current_year) / month", "            target.mkdir(parents=True, exist_ok=True)", "            file.rename(target / file.name)", "", "# one script, a clean photo library ✨"],
        [/*کد اسمبلی*/"MOV AX, 0      ; Clear AX register", "MOV AH, 09h        ; DOS print string function", "LEA DX, msg        ; Load address of message", "INT 21h            ; Call DOS interrupt", "MOV AH, 4Ch        ; DOS terminate program", "INT 21h            ; Call DOS interrupt", "", "msg DB '> ride on Assembly! <$'", "", "; Data segment (not required for small example)", "; Normally you'd have segments defined", "; but for inline example this is enough", "", "; Additional filler instructions to reach ~18 lines", "MOV CX, 0          ; Clear CX", "INC CX             ; Increment CX", "MOV DX, CX         ; Copy CX to DX", "NOP                ; No operation", "NOP", "NOP", "MOV CX, 0FFFFh ; Mark end of program in CX"],        
        [/*کد سی‌پلاس‌پلاس*/"#include <iostream>", "#include <string>", "#include <vector>", "using namespace std;", "struct Transaction {", "    string description;", "    double amount;", "};", "vector<Transaction> transactions;", "transactions.push_back({\"Salary\", 2500.0});", "transactions.push_back({\"Groceries\", -150.0});", "transactions.push_back({\"Utilities\", -200.0});", "transactions.push_back({\"Coffee\", -5.0});", "double balance = 0;", "for (auto &t : transactions) {", "    balance += t.amount;", "    cout << t.description << \": \" << t.amount << endl;", "}", "cout << \"Current balance: \" << balance << endl;"],
        [/*کد جاوا*/"; Java Home Location Tracker","import java.util.*;","class Location {","  double lat;","  double lon;","  String desc;","  Location(double la, double lo, String d){","    lat=la;","    lon=lo;","    desc=d;","  }","}","public class Main {","  public static void main(String[] args){","    List<Location> locs = new ArrayList<>();","    locs.add(new Location(35.6895,51.389,\"Home\"));","    locs.add(new Location(35.7000,51.400,\"Office\"));","    for(Location l:locs){","      System.out.println(l.desc+\": Lat=\"+l.lat+\", Lon=\"+l.lon);","    }","  }","}"],
        [/*کد Go*/"package main", "import (", "  \"fmt\"", "  \"io/ioutil\"", "  \"net/http\"", ")", "func main() {", "  url := \"https://jsonplaceholder.typicode.com/todos/1\"", "  resp, err := http.Get(url)", "  if err != nil {", "    fmt.Println(\"Error:\", err)", "    return", "  }", "  defer resp.Body.Close()", "  body, err := ioutil.ReadAll(resp.Body)", "  if err != nil {", "    fmt.Println(\"Read Error:\", err)", "    return", "  }", "  fmt.Println(\"API Response:\")", "  fmt.Println(string(body))", "}"],
        [/*کد Swift*/"import Foundation", "let fm = FileManager.default", "let home = fm.homeDirectoryForCurrentUser", "let desktop = home.appendingPathComponent(\"Desktop\")", "do {", "  let items = try fm.contentsOfDirectory(atPath: desktop.path)", "  for i in items {", "    let src = desktop.appendingPathComponent(i)", "    if i.hasSuffix(\".tmp\") || i.hasSuffix(\".log\") {", "      try fm.removeItem(at: src)", "    }", "  }", "} catch {", "  print(\"Error:\", error)", "}"],
        [/*کد Kotlin*/"fun main() {", "  val players = listOf(\"Ali\", \"Sara\", \"Mina\")", "  val actions = mutableListOf<Pair<String,String>>()", "  actions.add(\"Ali\" to \"rolled dice 4\")", "  actions.add(\"Sara\" to \"moved 3 steps\")", "  actions.add(\"Mina\" to \"collected coin\")", "  actions.add(\"Ali\" to \"attacked Sara\")", "  actions.add(\"Sara\" to \"healed 2 points\")", "  actions.add(\"Mina\" to \"rolled dice 6\")", "  actions.add(\"Ali\" to \"found treasure\")", "  actions.add(\"Sara\" to \"skipped turn\")", "  actions.add(\"Mina\" to \"used shield\")", "  for((p,a) in actions) {", "    println(p+\": \"+a)", "  }", "  println(\"Total actions:\", actions.size)", "  println(\"Summary of game:\")", "  for((p,a) in actions) { println(p+\" did \"+a) }", "  println(\"Last action:\", actions.last().second)", "}"],
        [/*کد R*/"library(readxl)", "df <- read_excel(\"codbanoo.xlsx\")", "print(\"Columns:\")", "for(col in names(df)) {", "  print(paste(\"Column:\", col))", "}", "print(\"Summaries:\")", "for(col in names(df)) {", "  print(summary(df[[col]]))", "}", "total_income = 0", "total_expense = 0", "for(col in names(df)) {", "  if(grepl(\"Income\", col)) {", "    total_income = sum(df[[col]], na.rm=TRUE)", "  } else {", "    total_expense = sum(df[[col]], na.rm=TRUE)", "  }", "}", "balance = total_income - total_expense", "print(paste(\"Total Income:\", total_income))", "print(paste(\"Total Expense:\", total_expense))", "print(paste(\"Balance:\", balance))"],
        [/*کد Lua*/"player = {score=0, health=100, coins=50, inventory={}}", "print(\"Initial score:\", player.score)", "print(\"Health:\", player.health)", "print(\"Coins:\", player.coins)", "player.score = player.score + 5000", "player.health = player.health - 10", "table.insert(player.inventory, \"Sword\")", "table.insert(player.inventory, \"Shield\")", "print(\"Updated score:\", player.score)", "print(\"Updated Health:\", player.health)", "print(\"Coins remain:\", player.coins)", "print(\"Inventory:\")", "for i,item in ipairs(player.inventory) do", "  print(i,item)", "end", "player.coins = player.coins + 500", "player.health = player.health + 20", "player.score = player.score + 4999", "print(\"Final stats:\")", "print(player)"]
    ];

    // نسخه موبایل: خطوط کوتاه‌تر
    const mobileCodes = [
        [/*کد جاوااسکریپت*/"if (username.status !== \"banned\") {", "    let getData = prompt(\"Your Key:\");", "} else {", "    console.log(\"NOT MATCH!\");", "} // Welcome to JavaScript😃"],
        [/*Swift موبایل*/"import Foundation", "let batteryLevel = 78", "if batteryLevel > 50 {", "  print(\"Battery is healthy\")", "} else { print(\"Charge soon!\") }"],
        [/*Kotlin موبایل*/"fun main(){", "val players=listOf(\"Ali\",\"Sara\",\"Mina\")", "val actions=mutableListOf(\"roll dice\",\"collect coin\")", "actions.forEach{ println(it) }", "println(\"Players in game:\",players.size) }"],
        [/*R موبایل*/"library(readxl)", "df<-read_excel(\"codbanoo.xlsx\")", "total<-sum(df$Income,na.rm=TRUE)", "print(paste(\"Total Income:\",total))", "print(paste(\"Average:\",mean(df$Income)))"],
        [/*Lua موبایل*/"player={score=0,coins=50}", "player.score=player.score+100", "player.coins=player.coins+20", "print(\"Score:\",player.score)", "print(\"Coins:\",player.coins)"],
        [/*Python موبایل*/"username=input('Enter username:')", "if username!='banned':", "    key=input('Enter Key:')", "    print('Access granted for',username)", "else: print('ACCESS DENIED!')"],
        [/*C++ موبایل*/"#include <iostream>", "using namespace std;", "double income=1000.0;", "double expense=200.0;", "cout<<\"Balance: \"<<income-expense<<endl;"],
        [/*Java موبایل*/"class Main{", "public static void main(String[] args){", "double lat=35.6895,lon=51.389;", "System.out.println(\"Home: Lat=\"+lat+\", Lon=\"+lon);", "}"],
        [/*Go موبایل*/"package main", "import (\"fmt\";\"net/http\")", "func main(){", "resp,_:=http.Get(\"codbanoo.ir\")", "fmt.Println(resp.Status) }"],
        [/*C موبایل*/"#include <stdio.h>", "int main(){", "printf(\"Hello Mobile User!\\n\");", "return 0;", "}"],
        [/*HTML موبایل*/"<div class='card'>", "<h3>Welcome!</h3>", "<p>Mobile dashboard</p>", "</div>"],
        [/*CSS موبایل*/".card {", "background:#f0f0f0;", "padding:10px;", "border-radius:5px;", "text-align:center; }"]
    ];

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const codePool = isMobile ? mobileCodes : desktopCodes;

    // انتخاب تصادفی یک کد
    const selectedCode = codePool[Math.floor(Math.random() * codePool.length)];

    // تبدیل آرایه خطوط به رشته نهایی با newline
    const finalText = selectedCode.join("\n");

    // تایپ کردن روی ترمینال
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
    fetch("/addresses/links.json")
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
