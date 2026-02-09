// TapiClean - minimal JS (mobile menu + dropdown services)
(() => {
  const toggleBtn = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  const dropdownWrap = document.querySelector('.has-dropdown');
  const dropdownBtn = dropdownWrap ? dropdownWrap.querySelector('.nav-dropdown-toggle') : null;

  const closeMobile = () => {
    if (!toggleBtn || !mobileNav) return;
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
  };

  const openMobile = () => {
    if (!toggleBtn || !mobileNav) return;
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileNav.hidden = false;
  };

  const closeDropdown = () => {
    if (!dropdownWrap || !dropdownBtn) return;
    dropdownWrap.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  };

  const toggleDropdown = () => {
    if (!dropdownWrap || !dropdownBtn) return;
    const willOpen = !dropdownWrap.classList.contains('open');
    dropdownWrap.classList.toggle('open', willOpen);
    dropdownBtn.setAttribute('aria-expanded', String(willOpen));
  };

  // Mobile menu toggle
  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      // Close dropdown if opening mobile
      if (!isOpen) closeDropdown();
      isOpen ? closeMobile() : openMobile();
    });

    // Close on link click (mobile)
    mobileNav.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.matches('a')) closeMobile();
    });
  }

  // Desktop dropdown toggle (helps on touch devices)
  if (dropdownBtn) {
    dropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!dropdownWrap) return;
    if (target instanceof Node && dropdownWrap.contains(target)) return;
    closeDropdown();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeDropdown();
    closeMobile();
  });

  // If we jump to desktop from mobile size, force-close mobile nav
  const mq = window.matchMedia('(min-width: 641px)');
  mq.addEventListener?.('change', () => closeMobile());
})();


// ================================
// Cookie Consent (TapiClean)
// ================================
(() => {
  const KEY = "tapiclean_cookie_consent_v1";

  const getConsent = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const setConsent = (consent) => {
    localStorage.setItem(KEY, JSON.stringify({ ...consent, ts: Date.now() }));
    applyConsent(consent);
  };

  // IMPORTANT:
  // Aici “aplici” consimțământul (ex: în viitor, încarci Google Analytics doar dacă analytics=true).
  const applyConsent = (consent) => {
    // helper pentru debug / viitor
    document.documentElement.dataset.cookieConsent =
      consent.analytics || consent.marketing ? "custom_or_all" : "essential_only";

    // EXEMPLE (lasate comentate):
    // if (consent.analytics) loadGoogleAnalytics();
    // if (consent.marketing) loadMarketingPixels();
  };

  const buildCookiesLink = () => {
    const p = window.location.pathname || "";
    const nested = p.includes("/servicii/") || p.includes("/blog/");
    // pentru test pe file:// funcționează bine și cu detectarea asta
    return nested ? "../cookies.html" : "cookies.html";
  };

  const existing = getConsent();
  if (existing) {
    applyConsent(existing);
    return; // dacă e deja ales, nu mai afișăm bannerul
  }

  const cookiesHref = buildCookiesLink();

  // Injectăm HTML-ul bannerului + modalului
  const html = `
    <div class="cc-banner" id="cc-banner" role="region" aria-label="Consimțământ cookies">
      <div class="cc-card">
        <div class="cc-left">
          <div class="cc-icon" aria-hidden="true">🍪</div>
          <div class="cc-text">
            <p class="cc-title">Cookies pe TapiClean</p>
            <p class="cc-desc">
              Folosim cookie-uri necesare pentru funcționarea site-ului. Cu acordul tău, putem folosi și cookie-uri
              pentru analiză și îmbunătățirea experienței. <a href="${cookiesHref}">Detalii</a>
            </p>
          </div>
        </div>

        <div class="cc-actions">
          <button class="cc-btn cc-btn-ghost" id="cc-reject" type="button">Respinge</button>
          <button class="cc-btn-link" id="cc-prefs" type="button">Preferințe</button>
          <button class="cc-btn cc-btn-primary" id="cc-accept" type="button">Acceptă</button>
        </div>
      </div>
    </div>

    <div class="cc-modal" id="cc-modal" aria-hidden="true">
      <div class="cc-backdrop" id="cc-backdrop"></div>
      <div class="cc-dialog" role="dialog" aria-modal="true" aria-labelledby="cc-title">
        <h3 id="cc-title">Preferințe cookies</h3>
        <p>Alege ce permiți. Cookie-urile necesare sunt mereu active.</p>

        <div class="cc-row">
          <div>
            <strong>Necesare</strong>
            <small>Asigură funcționarea site-ului (nu pot fi dezactivate).</small>
          </div>
          <div class="cc-switch" aria-label="Necesare (activ permanent)">
            <input type="checkbox" checked disabled />
            <span class="cc-slider"></span>
          </div>
        </div>

        <div class="cc-row">
          <div>
            <strong>Analiză</strong>
            <small>Ne ajută să înțelegem cum este folosit site-ul (ex. statistici).</small>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-analytics" />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-row">
          <div>
            <strong>Marketing</strong>
            <small>Conținut/ads mai relevante (dacă vor fi folosite).</small>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-marketing" />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-modal-actions">
          <button class="cc-btn" id="cc-cancel" type="button">Anulează</button>
          <button class="cc-btn cc-btn-primary" id="cc-save" type="button">Salvează</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  const banner = document.getElementById("cc-banner");
  const modal = document.getElementById("cc-modal");

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    // focus pe primul control util
    const el = document.getElementById("cc-analytics");
    if (el) el.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  const hideBanner = () => {
    if (banner) banner.remove();
    closeModal();
  };

  // Butoane
  document.getElementById("cc-accept").addEventListener("click", () => {
    setConsent({ essential: true, analytics: true, marketing: true });
    hideBanner();
  });

  document.getElementById("cc-reject").addEventListener("click", () => {
    setConsent({ essential: true, analytics: false, marketing: false });
    hideBanner();
  });

  document.getElementById("cc-prefs").addEventListener("click", openModal);
  document.getElementById("cc-backdrop").addEventListener("click", closeModal);
  document.getElementById("cc-cancel").addEventListener("click", closeModal);

  document.getElementById("cc-save").addEventListener("click", () => {
    const analytics = !!document.getElementById("cc-analytics")?.checked;
    const marketing = !!document.getElementById("cc-marketing")?.checked;
    setConsent({ essential: true, analytics, marketing });
    hideBanner();
  });

  // ESC închide modalul
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Opțional: funcție globală ca să poți pune în footer un link "Setări cookies"
  window.TAPICLEAN_openCookieSettings = openModal;
})();


// Formularul de contact
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  const hint = document.getElementById("formHint");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = "Se trimite...";
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" },
        redirect: "follow"
      });

      // ✅ Acceptăm ca succes și 200-299, și 302/303 (Formspree uneori redirecționează)
      const ok = res.ok || res.status === 302 || res.status === 303;

      if (ok) {
        form.reset();
        if (hint) hint.style.display = "block";
      } else {
        // încercăm să citim mesajul de eroare (dacă există)
        let msg = "Nu s-a putut trimite mesajul. Încearcă din nou sau sună-mă.";
        try {
          const data = await res.json();
          if (data && data.errors && data.errors[0] && data.errors[0].message) {
            msg = data.errors[0].message;
          }
        } catch (_) {}
        alert(msg);
      }
    } catch (err) {
      alert("Eroare de rețea. Încearcă din nou sau sună-mă.");
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  });
});
