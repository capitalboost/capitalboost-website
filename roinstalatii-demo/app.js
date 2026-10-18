/* Local, buildless demo. Only the cart is persisted; checkout data is never sent or saved. */
(function () {
  'use strict';

  const { products, categories, business, snapshotDate } = window.RoCatalog;
  const Store = window.RoStore;
  const main = document.getElementById('main-content');
  const searchInput = document.getElementById('search-query');
  const storageKey = 'roinstalatii-demo-a-cart-v1';
  const brands = [...new Set(products.map(p => p.brand))].sort((a, b) => a.localeCompare(b, 'ro'));
  const priceFormat = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });
  let storageAvailable = true;
  let cart = {};
  let currentRoute = '/';
  let filterOpen = false;
  let renderIntent = null;
  let checkoutResult = null;
  let toastTimer;
  try { cart = Store.parseStoredCart(window.localStorage.getItem(storageKey), products); }
  catch (error) { storageAvailable = false; }

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const money = value => priceFormat.format(value);
  const price = value => `<span class="price">${money(value)}<small>lei</small></span>`;
  const productById = id => products.find(product => product.id === id);
  const categoryById = id => categories.find(category => category.id === id);
  const productHref = id => `#/produs/${encodeURIComponent(id)}`;
  const categoryHref = id => `#/catalog?categorie=${encodeURIComponent(id)}`;
  const brandId = brand => 'brand-' + Store.normalize(brand).replace(/[^a-z0-9]+/g, '-');
  const icons = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h2l2.5 12h11L21 7H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>',
    filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="15" cy="17" r="2" fill="white"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6 8 7 8-7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };

  function breadcrumbs(items) {
    return `<nav aria-label="Fir de navigare"><ol class="breadcrumb"><li><a href="#/">Acasă</a></li>${items.map((item, index) => `<li>${item.href ? `<a href="${esc(item.href)}">${esc(item.label)}</a>` : `<span ${index === items.length - 1 ? 'aria-current="page"' : ''}>${esc(item.label)}</span>`}</li>`).join('')}</ol></nav>`;
  }

  function stock(product, dated = false) {
    return `<span class="stock${product.stock === 'În stoc furnizor' ? ' supplier' : ''}">${esc(product.stock)}${dated ? ` · la ${snapshotDate}` : ''}</span>`;
  }

  function card(product) {
    const category = categoryById(product.categoryId);
    return `<article class="product-card">
      <a class="product-image" href="${productHref(product.id)}" tabindex="-1" aria-hidden="true"><img src="${esc(product.image)}" alt="" width="350" height="350" loading="lazy"></a>
      <div class="card-brand">${esc(product.brand)}</div>
      <h3><a href="${productHref(product.id)}">${esc(product.name)}</a></h3>
      <div class="card-category">${esc(category.name)}</div>
      ${stock(product)}
      <div class="card-bottom">${price(product.price)}<button class="add-small" type="button" data-action="add" data-product="${esc(product.id)}" aria-label="Adaugă ${esc(product.name)} în coș"><span aria-hidden="true">+</span> Adaugă</button></div>
    </article>`;
  }

  function snapshotNote() {
    return `<p class="snapshot-note">Selecție demonstrativă. Prețuri și disponibilitate din ${snapshotDate}; acestea se verifică pe site-ul magazinului înaintea unei comenzi reale.</p>`;
  }

  function home() {
    const featured = ['ariston-clas', 'gree-bora', 'ariston-lydos', 'computherm-q7'].map(productById);
    return `<section class="hero wrap">
      <div class="hero-copy"><div class="eyebrow">Încălzire · Climatizare · Apă caldă</div><h1>Instalații pentru <em>confortul</em> casei tale.</h1><p>Centrale termice, pompe de căldură, aer condiționat și echipamente pentru apă caldă. Explorează categoriile și găsește produsul de care ai nevoie.</p><a class="primary" href="#/catalog">Explorează produsele <span aria-hidden="true">↗</span></a><div class="hero-bottom"><span>De la echipament</span><span class="rule"></span><span>la confortul de acasă.</span></div></div>
      <div class="hero-visual"><div class="visual-label">În centrul confortului tău.</div><div class="product-stage"><div class="stage-ring"></div><img class="hero-product" src="assets/ariston-clas.jpg" alt="Centrala termică Ariston Clas One WiFi 24" width="350" height="350"></div><div class="visual-footer"><div><small>CENTRALE TERMICE</small><strong>ARISTON CLAS ONE WIFI 24</strong></div><a class="circle-link" href="${productHref('ariston-clas')}" aria-label="Vezi Ariston Clas One WiFi 24">↗</a></div></div>
    </section>
    <section class="categories wrap"><div class="section-top"><div><span class="eyebrow">Începe cu ce ai nevoie</span><h2>Confortul are mai multe forme.</h2></div><span class="section-note">Explorează selecția de categorii</span></div><div class="category-grid">${categories.map(category => `<a class="category-card" href="${categoryHref(category.id)}"><img src="${esc(category.image)}" alt="" width="180" height="180" loading="lazy"><span>${esc(category.name)}<b aria-hidden="true">↗</b></span></a>`).join('')}</div></section>
    <section class="featured"><div class="wrap"><div class="section-top"><div><span class="eyebrow">O selecție din magazin</span><h2>Echipamente pentru fiecare proiect.</h2></div><a class="text-link" href="#/catalog">Vezi toate produsele <span aria-hidden="true">↗</span></a></div><div class="product-grid">${featured.map(card).join('')}</div>${snapshotNote()}</div></section>
    <section class="help-section wrap"><div><span class="eyebrow">Următorul pas, mai clar</span><h2>Ai un proiect în minte?<br>Începe cu echipamentul potrivit.</h2><p>Explorează modelele pe categorii, compară caracteristicile publicate și păstrează în coș produsele pe care vrei să le alegi.</p></div><div class="help-card"><span class="eyebrow">Ai nevoie de o informație?</span><strong>Discută cu magazinul.</strong><p>Pentru detalii despre un model, disponibilitate sau condițiile unei comenzi, folosește datele de contact RoInstalații.</p><a class="text-link" href="#/contact">Contact și despre magazin <span aria-hidden="true">↗</span></a></div></section>`;
  }

  function readFilters() {
    const params = new URLSearchParams((window.location.hash.split('?')[1] || ''));
    const category = params.get('categorie') || '';
    const sort = params.get('sort') || 'recommended';
    return {
      query: (params.get('q') || '').trim(),
      category: categoryById(category) ? category : '',
      brands: params.getAll('marca').filter(brand => brands.includes(brand)),
      sort: ['recommended', 'price-asc', 'price-desc', 'name'].includes(sort) ? sort : 'recommended'
    };
  }

  function filterPath(filters) {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('categorie', filters.category);
    (filters.brands || []).forEach(brand => params.append('marca', brand));
    if (filters.sort && filters.sort !== 'recommended') params.set('sort', filters.sort);
    return '/catalog' + (params.toString() ? '?' + params.toString() : '');
  }

  function catalog() {
    const filters = readFilters();
    const selection = Store.filterProducts(products, filters);
    const category = categoryById(filters.category);
    const chips = [];
    if (filters.query) chips.push(`<button class="filter-chip" type="button" data-action="remove-filter" data-filter="query">Căutare: ${esc(filters.query)} <span aria-hidden="true">×</span></button>`);
    if (category) chips.push(`<button class="filter-chip" type="button" data-action="remove-filter" data-filter="category">${esc(category.name)} <span aria-hidden="true">×</span></button>`);
    filters.brands.forEach(brand => chips.push(`<button class="filter-chip" type="button" data-action="remove-filter" data-filter="brand" data-value="${esc(brand)}">${esc(brand)} <span aria-hidden="true">×</span></button>`));
    const radio = (value, label, count) => `<label class="filter-option"><input type="radio" name="category" id="category-${value || 'all'}" value="${value}" ${filters.category === value ? 'checked' : ''}><span>${esc(label)}</span><small>${count}</small></label>`;
    return `<div class="wrap">${breadcrumbs([{ label: 'Catalog', href: category ? '#/catalog' : null }, ...(category ? [{ label: category.name }] : [])])}<div class="page-heading"><div><h1>${category ? esc(category.name) : 'Totul începe cu alegerea potrivită.'}</h1><p>${category ? esc(category.description) : 'Încălzire, climatizare și apă caldă. Găsește modelul pe care îl cauți în selecția noastră de produse.'}</p></div><span class="selection-count">${products.length} produse în acest demo</span></div>
      <div class="catalog-layout"><aside class="filters${filterOpen ? ' is-open' : ''}" aria-label="Filtre de produse"><button id="filter-toggle" class="filter-toggle" type="button" data-action="toggle-filters" aria-expanded="${filterOpen}" aria-controls="filter-content"><span>${icons.filter} Filtrează produsele${chips.length ? ` (${chips.length})` : ''}</span><span aria-hidden="true">${filterOpen ? '−' : '+'}</span></button><div class="filter-content" id="filter-content"><div class="filter-top"><h2>Filtrează</h2><button class="text-button" type="button" data-action="clear-filters">Resetează</button></div><fieldset class="filter-group"><legend>Categorie</legend><div class="filter-options">${radio('', 'Toate produsele', products.length)}${categories.map(item => radio(item.id, item.name, products.filter(product => product.categoryId === item.id).length)).join('')}</div></fieldset><fieldset class="filter-group"><legend>Marcă</legend><div class="filter-options">${brands.map(brand => `<label class="filter-option"><input id="${brandId(brand)}" type="checkbox" name="brand" value="${esc(brand)}" ${filters.brands.includes(brand) ? 'checked' : ''}><span>${esc(brand)}</span><small>${products.filter(product => product.brand === brand).length}</small></label>`).join('')}</div></fieldset><div class="filter-helper">Ai nevoie de informații despre un model?<a href="#/contact">Vezi datele de contact ↗</a></div></div></aside>
      <section class="catalog-main" aria-label="Rezultatele căutării"><div class="catalog-toolbar"><span class="results-count" id="results-count" role="status">${selection.length} ${selection.length === 1 ? 'produs afișat' : 'produse afișate'}</span><label class="sort-control" for="catalog-sort"><span>Sortează:</span><select id="catalog-sort" aria-label="Sortează produsele">${[['recommended', 'Ordinea selecției'], ['price-asc', 'Preț crescător'], ['price-desc', 'Preț descrescător'], ['name', 'Denumire A–Z']].map(([value, label]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div>${chips.length ? `<div class="active-filters" aria-label="Filtre active">${chips.join('')}<button class="filter-chip" type="button" data-action="clear-filters">Șterge filtrele</button></div>` : ''}${selection.length ? `<div class="product-grid catalog-grid">${selection.map(card).join('')}</div>` : `<div class="empty-results"><h2>Nu am găsit produse pentru selecția ta.</h2><p>Încearcă un alt model, un cod de produs sau elimină filtrele active.</p><button type="button" class="primary" data-action="clear-filters">Vezi toate cele ${products.length} produse <span aria-hidden="true">↗</span></button></div>`}${snapshotNote()}</section></div></div>`;
  }

  function quantityControl(id, quantity, scope) {
    const inputId = scope === 'product' ? 'product-quantity' : 'quantity-' + id;
    const label = `Cantitate ${productById(id).name}`;
    return `<div class="quantity"><button id="minus-${esc(id)}" type="button" data-action="quantity-step" data-scope="${scope}" data-product="${esc(id)}" data-step="-1" aria-label="Scade cantitatea pentru ${esc(productById(id).name)}" ${quantity <= 1 ? 'disabled' : ''}>−</button><input id="${inputId}" type="number" inputmode="numeric" min="1" max="99" step="1" value="${quantity}" aria-label="${esc(label)}" ${scope === 'cart' ? `data-cart-quantity="${esc(id)}"` : ''}><button id="plus-${esc(id)}" type="button" data-action="quantity-step" data-scope="${scope}" data-product="${esc(id)}" data-step="1" aria-label="Crește cantitatea pentru ${esc(productById(id).name)}" ${quantity >= 99 ? 'disabled' : ''}>+</button></div>`;
  }

  function productPage(product) {
    const category = categoryById(product.categoryId);
    const related = [...products.filter(item => item.id !== product.id && item.categoryId === product.categoryId), ...products.filter(item => item.id !== product.id && item.categoryId !== product.categoryId)].slice(0, 4);
    return `<div class="wrap">${breadcrumbs([{ label: 'Catalog', href: '#/catalog' }, { label: category.name, href: categoryHref(category.id) }, { label: product.name }])}<section class="product-detail"><div class="product-media"><img src="${esc(product.image)}" alt="${esc(product.fullName)}" width="350" height="350"><span class="image-caption">Fotografia produsului din magazinul RoInstalații${product.imageNote ? `<br>${esc(product.imageNote)}` : ''}</span></div><div class="product-info"><div class="eyebrow"><span>${esc(product.brand)} · ${esc(category.shortName)}</span><span class="product-code">Cod: ${esc(product.code)}</span></div><h1>${esc(product.name)}</h1><p class="product-summary">${esc(product.summary)}</p>${stock(product, true)}<ul class="product-highlights">${product.highlights.map(item => `<li>${esc(item)}</li>`).join('')}</ul><div class="price-block">${price(product.price)}<p>Preț afișat în sursă la ${snapshotDate}.</p></div><form data-form="add-product" data-product="${esc(product.id)}"><label for="product-quantity" class="quantity-label">Cantitate</label><div class="buy-row">${quantityControl(product.id, 1, 'product')}<button class="primary" type="submit">${icons.cart} Adaugă în coș</button></div></form><p class="purchase-note">Transportul, disponibilitatea și eventualele servicii de instalare se confirmă cu magazinul. Adăugarea în acest coș nu rezervă produsul.</p><a class="original-link" href="${esc(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">Vezi produsul pe site-ul magazinului ↗</a></div></section><section class="product-extra"><div><h2>Caracteristici principale</h2><dl class="spec-list"><div><dt>Marcă</dt><dd>${esc(product.brand)}</dd></div><div><dt>Cod produs</dt><dd>${esc(product.code)}</dd></div>${product.specs.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></div><div class="product-advice"><span class="eyebrow">Înainte de alegere</span><h2>Detaliile fac diferența.</h2><p>Verifică specificațiile modelului și cerințele de instalare pentru proiectul tău. Pentru informații suplimentare despre echipament, discută cu magazinul.</p><a class="text-link" href="#/contact">Date de contact <span aria-hidden="true">↗</span></a></div></section></div><section class="related"><div class="wrap"><div class="section-top"><div><span class="eyebrow">Continuă explorarea</span><h2>Mai multe produse din selecție.</h2></div><a class="text-link" href="#/catalog">Înapoi la catalog <span aria-hidden="true">↗</span></a></div><div class="product-grid">${related.map(card).join('')}</div>${snapshotNote()}</div></section>`;
  }

  function summaryPanel(summary, checkout = false) {
    return `<aside class="summary-panel" aria-label="Sumarul produselor"><h2>${checkout ? 'Produsele tale' : 'Sumarul coșului'}</h2>${checkout ? `<div class="checkout-item-list">${summary.items.map(item => `<div class="checkout-item"><div><strong>${esc(item.product.name)}</strong><small>${item.quantity} × ${money(item.product.price)} lei</small></div><span>${money(item.lineTotal)} lei</span></div>`).join('')}</div>` : `<div class="summary-row"><span>Produse (${summary.count})</span><span>${money(summary.subtotal)} lei</span></div>`}<div class="summary-row"><span>Transport</span><span>Necalculat în demo</span></div><div class="summary-row summary-total"><span>Subtotal produse</span>${price(summary.subtotal)}</div>${!checkout ? `<a class="primary wide" href="#/finalizare">Continuă spre finalizare <span aria-hidden="true">↗</span></a>` : ''}<p class="snapshot-note">Prețuri din ${snapshotDate}. Transportul și eventualele servicii nu sunt incluse în subtotal. Nu se efectuează plăți în acest demo.</p></aside>`;
  }

  function emptyCart() {
    return `<div class="wrap">${breadcrumbs([{ label: 'Coșul tău' }])}<section class="empty-state"><div class="empty-icon">${icons.cart}</div><h1>Coșul așteaptă primul produs.</h1><p>Explorează selecția de echipamente și adaugă produsele pe care vrei să le incluzi în demonstrație.</p><a class="primary" href="#/catalog">Descoperă produsele <span aria-hidden="true">↗</span></a></section></div>`;
  }

  function cartPage() {
    const summary = Store.cartSummary(cart, products);
    if (!summary.count) return emptyCart();
    return `<div class="wrap">${breadcrumbs([{ label: 'Coșul tău' }])}<div class="page-heading"><div><h1>Coșul tău.</h1><p>${summary.count} ${summary.count === 1 ? 'produs ales' : 'produse alese'}. Mai aproape de confortul de acasă.</p></div><span class="selection-count">Comandă demonstrativă</span></div><div class="commerce-layout"><section aria-label="Produse în coș"><div class="cart-items">${summary.items.map(item => `<article class="cart-line"><a href="${productHref(item.product.id)}" tabindex="-1" aria-hidden="true"><img src="${esc(item.product.image)}" alt="" width="100" height="115"></a><div class="cart-product"><h2><a href="${productHref(item.product.id)}">${esc(item.product.name)}</a></h2><p>Cod ${esc(item.product.code)} · ${money(item.product.price)} lei / buc.</p><div class="cart-controls">${quantityControl(item.product.id, item.quantity, 'cart')}<button class="text-button" type="button" data-action="remove-product" data-product="${esc(item.product.id)}" aria-label="Elimină ${esc(item.product.name)} din coș">Elimină</button></div></div><div class="line-total">${money(item.lineTotal)} <small>lei</small></div></article>`).join('')}</div><div class="cart-continue"><a class="text-link" href="#/catalog"><span aria-hidden="true">←</span> Continuă explorarea</a><button class="text-button" type="button" data-action="clear-cart">Golește coșul</button></div></section>${summaryPanel(summary)}</div></div>`;
  }

  function steps() {
    return `<div class="steps" aria-label="Etapa 2 din 3"><span><b>1</b> Coș</span><i class="step-rule"></i><span class="current"><b>2</b> Date de livrare</span><i class="step-rule"></i><span><b>3</b> Rezultat</span></div>`;
  }

  function checkoutPage() {
    const summary = Store.cartSummary(cart, products);
    if (!summary.count) return emptyCart();
    const field = (name, label, type, autocomplete, full = false, placeholder = '') => `<div class="field${full ? ' field-full' : ''}"><label for="checkout-${name}">${label}</label><input id="checkout-${name}" name="${name}" type="${type}" autocomplete="${autocomplete}" ${placeholder ? `placeholder="${placeholder}"` : ''} required maxlength="${name === 'address' ? '250' : '120'}" aria-describedby="error-${name}"><span class="field-error" id="error-${name}"></span></div>`;
    return `<div class="wrap">${breadcrumbs([{ label: 'Coș', href: '#/cos' }, { label: 'Finalizare demonstrativă' }])}<div class="page-heading"><div><h1>Ultimul pas al demonstrației.</h1><p>Verifică produsele și completează un exemplu de date de livrare.</p></div>${steps()}</div><div class="commerce-layout"><section><div class="demo-notice">${icons.info}<div><strong>Finalizare demonstrativă</strong><p>Folosește date fictive. Formularul se verifică doar în această pagină; nu trimite date și nu plasează o comandă.</p></div></div><form id="checkout-form" data-form="checkout" novalidate><div class="form-top"><h2>Date de livrare</h2><button class="text-button" type="button" data-action="fill-example">Completează un exemplu</button></div><div class="form-errors" id="checkout-errors" role="alert" hidden></div><div class="field-grid">${field('name', 'Nume complet', 'text', 'off', true, 'Ex.: Client Demo')}${field('email', 'Email', 'email', 'off', false, 'demo@example.com')}${field('phone', 'Telefon', 'tel', 'off', false, '0700 000 000')}${field('county', 'Județ / Sector', 'text', 'off', false, 'Ex.: Ilfov')}${field('city', 'Localitate', 'text', 'off', false, 'Ex.: Cernica')}${field('address', 'Adresă de livrare', 'text', 'off', true, 'Stradă, număr, bloc, apartament')}</div><label class="acknowledge" for="checkout-acknowledge"><input type="checkbox" id="checkout-acknowledge" name="acknowledge" required aria-describedby="error-acknowledge"><span>Înțeleg că acesta este un demo și că nu se plasează o comandă.</span></label><span class="field-error" id="error-acknowledge"></span><button class="primary checkout-submit" type="submit">Verifică și finalizează demo-ul <span aria-hidden="true">↗</span></button><p class="privacy-note">Datele formularului nu sunt păstrate după finalizare. Nu sunt solicitate date de plată.</p></form></section>${summaryPanel(summary, true)}</div></div>`;
  }

  function confirmationPage() {
    if (!checkoutResult) return `<div class="wrap">${breadcrumbs([{ label: 'Rezultatul demonstrației' }])}<section class="empty-state"><div class="empty-icon">${icons.info}</div><h1>Nu există o simulare de afișat.</h1><p>Poți începe o nouă demonstrație din catalog.</p><a class="primary" href="#/catalog">Vezi produsele <span aria-hidden="true">↗</span></a></section></div>`;
    return `<div class="wrap confirmation"><div class="confirmation-head"><div class="success-icon">${icons.check}</div><span class="eyebrow">Traseu parcurs cu succes</span><h1>Demonstrație încheiată.</h1><p>Datele au fost validate local. <strong>Nicio comandă nu a fost transmisă și nicio plată nu a fost inițiată.</strong> Acesta este un exemplu al experienței de cumpărare.</p></div><section class="confirmation-summary"><h2>Produsele din simulare</h2>${checkoutResult.items.map(item => `<div class="checkout-item"><div><strong>${esc(item.product.name)}</strong><small>Cantitate: ${item.quantity}</small></div><span>${money(item.lineTotal)} lei</span></div>`).join('')}<div class="summary-row summary-total"><span>Subtotal produse</span>${price(checkoutResult.subtotal)}</div><p class="snapshot-note">Transport necalculat. Coșul a fost golit pentru următoarea prezentare.</p></section><div class="confirmation-actions"><a class="primary" href="#/catalog">Înapoi la catalog <span aria-hidden="true">↗</span></a><button type="button" class="secondary" data-action="reset-demo">Reia demonstrația</button></div></div>`;
  }

  function contactPage() {
    const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(business.address);
    return `<div class="wrap">${breadcrumbs([{ label: 'Despre magazin și contact' }])}<div class="contact-heading"><span class="eyebrow">RoInstalații</span><h1>Un punct de contact pentru proiectul tău.</h1><p>Ai o întrebare despre un model sau o comandă? Folosește datele de contact ale magazinului pentru informațiile de care ai nevoie.</p></div><section class="contact-grid" aria-label="Date de contact"><article class="contact-card">${icons.phone}<h2>Telefon</h2><a class="contact-value" href="${esc(business.phoneHref)}">${esc(business.phoneDisplay)}</a><p>Discută cu magazinul despre produse și comenzi.</p></article><article class="contact-card">${icons.mail}<h2>Email</h2><a class="contact-value" href="mailto:${esc(business.email)}">${esc(business.email)}</a><p>Include modelul sau codul produsului în mesajul tău.</p></article><article class="contact-card location">${icons.pin}<h2>Punct de lucru</h2><div class="contact-value">Str. Oxigenului nr. 4A<br>Cernica, Ilfov</div><p>Cod poștal 077035.<br>Confirmă cu magazinul detaliile înaintea unei deplasări.</p><a class="text-link" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">Deschide harta <span aria-hidden="true">↗</span></a></article></section><section class="about-grid"><div><span class="eyebrow">Despre magazin</span><h2>Echipamente pentru instalații și confort.</h2><p>RoInstalatii.Ro este un magazin online de instalații sanitare și termice. Oferta include centrale termice, pompe de căldură, aer condiționat, boilere, termostate și accesorii.</p><p>În această prezentare poți explora ${products.length} de produse reprezentative și un traseu complet de cumpărare demonstrativă.</p><a class="text-link" href="#/catalog">Explorează selecția <span aria-hidden="true">↗</span></a></div><div class="company-details"><strong>${esc(business.operator)}</strong><p>CUI: ${esc(business.cui)}</p><hr><strong>Sediu social</strong><p>Str. Verdeței nr. 12, sector 3<br>București, 030886</p><p>Sediul social nu este punct de ridicare a comenzilor.</p><hr><a class="original-link" href="https://www.roinstalatii.ro/contact" target="_blank" rel="noopener noreferrer">Informațiile de contact din sursă ↗</a></div></section></div>`;
  }

  function notFound() {
    return `<section class="wrap empty-state"><div class="empty-icon">${icons.info}</div><h1>Pagina nu a fost găsită.</h1><p>Revino la catalog pentru a explora produsele disponibile în demo.</p><a class="primary" href="#/catalog">Deschide catalogul <span aria-hidden="true">↗</span></a></section>`;
  }

  function saveCart() {
    cart = Store.sanitizeCart(cart, products);
    if (storageAvailable) {
      try { window.localStorage.setItem(storageKey, JSON.stringify(cart)); }
      catch (error) { storageAvailable = false; }
    }
    updateCartBadge();
  }

  function updateCartBadge() {
    const { count } = Store.cartSummary(cart, products);
    const badge = document.getElementById('cart-count');
    badge.textContent = count;
    badge.classList.toggle('has-many', count > 99);
    document.getElementById('cart-link').setAttribute('aria-label', `Coșul tău, ${count} ${count === 1 ? 'produs' : 'produse'}`);
  }

  function showToast(message, showLink = true) {
    clearTimeout(toastTimer);
    document.getElementById('toast-message').textContent = message;
    document.getElementById('toast-link').hidden = !showLink;
    document.getElementById('toast').hidden = false;
    // A focused notification stays available until its close button is used.
    toastTimer = setTimeout(() => { if (!document.getElementById('toast').contains(document.activeElement)) document.getElementById('toast').hidden = true; }, 6500);
  }

  function addProduct(id, quantity = 1) {
    const product = productById(id);
    if (!product) return;
    const oldQuantity = cart[id] || 0;
    cart = Store.addToCart(cart, id, products, quantity);
    saveCart();
    if (oldQuantity >= 99) showToast('Ai atins limita de 99 de bucăți pentru acest produs.');
    else showToast(`${product.name} — adăugat în coș.${!storageAvailable ? ' Coșul rămâne doar în fila curentă.' : ''}`);
  }

  function navigate(path, intent = {}) {
    renderIntent = intent;
    if (window.location.hash === '#' + path) render();
    else window.location.hash = path;
  }

  function rerenderCart(focusId) {
    const scrollY = window.scrollY;
    main.innerHTML = cartPage();
    if (focusId) {
      let target = document.getElementById(focusId);
      if (target?.disabled) target = target.closest('.quantity').querySelector('input');
      target?.focus({ preventScroll: true });
    }
    window.scrollTo(0, scrollY);
  }

  function render() {
    const hash = window.location.hash.slice(1) || '/';
    // Direct links to the skip target still load a complete page.
    const raw = hash === 'main-content' ? '/' : hash;
    const intent = renderIntent || {};
    renderIntent = null;
    const scrollY = window.scrollY;
    currentRoute = raw.split('?')[0].replace(/\/$/, '') || '/';
    let html;
    let title;
    if (currentRoute === '/') { html = home(); title = 'Confortul casei tale'; }
    else if (currentRoute === '/catalog') { html = catalog(); title = categoryById(readFilters().category)?.name || 'Catalog'; }
    else if (currentRoute.startsWith('/produs/')) {
      let id = '';
      try { id = decodeURIComponent(currentRoute.slice(8)); } catch (error) { /* Invalid path uses the normal not-found screen. */ }
      const product = productById(id);
      html = product ? productPage(product) : notFound();
      title = product ? product.name : 'Pagina nu a fost găsită';
    } else if (currentRoute === '/cos') { html = cartPage(); title = 'Coșul tău'; }
    else if (currentRoute === '/finalizare') { html = checkoutPage(); title = 'Finalizare demonstrativă'; }
    else if (currentRoute === '/confirmare') { html = confirmationPage(); title = 'Rezultatul demonstrației'; }
    else if (currentRoute === '/contact') { html = contactPage(); title = 'Despre magazin și contact'; }
    else { html = notFound(); title = 'Pagina nu a fost găsită'; }
    main.innerHTML = html;
    document.title = `${title} — RoInstalații`;
    searchInput.value = currentRoute === '/catalog' ? readFilters().query : '';
    document.getElementById('mobile-menu').open = false;
    document.querySelectorAll('.main-nav a, .header-contact').forEach(link => {
      if (link.getAttribute('href') === '#' + raw) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    updateCartBadge();
    if (intent.keepScroll) {
      window.scrollTo(0, scrollY);
      if (intent.focusId) document.getElementById(intent.focusId)?.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, 0);
      if (!intent.initial) main.focus({ preventScroll: true });
    }
  }

  document.getElementById('site-search').addEventListener('submit', event => {
    event.preventDefault();
    filterOpen = false;
    navigate(filterPath({ query: searchInput.value.trim(), category: '', brands: [], sort: 'recommended' }));
  });

  document.addEventListener('click', event => {
    const internalLink = event.target.closest('a[href^="#/"]');
    if (internalLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      document.getElementById('mobile-menu').open = false;
      if (internalLink.getAttribute('href') === window.location.hash) {
        event.preventDefault();
        navigate(window.location.hash.slice(1));
      }
    }
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;
    const { action, product: id } = actionElement.dataset;
    if (action === 'add') addProduct(id);
    else if (action === 'toggle-filters') {
      filterOpen = !filterOpen;
      actionElement.closest('.filters').classList.toggle('is-open', filterOpen);
      actionElement.setAttribute('aria-expanded', String(filterOpen));
      actionElement.lastElementChild.textContent = filterOpen ? '−' : '+';
    } else if (action === 'clear-filters') navigate('/catalog', { keepScroll: true, focusId: 'catalog-sort' });
    else if (action === 'remove-filter') {
      const filters = readFilters();
      if (actionElement.dataset.filter === 'query') filters.query = '';
      if (actionElement.dataset.filter === 'category') filters.category = '';
      if (actionElement.dataset.filter === 'brand') filters.brands = filters.brands.filter(brand => brand !== actionElement.dataset.value);
      navigate(filterPath(filters), { keepScroll: true, focusId: 'catalog-sort' });
    } else if (action === 'quantity-step') {
      const step = Number(actionElement.dataset.step);
      if (actionElement.dataset.scope === 'cart') {
        cart = Store.setQuantity(cart, id, Math.max(1, Math.min(99, (cart[id] || 1) + step)), products);
        saveCart();
        rerenderCart(actionElement.id);
      } else {
        const input = document.getElementById('product-quantity');
        const value = Number.isInteger(Number(input.value)) ? Number(input.value) : 1;
        input.value = Math.max(1, Math.min(99, value + step));
        document.getElementById('minus-' + id).disabled = Number(input.value) <= 1;
        document.getElementById('plus-' + id).disabled = Number(input.value) >= 99;
        if (actionElement.disabled) input.focus({ preventScroll: true });
      }
    } else if (action === 'remove-product') {
      cart = Store.setQuantity(cart, id, 0, products);
      saveCart();
      rerenderCart();
      main.focus({ preventScroll: true });
      showToast('Produsul a fost eliminat din coș.', false);
    } else if (action === 'clear-cart') {
      cart = {};
      saveCart();
      rerenderCart();
      main.focus({ preventScroll: true });
      showToast('Coșul a fost golit.', false);
    } else if (action === 'reset-demo') {
      cart = {};
      checkoutResult = null;
      filterOpen = false;
      saveCart();
      navigate('/');
      showToast('Demo-ul a fost resetat. Poți începe o nouă prezentare.', false);
    } else if (action === 'fill-example') {
      const values = { name: 'Client Demo', email: 'demo@example.com', phone: '0700 000 000', county: 'Ilfov', city: 'Cernica', address: 'Strada Exemplu nr. 1' };
      Object.entries(values).forEach(([name, value]) => { document.getElementById('checkout-' + name).value = value; });
      clearCheckoutErrors();
      document.getElementById('checkout-acknowledge').focus();
    }
  });

  document.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[name="category"], [name="brand"], #catalog-sort')) {
      const filters = readFilters();
      if (input.name === 'category') filters.category = input.value;
      if (input.name === 'brand') filters.brands = Array.from(main.querySelectorAll('[name="brand"]:checked'), item => item.value);
      if (input.id === 'catalog-sort') filters.sort = input.value;
      navigate(filterPath(filters), { keepScroll: true, focusId: input.id });
    } else if (input.matches('[data-cart-quantity]')) {
      const id = input.dataset.cartQuantity;
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        input.value = cart[id] || 1;
        showToast('Folosește o cantitate între 1 și 99.', false);
        return;
      }
      cart = Store.setQuantity(cart, id, quantity, products);
      saveCart();
      rerenderCart(input.id);
    } else if (input.id === 'product-quantity') {
      const form = input.closest('form');
      const id = form.dataset.product;
      const quantity = Number(input.value);
      document.getElementById('minus-' + id).disabled = quantity <= 1;
      document.getElementById('plus-' + id).disabled = quantity >= 99;
    }
  });

  function clearCheckoutErrors() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(element => { element.textContent = ''; });
    document.getElementById('checkout-errors').hidden = true;
  }

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form.dataset.form) return;
    event.preventDefault();
    if (form.dataset.form === 'add-product') {
      const input = document.getElementById('product-quantity');
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        input.focus();
        showToast('Folosește o cantitate între 1 și 99.', false);
        return;
      }
      addProduct(form.dataset.product, quantity);
    } else if (form.dataset.form === 'checkout') {
      clearCheckoutErrors();
      const values = Object.fromEntries(new FormData(form));
      values.acknowledge = document.getElementById('checkout-acknowledge').checked;
      const errors = Store.validateCheckout(values);
      const fields = Object.keys(errors);
      if (fields.length) {
        fields.forEach(name => {
          document.getElementById('checkout-' + name).setAttribute('aria-invalid', 'true');
          document.getElementById('error-' + name).textContent = errors[name];
        });
        const message = document.getElementById('checkout-errors');
        message.textContent = `Verifică ${fields.length === 1 ? 'câmpul marcat' : 'cele ' + fields.length + ' câmpuri marcate'} pentru a continua demonstrația.`;
        message.hidden = false;
        document.getElementById('checkout-' + fields[0]).focus();
        return;
      }
      checkoutResult = Store.cartSummary(cart, products);
      if (!checkoutResult.count) { navigate('/cos'); return; }
      cart = {};
      saveCart();
      form.reset();
      document.getElementById('toast').hidden = true;
      navigate('/confirmare');
    }
  });

  document.getElementById('toast-close').addEventListener('click', () => {
    document.getElementById('toast').hidden = true;
    document.getElementById('cart-link').focus({ preventScroll: true });
  });
  document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); main.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const menu = document.getElementById('mobile-menu');
      if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
      if (document.getElementById('toast').contains(document.activeElement)) document.getElementById('cart-link').focus();
      document.getElementById('toast').hidden = true;
    }
  });
  document.querySelectorAll('[data-product-count]').forEach(element => { element.textContent = products.length; });
  window.addEventListener('hashchange', render);
  renderIntent = { initial: true };
  render();
})();
