/* ===========================================================================
   CapitalBoost — consimțământ cookie-uri (GDPR)
   ---------------------------------------------------------------------------
   Microsoft Clarity NU se încarcă până când vizitatorul nu apasă „Accept".
   Alegerea se ține în localStorage și expiră după 6 luni, ca să fie recerută.

   API public:
     window.CapitalBoostCookies.open()    -> redeschide bannerul (link footer)
     window.CapitalBoostCookies.status()  -> 'accepted' | 'rejected' | null
   ========================================================================= */
(function () {
  'use strict';

  var CLARITY_ID = 'y5acfoiywc';
  var STORE_KEY = 'cb-cookie-consent';
  var MAX_AGE_DAYS = 182; // ~6 luni
  var POLICY_URL = '/politica-cookies/';

  /* ---------- stocare ---------------------------------------------------- */

  function read() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || (v.status !== 'accepted' && v.status !== 'rejected')) return null;
      var ageDays = (Date.now() - (v.ts || 0)) / 86400000;
      if (ageDays > MAX_AGE_DAYS) return null; // consimțământ expirat
      return v.status;
    } catch (e) {
      return null; // localStorage blocat (mod privat, cookie-uri third-party off)
    }
  }

  function write(status) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ status: status, ts: Date.now() }));
    } catch (e) {
      /* fără stocare nu putem reține alegerea — bannerul reapare la reload */
    }
  }

  /* ---------- Clarity ---------------------------------------------------- */

  var clarityLoaded = false;

  function loadClarity() {
    if (clarityLoaded || window.clarity) return;
    clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  // La refuz, curățăm cookie-urile deja puse de Clarity într-o vizită anterioară.
  function clearAnalyticsCookies() {
    var names = ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM'];
    var host = window.location.hostname;
    var domains = ['', host, '.' + host];
    var bare = host.replace(/^www\./, '');
    if (bare !== host) { domains.push(bare, '.' + bare); }

    names.forEach(function (name) {
      domains.forEach(function (d) {
        var c = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        if (d) c += '; domain=' + d;
        try { document.cookie = c; } catch (e) { /* ignorăm */ }
      });
    });
  }

  /* ---------- stiluri ---------------------------------------------------- */

  var CSS = [
    '.cb-cc{position:fixed;left:20px;bottom:20px;z-index:9999;width:min(420px,calc(100vw - 40px));',
    'background:#1B2A4A;background-image:radial-gradient(ellipse 90% 70% at 12% 0%,rgba(199,91,42,.20) 0%,transparent 62%),radial-gradient(ellipse 70% 60% at 100% 100%,rgba(36,54,96,.9) 0%,transparent 70%);',
    'border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:22px 22px 20px;',
    'box-shadow:0 2px 8px rgba(17,29,53,.28),0 18px 48px rgba(17,29,53,.42),0 1px 0 rgba(255,255,255,.06) inset;',
    'opacity:0;transform:translateY(16px);transition:opacity .32s ease,transform .42s cubic-bezier(.16,1,.3,1);}',
    '.cb-cc.is-open{opacity:1;transform:translateY(0);}',
    '.cb-cc__label{display:inline-block;font-family:"Space Grotesk",ui-monospace,monospace;font-size:.63rem;font-weight:600;',
    'letter-spacing:.13em;text-transform:uppercase;color:#D96E3D;background:rgba(199,91,42,.14);padding:5px 11px;border-radius:100px;margin-bottom:12px;}',
    '.cb-cc__title{font-family:"Playfair Display",Georgia,serif;font-size:1.18rem;font-weight:700;letter-spacing:-.02em;color:#fff;margin:0 0 8px;}',
    '.cb-cc__text{font-family:"DM Sans",system-ui,sans-serif;font-size:.86rem;line-height:1.65;color:rgba(255,255,255,.66);margin:0 0 18px;}',
    '.cb-cc__text a{color:#E0834F;text-decoration:underline;text-underline-offset:2px;transition:color .2s ease;}',
    '.cb-cc__text a:hover{color:#fff;}',
    '.cb-cc__text a:focus-visible{outline:2px solid #C75B2A;outline-offset:2px;border-radius:2px;}',
    '.cb-cc__actions{display:flex;gap:10px;flex-wrap:wrap;}',
    '.cb-cc__btn{flex:1 1 auto;min-width:130px;display:inline-flex;align-items:center;justify-content:center;gap:7px;',
    'font-family:"DM Sans",system-ui,sans-serif;font-size:.88rem;font-weight:600;padding:12px 20px;border-radius:8px;cursor:pointer;',
    'border:1px solid transparent;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease,background-color .2s ease,border-color .2s ease,color .2s ease;}',
    '.cb-cc__btn--accept{background:#C75B2A;color:#fff;box-shadow:0 4px 16px rgba(199,91,42,.35);}',
    '.cb-cc__btn--accept:hover{background:#D96E3D;transform:translateY(-2px);box-shadow:0 8px 24px rgba(199,91,42,.45);}',
    '.cb-cc__btn--accept:active{transform:translateY(0);}',
    '.cb-cc__btn--reject{background:rgba(255,255,255,.06);color:rgba(255,255,255,.88);border-color:rgba(255,255,255,.22);}',
    '.cb-cc__btn--reject:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.38);color:#fff;transform:translateY(-2px);}',
    '.cb-cc__btn--reject:active{transform:translateY(0);}',
    '.cb-cc__btn:focus-visible{outline:3px solid #E0834F;outline-offset:3px;}',
    '@media (max-width:520px){.cb-cc{left:12px;right:12px;bottom:12px;width:auto;padding:20px 18px 18px;}',
    '.cb-cc__btn{flex:1 1 100%;}}',
    '@media (prefers-reduced-motion:reduce){.cb-cc{transition:none;}.cb-cc__btn:hover{transform:none;}}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('cb-cc-styles')) return;
    var st = document.createElement('style');
    st.id = 'cb-cc-styles';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- banner ----------------------------------------------------- */

  var banner = null;

  function build() {
    injectStyles();

    banner = document.createElement('div');
    banner.className = 'cb-cc';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cb-cc-title');
    banner.setAttribute('aria-describedby', 'cb-cc-text');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML =
      '<span class="cb-cc__label">Cookie-uri</span>' +
      '<h2 class="cb-cc__title" id="cb-cc-title">Ne dai voie s&#259; m&#259;sur&#259;m?</h2>' +
      '<p class="cb-cc__text" id="cb-cc-text">Folosim Microsoft Clarity ca s&#259; vedem cum e folosit site-ul ' +
      '&#537;i s&#259;-l &#238;mbun&#259;t&#259;&#539;im. Nimic nu se &#238;ncarc&#259; f&#259;r&#259; acordul t&#259;u, iar ' +
      'refuzul nu afecteaz&#259; cu nimic site-ul. <a href="' + POLICY_URL + '">Detalii &#238;n politica de cookie-uri</a>.</p>' +
      '<div class="cb-cc__actions">' +
      '<button type="button" class="cb-cc__btn cb-cc__btn--reject" data-cb-action="reject">Refuz</button>' +
      '<button type="button" class="cb-cc__btn cb-cc__btn--accept" data-cb-action="accept">Accept</button>' +
      '</div>';

    banner.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-cb-action]');
      if (!btn) return;
      if (btn.getAttribute('data-cb-action') === 'accept') {
        write('accepted');
        loadClarity();
      } else {
        write('rejected');
        clearAnalyticsCookies();
      }
      hide();
    });

    document.body.appendChild(banner);
  }

  function show() {
    if (!banner) build();
    banner.style.display = '';
    // dublu rAF: garantează că starea inițială e pictată înainte de tranziție
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('is-open'); });
    });
  }

  function hide() {
    if (!banner) return;
    banner.classList.remove('is-open');
    window.setTimeout(function () {
      if (banner && !banner.classList.contains('is-open')) banner.style.display = 'none';
    }, 420);
  }

  /* ---------- pornire ---------------------------------------------------- */

  function init() {
    var status = read();
    if (status === 'accepted') { loadClarity(); return; }
    if (status === 'rejected') { return; }
    show();
  }

  window.CapitalBoostCookies = {
    open: function () { show(); },
    status: function () { return read(); }
  };

  // Link-urile „Set&#259;ri cookie-uri" din footer, fără handler inline.
  document.addEventListener('click', function (ev) {
    var trigger = ev.target.closest('[data-cookie-settings]');
    if (!trigger) return;
    ev.preventDefault();
    show();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
