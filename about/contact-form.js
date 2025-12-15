(() => {
    const ENDPOINT = "https://codbanoo-support.kavehhack.workers.dev/api/contact";
  
    const form = document.getElementById("contactForm");
    if (!form) return;
  
    const nameEl = form.querySelector("#name");
    const emailEl = form.querySelector("#email");
    const msgEl = form.querySelector("#message");
  
    // ---------- Modal (center notification) ----------
    function ensureModal() {
      if (document.getElementById("cfModal")) return;
  
      const modal = document.createElement("div");
      modal.id = "cfModal";
      modal.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: none; place-items: center;
        padding: 18px;
        background: rgba(0,0,0,.25);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      `;
  
      modal.innerHTML = `
        <div style="
          width: min(520px, 100%);
          border-radius: 18px;
          padding: 16px 16px 14px;
          background: rgba(255,255,255,.22);
          border: 1px solid rgba(255,255,255,.35);
          box-shadow: 0 18px 55px rgba(0,0,0,.14);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          color: #0b2b2a;
        ">
          <div id="cfModalTitle" style="font-weight: 700; font-size: 1.05rem; margin-bottom: 8px;"></div>
          <div id="cfModalText" style="font-size: .98rem; line-height: 1.9; color: rgba(11,43,42,.92);"></div>
          <div style="display:flex; justify-content:flex-end; margin-top: 14px;">
            <button id="cfModalOk" type="button" style="
              border: 1px solid rgba(255,255,255,.45);
              background: rgba(255,255,255,.18);
              border-radius: 14px;
              padding: 9px 14px;
              cursor: pointer;
              font-family: inherit;
              color: inherit;
            ">باشه</button>
          </div>
        </div>
      `;
  
      document.body.appendChild(modal);
  
      const okBtn = document.getElementById("cfModalOk");
      okBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  
    function showModal(title, text) {
      ensureModal();
      document.getElementById("cfModalTitle").textContent = title || "";
      document.getElementById("cfModalText").textContent = text || "";
      const modal = document.getElementById("cfModal");
      modal.style.display = "grid";
    }
  
    // ---------- Message counter ----------
    const counter = document.createElement("div");
    counter.id = "msgCounter";
    counter.style.cssText = `
      margin-top: 8px;
      font-size: .9rem;
      line-height: 1.6;
      text-align: left;
      direction: ltr;
      user-select: none;
    `;
    // تلاش می‌کنیم شمارنده زیر textarea قرار بگیرد
    msgEl.insertAdjacentElement("afterend", counter);
  
    function updateCounter() {
      const len = (msgEl.value || "").length;
      counter.textContent = `${len} / 30`;
      counter.style.color = len < 30 ? "#b42318" : "#1e8e5a";
    }
    msgEl.addEventListener("input", updateCounter);
    updateCounter();
  
    // ---------- Validations ----------
    const faNameRegex = /^[\u0600-\u06FF\s]+$/; // فقط فارسی + فاصله
    const enEmailRegex = /^[A-Za-z0-9._%+\-@.]+$/; // فقط انگلیسی و کاراکترهای ایمیل
  
    function isValidName(v) {
      const s = (v || "").trim();
      if (s.length < 3) return { ok: false, msg: "نام باید حداقل ۳ حرف فارسی باشد." };
      if (!faNameRegex.test(s)) return { ok: false, msg: "نام فقط باید شامل کاراکترهای فارسی باشد." };
      return { ok: true };
    }
  
    function isValidEmail(v) {
      const s = (v || "").trim();
      if (s.length < 7) return { ok: false, msg: "ایمیل باید حداقل ۷ کاراکتر باشد." };
      if (!enEmailRegex.test(s)) return { ok: false, msg: "ایمیل فقط باید شامل کاراکترهای انگلیسی باشد." };
      if (!s.includes("@") || !s.includes(".")) return { ok: false, msg: "ایمیل باید شامل @ و . باشد." };
  
      // چک ساده ساختار
      const basic = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!basic.test(s)) return { ok: false, msg: "فرمت ایمیل معتبر نیست." };
  
      // جلوگیری از ایمیل‌های داخلی codbanoo.ir
      if (s.toLowerCase().endsWith("@codbanoo.ir")) {
        return { ok: false, msg: "لطفاً از ایمیل شخصی خود استفاده کنید (ایمیل codbanoo.ir مجاز نیست)." };
      }
  
      return { ok: true };
    }
  
    function isValidMessage(v) {
      const s = (v || "").trim();
      if (s.length < 30) return { ok: false, msg: "متن پیام باید حداقل ۳۰ کاراکتر باشد." };
      return { ok: true };
    }
  
    function validateAll() {
      const n = isValidName(nameEl.value);
      if (!n.ok) return n;
  
      const e = isValidEmail(emailEl.value);
      if (!e.ok) return e;
  
      const m = isValidMessage(msgEl.value);
      if (!m.ok) return m;
  
      return { ok: true };
    }
  
    // ---------- Submit ----------
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
  
      const v = validateAll();
      if (!v.ok) {
        showModal("⚠️ خطا در اطلاعات", v.msg);
        return;
      }
  
      // جلوگیری از ارسال پیام کوتاه لحظه آخر
      updateCounter();
      if ((msgEl.value || "").trim().length < 30) {
        showModal("⚠️ متن پیام کوتاه است", "متن پیام باید حداقل ۳۰ کاراکتر باشد.");
        return;
      }
  
      // UI lock
      const submitBtn = form.querySelector('button[type="submit"]');
      const prevDisabled = submitBtn?.disabled;
      if (submitBtn) submitBtn.disabled = true;
  
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            message: msgEl.value.trim(),
            page: location.href,
          }),
        });
  
        const data = await res.json().catch(() => ({}));
  
        // Rate limit
        if (res.status === 429 || data?.error === "rate_limited") {
          const mins = data?.retry_after_minutes ?? 60;
          showModal(
            "⏳ کمی صبر کنید",
            `برای جلوگیری از اسپم، هر کاربر در هر ساعت فقط ۳ پیام می‌تواند ارسال کند.\n` +
            `لطفاً حدود ${mins} دقیقه دیگر دوباره تلاش کنید. 🙏`
          );
          return;
        }
  
        if (!res.ok || data?.success !== true) {
          showModal("❌ ارسال ناموفق", "ارسال پیام با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
          return;
        }
  
        form.reset();
        updateCounter();
        showModal("✅ ارسال شد", "پیام شما با موفقیت ثبت شد. به‌زودی پاسخ می‌دهیم.");
      } catch (e) {
        showModal("❌ خطای ارتباط", "ارتباط با سرور برقرار نشد. لطفاً اینترنت را بررسی کنید و دوباره تلاش کنید.");
      } finally {
        if (submitBtn) submitBtn.disabled = prevDisabled || false;
      }
    });
  })();
  