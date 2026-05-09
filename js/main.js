// TapiClean - minimal JS (mobile menu + dropdown services)
(() => {
  const toggleBtn = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  const dropdownWrap = document.querySelector(".has-dropdown");
  const dropdownBtn = dropdownWrap ? dropdownWrap.querySelector(".nav-dropdown-toggle") : null;

  const closeMobile = () => {
    if (!toggleBtn || !mobileNav) return;
    toggleBtn.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  };

  const openMobile = () => {
    if (!toggleBtn || !mobileNav) return;
    toggleBtn.setAttribute("aria-expanded", "true");
    mobileNav.hidden = false;
  };

  const closeDropdown = () => {
    if (!dropdownWrap || !dropdownBtn) return;
    dropdownWrap.classList.remove("open");
    dropdownBtn.setAttribute("aria-expanded", "false");
  };

  const toggleDropdown = () => {
    if (!dropdownWrap || !dropdownBtn) return;
    const willOpen = !dropdownWrap.classList.contains("open");
    dropdownWrap.classList.toggle("open", willOpen);
    dropdownBtn.setAttribute("aria-expanded", String(willOpen));
  };

  // Mobile menu toggle
  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";

      // Close dropdown if opening mobile
      if (!isOpen) closeDropdown();

      isOpen ? closeMobile() : openMobile();
    });

    // Close on link click (mobile)
    mobileNav.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element && target.matches("a")) closeMobile();
    });
  }

  // Desktop dropdown toggle (helps on touch devices)
  if (dropdownBtn) {
    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDropdown();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!dropdownWrap) return;
    if (target instanceof Node && dropdownWrap.contains(target)) return;
    closeDropdown();
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDropdown();
    closeMobile();
  });

  // If we jump to desktop from mobile size, force-close mobile nav
  const mq = window.matchMedia("(min-width: 641px)");
  mq.addEventListener?.("change", () => closeMobile());
})();


