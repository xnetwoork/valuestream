// ==============================================================================
// VALUE HUB STORE — Client-side Interactivity & Order Engine (Arabic First)
// Canonical Domain: https://value-hub.store | Currency: MAD
// ==============================================================================

(function() {
  const data = window.VALUE_HUB || {};
  let currentGoal = 'all';
  let currentCategory = 'all';
  let activeOrderTarget = null; // { name, price, type, sku }

  // DOM Elements
  const goalRailEl = document.getElementById('goalRail');
  const packsGridEl = document.getElementById('packsGrid');
  const productsGridEl = document.getElementById('productsGrid');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const orderModal = document.getElementById('orderModal');
  const orderTargetName = document.getElementById('orderTargetName');
  const orderTargetDesc = document.getElementById('orderTargetDesc');
  const orderTargetPrice = document.getElementById('orderTargetPrice');
  const orderCitySelect = document.getElementById('orderCity');
  const deliveryEstimate = document.getElementById('deliveryEstimate');
  const stickyBar = document.getElementById('stickyMobileBar');
  const stickyTitle = document.getElementById('stickyBarTitle');

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initGoals();
    renderPacks();
    renderProducts();
    initSearch();
    initCities();
    initOrderForm();
    initFaq();
  });

  // 1. Goal Selection
  function initGoals() {
    if (!goalRailEl) return;
    const goals = [
      { id: 'all', label: 'جميع الروتينات' },
      { id: 'daily', label: 'العناية اليومية' },
      { id: 'calm', label: 'الهدوء والاسترخاء' },
      { id: 'sleep', label: 'النوم والراحة' },
      { id: 'hair', label: 'العناية بالشعر' },
      { id: 'glow', label: 'إشراقة البشرة' },
      { id: 'clarity', label: 'صفاء البشرة' },
      { id: 'beauty_inside', label: 'الجمال من الداخل' },
      { id: 'active', label: 'النشاط والطاقة' },
      { id: 'fresh', label: 'الانتعاش الشخصي' }
    ];

    goalRailEl.innerHTML = goals.map(g => `
      <button class="goal-btn ${g.id === currentGoal ? 'active' : ''}" data-goal="${g.id}">
        ${g.label}
      </button>
    `).join('');

    goalRailEl.querySelectorAll('.goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        goalRailEl.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentGoal = btn.dataset.goal;
        renderPacks();
        renderProducts();
      });
    });
  }

  // 2. Render 12 Packs (or filtered by Goal)
  function renderPacks() {
    if (!packsGridEl) return;
    const packs = data.packs || [];
    const filtered = currentGoal === 'all' 
      ? packs 
      : packs.filter(p => p.intent === currentGoal || (currentGoal === 'beauty_inside' && p.intent === 'beauty'));

    if (filtered.length === 0) {
      packsGridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted)">
          لا توجد باكات خاصة بهذا الهدف حاليًا. استعرض جميع الباكات بالضغط على "جميع الروتينات".
        </div>
      `;
      return;
    }

    packsGridEl.innerHTML = filtered.map(pack => {
      // Find item names from SKUs
      const itemNames = (pack.skus || []).map(sku => {
        const prod = (data.products || []).find(p => p.sku === sku);
        return prod ? prod.title : sku;
      });

      const savings = (pack.observed_individual_total_mad || 0) > pack.price_mad
        ? `<span class="badge warm">وفر ${(pack.observed_individual_total_mad - pack.price_mad)} د.م.</span>`
        : `<span class="badge primary">التوصيل مشمول</span>`;

      return `
        <article class="pack-card" data-slug="${pack.slug}">
          <div class="pack-card-header">
            <div class="pack-card-top">
              <span class="badge primary">Pack 189</span>
              ${savings}
            </div>
            <h3 class="pack-card-title">${pack.name}</h3>
            <p class="pack-card-desc">${pack.description}</p>
          </div>

          <div class="pack-items-box">
            <div class="pack-items-box-title">
              <i class="fas fa-box-open"></i> المحتويات (3 منتجات كاملة):
            </div>
            <ul class="pack-items-list">
              ${itemNames.map(name => `<li>${name}</li>`).join('')}
            </ul>
          </div>

          <div class="pack-card-footer">
            <div class="pack-price-block">
              <span class="pack-price-val">${pack.price_mad} <small style="font-size:16px">د.م.</small></span>
              <span class="pack-price-sub">الدفع عند الاستلام</span>
            </div>
            <div class="pack-card-actions">
              <button class="btn btn-primary btn-sm open-order-btn" 
                data-name="${pack.name}" 
                data-price="${pack.price_mad}" 
                data-desc="${pack.description}" 
                data-type="pack">
                اطلب الآن
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach order events
    packsGridEl.querySelectorAll('.open-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openOrderModal({
          name: btn.dataset.name,
          price: btn.dataset.price,
          desc: btn.dataset.desc,
          type: btn.dataset.type
        });
      });
    });
  }

  // 3. Render Product Catalog
  function renderProducts() {
    if (!productsGridEl) return;
    const prods = data.products || [];
    let filtered = prods;

    if (currentGoal !== 'all') {
      filtered = filtered.filter(p => p.intent === currentGoal);
    }
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (filtered.length === 0) {
      productsGridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted)">
          لم يتم العثور على منتجات مطابقة لهذا الفلتر.
        </div>
      `;
      return;
    }

    // Limit to 12 on home page, show all on shop page
    const isShopPage = window.location.pathname.includes('/shop');
    const displayList = isShopPage ? filtered : filtered.slice(0, 12);

    productsGridEl.innerHTML = displayList.map(prod => `
      <article class="product-card" data-sku="${prod.sku}">
        <div>
          <div class="product-card-top">
            <span class="badge">${prod.categoryLabel}</span>
            <span style="font-size:12px; color:var(--muted)">${prod.form}</span>
          </div>
          <h4 class="product-title">${prod.title}</h4>
          <p class="product-desc">${prod.metaDescription}</p>
        </div>

        <div class="product-card-footer">
          <div class="product-price">
            ${prod.priceMad} <small style="font-size:14px; font-weight:normal">د.م.</small>
          </div>
          <button class="btn btn-outline btn-sm open-order-btn"
            data-name="${prod.title}" 
            data-price="${prod.priceMad}" 
            data-desc="${prod.categoryLabel} — ${prod.form}" 
            data-type="product">
            طلب المنتج
          </button>
        </div>
      </article>
    `).join('');

    productsGridEl.querySelectorAll('.open-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openOrderModal({
          name: btn.dataset.name,
          price: btn.dataset.price,
          desc: btn.dataset.desc,
          type: btn.dataset.type
        });
      });
    });
  }

  // 4. Bilingual Search Engine (Arabic + French Synonyms)
  function initSearch() {
    const searchToggleButtons = document.querySelectorAll('.search-toggle-btn');
    const searchCloseBtn = document.getElementById('searchCloseBtn');

    searchToggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (searchModal) {
          searchModal.classList.add('open');
          searchInput.focus();
        }
      });
    });

    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', () => {
        searchModal.classList.remove('open');
      });
    }

    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) searchModal.classList.remove('open');
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        handleSearch(query);
      });
    }
  }

  function handleSearch(q) {
    if (!searchResults) return;
    if (!q || q.length < 2) {
      searchResults.innerHTML = `
        <div class="search-empty">
          اكتب اسم المكمل، الهدف (نوم، شعر، مغنيسيوم)، أو بالفرنسية (collagène, magnésium)...
        </div>
      `;
      return;
    }

    const prods = data.products || [];
    const packs = data.packs || [];
    const synonyms = data.synonyms || {};

    const matches = [];

    // Search packs
    packs.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.intent.toLowerCase().includes(q)) {
        matches.push({
          title: p.name,
          sub: `${p.price_mad} د.م. · ${p.description}`,
          type: 'pack',
          raw: p
        });
      }
    });

    // Search products with synonyms
    prods.forEach(prod => {
      const prodSyns = (synonyms[prod.sku] || []).map(s => s.toLowerCase());
      const hit = prod.title.toLowerCase().includes(q) 
               || prod.fullTitle.toLowerCase().includes(q)
               || prod.primaryKeyword.toLowerCase().includes(q)
               || prodSyns.some(s => s.includes(q));

      if (hit) {
        matches.push({
          title: prod.title,
          sub: `${prod.categoryLabel} · ${prod.priceMad} د.م.`,
          type: 'product',
          raw: prod
        });
      }
    });

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty">
          لم نجد نتائج مطابقة لـ "<b>${q}</b>". جرب كلمة أخرى مثل: كولاجين، شعر، فيتامين، مغنيسيوم.
        </div>
      `;
      return;
    }

    searchResults.innerHTML = matches.slice(0, 8).map(m => `
      <div class="search-item" data-title="${m.title}" data-price="${m.raw.price_mad || m.raw.priceMad}" data-desc="${m.sub}" data-type="${m.type}">
        <div class="search-item-info">
          <strong>${m.title}</strong>
          <span>${m.sub}</span>
        </div>
        <span class="badge ${m.type === 'pack' ? 'primary' : ''}">${m.type === 'pack' ? 'Pack 189' : 'منتج'}</span>
      </div>
    `).join('');

    searchResults.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        searchModal.classList.remove('open');
        openOrderModal({
          name: item.dataset.title,
          price: item.dataset.price,
          desc: item.dataset.desc,
          type: item.dataset.type
        });
      });
    });
  }

  // 5. Moroccan Cities & Delivery Calculation
  function initCities() {
    if (!orderCitySelect) return;
    const cities = data.cities || [];
    orderCitySelect.innerHTML = `
      <option value="">اختر مدينتك في المغرب...</option>
      ${cities.map(c => `<option value="${c.name}" data-delay="${c.delay}">${c.name}</option>`).join('')}
    `;

    orderCitySelect.addEventListener('change', () => {
      const selected = orderCitySelect.options[orderCitySelect.selectedIndex];
      const delay = selected.getAttribute('data-delay');
      if (deliveryEstimate) {
        if (delay) {
          deliveryEstimate.innerHTML = `<i class="fas fa-truck-fast"></i> مدة التوصيل المتوقعة: <b>${delay}</b> (الدفع عند الاستلام)`;
          deliveryEstimate.style.display = 'block';
        } else {
          deliveryEstimate.style.display = 'none';
        }
      }
    });
  }

  // 6. 1-Click Cash on Delivery Order Modal
  function openOrderModal(target) {
    activeOrderTarget = target;
    if (orderTargetName) orderTargetName.textContent = target.name;
    if (orderTargetDesc) orderTargetDesc.textContent = target.desc;
    if (orderTargetPrice) orderTargetPrice.textContent = `${target.price} د.م.`;
    if (orderModal) orderModal.classList.add('open');

    // Update sticky bar title
    if (stickyTitle) stickyTitle.textContent = `${target.name} · ${target.price} د.م.`;
  }
  window.openOrderModal = openOrderModal;

  function initOrderForm() {
    const orderForm = document.getElementById('orderForm');
    const orderCloseBtn = document.getElementById('orderCloseBtn');

    if (orderCloseBtn) {
      orderCloseBtn.addEventListener('click', () => {
        orderModal.classList.remove('open');
      });
    }

    if (orderModal) {
      orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) orderModal.classList.remove('open');
      });
    }

    if (orderForm) {
      orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        const city = orderCitySelect.value;
        const address = document.getElementById('orderAddress').value.trim();

        // Validation
        if (!name || !phone || !city) {
          alert('يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، والمدينة).');
          return;
        }

        // Moroccan phone validation check
        const phoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
        if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
          alert('يرجى إدخال رقم هاتف مغربي صحيح (مثال: 0612345678 أو 0712345678).');
          return;
        }

        // WhatsApp direct confirmation payload
        const waText = encodeURIComponent(
          `السلام عليكم، أود تأكيد طلبي من متجر VALUE HUB:\n\n` +
          `📦 الطلب: ${activeOrderTarget ? activeOrderTarget.name : 'Pack 189'}\n` +
          `💰 المبلغ: ${activeOrderTarget ? activeOrderTarget.price : 189} د.م. (الدفع عند الاستلام)\n` +
          `👤 الاسم: ${name}\n` +
          `📱 الهاتف: ${phone}\n` +
          `📍 المدينة: ${city}\n` +
          `🏠 العنوان: ${address || 'سيتم تأكيده عبر الهاتف'}`
        );

        const waUrl = `https://wa.me/${data.brand.whatsapp}?text=${waText}`;

        // Render Success in Modal
        const modalBody = orderModal.querySelector('.order-modal-body');
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 20px 10px;">
            <div style="width: 64px; height: 64px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 18px;">
              ✓
            </div>
            <h3 style="font-size: 22px; font-weight: 800; color: var(--ink); margin-bottom: 10px;">تم تسجيل طلبك بنجاح!</h3>
            <p style="color: var(--muted); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              شكرًا لك يا <b>${name}</b>. سنتصل بك هاتفيًا خلال ساعات لتأكيد شحن طلبك إلى <b>${city}</b> مع خدمة الدفع عند الاستلام.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-lg">
                <i class="fab fa-whatsapp"></i> تأكيد فوري عبر الواتساب
              </a>
              <button class="btn btn-secondary" onclick="window.location.reload()">
                العودة للمتجر
              </button>
            </div>
          </div>
        `;
      });
    }
  }

  // 7. FAQ Accordion
  function initFaq() {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('open');
      });
    });
  }

})();