// ================================
// Cookie Consent + Google Analytics Consent Mode v2 (TapiClean)
// ================================
(() => {
  const KEY = "tapiclean_cookie_consent_v1";

 
  const GA_MEASUREMENT_ID = "G-W9E7ZG8602";

  // Pregătim dataLayer/gtag fără să încărcăm încă scriptul Google Analytics.
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Consent Mode v2: implicit totul este refuzat până la alegerea utilizatorului.
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  let gaLoaded = false;

  const normalizeConsent = (consent = {}) => ({
    essential: true,
    analytics: false,
    marketing: false,
    ...consent
  });

  const getConsent = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? normalizeConsent(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  };

  const hasValidGaId = () => (
    typeof GA_MEASUREMENT_ID === "string" &&
    /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID) &&
    GA_MEASUREMENT_ID !== "G-XXXXXXXXXX"
  );

  const updateGoogleConsent = (consent) => {
    const normalized = normalizeConsent(consent);

    window.gtag("consent", "update", {
      analytics_storage: normalized.analytics ? "granted" : "denied",
      ad_storage: normalized.marketing ? "granted" : "denied",
      ad_user_data: normalized.marketing ? "granted" : "denied",
      ad_personalization: normalized.marketing ? "granted" : "denied"
    });
  };

  const loadGoogleAnalytics = () => {
    if (gaLoaded || !hasValidGaId()) return;
    gaLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: true
    });
  };

  const deleteCookie = (name, domain) => {
    const domainPart = domain ? `; domain=${domain}` : "";
    document.cookie = `${name}=; Max-Age=0; path=/${domainPart}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
  };

  const deleteAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    cookieNames.forEach((name) => {
      deleteCookie(name);

      if (location.hostname) {
        deleteCookie(name, location.hostname);
        deleteCookie(name, `.${location.hostname}`);
      }
    });
  };

  const applyConsent = (consent) => {
    const normalized = normalizeConsent(consent);

    document.documentElement.dataset.cookieConsent =
      normalized.analytics || normalized.marketing ? "custom_or_all" : "essential_only";

    updateGoogleConsent(normalized);

    if (normalized.analytics) {
      loadGoogleAnalytics();
    } else {
      deleteAnalyticsCookies();
    }
  };

  const setConsent = (consent) => {
    const normalized = normalizeConsent(consent);
    localStorage.setItem(KEY, JSON.stringify({ ...normalized, ts: Date.now() }));
    applyConsent(normalized);
  };

  const buildCookiesLink = () => {
    const p = window.location.pathname || "";
    const nested = p.includes("/servicii/") || p.includes("/blog/");

    // Pentru test pe file:// funcționează bine și cu detectarea asta.
    return nested ? "../cookies.html" : "/cookies";
  };

  const existingConsent = getConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
  }

  // Tracking helper: trimite evenimente doar dacă utilizatorul a acceptat Analiză.
  window.TAPICLEAN_track = (eventName, params = {}) => {
    const consent = getConsent();
    if (!consent?.analytics || typeof window.gtag !== "function" || !hasValidGaId()) return;

    window.gtag("event", eventName, params);
  };

  // Click tracking pentru telefon și WhatsApp.
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const link = target?.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";

    if (href.startsWith("tel:")) {
      window.TAPICLEAN_track("click_phone", {
        event_category: "lead",
        event_label: href
      });
    }

    if (href.includes("wa.me/40744112555")) {
      window.TAPICLEAN_track("click_whatsapp", {
        event_category: "lead",
        event_label: href
      });
    }
  });

  const cookiesHref = buildCookiesLink();

  const bannerHtml = existingConsent ? "" : `
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
          <button class="cc-btn cc-btn-primary" id="cc-accept" type="button">Acceptă analiza</button>
        </div>
      </div>
    </div>
  `;

  // Modalul se inserează mereu, ca linkul "Setări cookies" să funcționeze și după ce utilizatorul a ales.
  const modalHtml = `
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
            <small>Ne ajută să înțelegem cum este folosit site-ul (ex. statistici Google Analytics).</small>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-analytics" />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-row">
          <div>
            <strong>Marketing</strong>
            <small>Conținut/ads mai relevante (dacă vor fi folosite în viitor).</small>
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

  document.body.insertAdjacentHTML("beforeend", `${bannerHtml}${modalHtml}`);

  const banner = document.getElementById("cc-banner");
  const modal = document.getElementById("cc-modal");
  const analyticsInput = document.getElementById("cc-analytics");
  const marketingInput = document.getElementById("cc-marketing");

  const openModal = () => {
    if (!modal) return;

    const current = getConsent() || { analytics: false, marketing: false };

    if (analyticsInput) analyticsInput.checked = !!current.analytics;
    if (marketingInput) marketingInput.checked = !!current.marketing;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    if (analyticsInput) analyticsInput.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  const hideBanner = () => {
    banner?.remove();
    closeModal();
  };

  document.getElementById("cc-accept")?.addEventListener("click", () => {
    setConsent({ essential: true, analytics: true, marketing: false });
    hideBanner();
  });

  document.getElementById("cc-reject")?.addEventListener("click", () => {
    setConsent({ essential: true, analytics: false, marketing: false });
    hideBanner();
  });

  document.getElementById("cc-prefs")?.addEventListener("click", openModal);
  document.getElementById("cc-backdrop")?.addEventListener("click", closeModal);
  document.getElementById("cc-cancel")?.addEventListener("click", closeModal);

  document.getElementById("cc-save")?.addEventListener("click", () => {
    setConsent({
      essential: true,
      analytics: !!analyticsInput?.checked,
      marketing: !!marketingInput?.checked
    });

    hideBanner();
  });

  // ESC închide modalul.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Funcție globală pentru linkul/butonul "Setări cookies" din footer sau pagina cookies.
  window.TAPICLEAN_openCookieSettings = openModal;
})();


// ================================
// Formularul de contact
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  const hint = document.getElementById("formHint");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn?.textContent || "";

    if (btn) {
      btn.textContent = "Se trimite...";
      btn.disabled = true;
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" },
        redirect: "follow"
      });

      // Acceptăm ca succes și 200-299, și 302/303 (Formspree uneori redirecționează).
      const ok = res.ok || res.status === 302 || res.status === 303;

      if (ok) {
        form.reset();

        if (hint) {
          hint.style.display = "block";
        }

        window.TAPICLEAN_track?.("generate_lead", {
          method: "contact_form"
        });
      } else {
        let msg = "Nu s-a putut trimite mesajul. Încearcă din nou sau sună-mă.";

        try {
          const data = await res.json();

          if (data?.errors?.[0]?.message) {
            msg = data.errors[0].message;
          }
        } catch (_) {
          // Rămânem la mesajul generic.
        }

        alert(msg);
      }
    } catch (err) {
      alert("Eroare de rețea. Încearcă din nou sau sună-mă.");
    } finally {
      if (btn) {
        btn.textContent = oldText;
        btn.disabled = false;
      }
    }
  });
});


// ================================
// FAQ toggle
// ================================
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;
    if (!answer) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!isOpen));
    answer.hidden = isOpen;
  });
});