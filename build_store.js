const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'extracted_v2/VALUE_HUB_STORE_SUPERFOOD_CARE_WEBSITE_OS_v2_MOROCCO_AR_SEO_2026-10-13');

// 1. Read catalog seed
const csv = fs.readFileSync(path.join(basePath, '04_PRODUCT_KB/catalog_seed.csv'), 'utf8');
const lines = csv.trim().split('\n');
const seedMap = {};
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length >= 8) {
    seedMap[parts[0].trim()] = {
      sku: parts[0].trim(),
      displayNameAr: parts[1].trim(),
      category: parts[2].trim(),
      form: parts[3].trim(),
      priceMad: parseInt(parts[4].trim(), 10) || 45,
      intent: parts[5].trim(),
      safetyStatus: parts[6].trim(),
      packEligible: parts[7].trim() === 'true'
    };
  }
}

// 2. Read SEO metadata
const seoMeta = JSON.parse(fs.readFileSync(path.join(basePath, '15_ARABIC_STOREFRONT/product_seo_metadata_ar.json'), 'utf8'));

// 3. Read packs
const packs = JSON.parse(fs.readFileSync(path.join(basePath, '05_PACKS_189/packs.json'), 'utf8'));

// 4. Read synonyms
const synonyms = JSON.parse(fs.readFileSync(path.join(basePath, '15_ARABIC_STOREFRONT/search_synonyms_ar_fr.json'), 'utf8'));

// 5. Read blogs
const blogsDir = path.join(basePath, '14_MOROCCO_AR_SEO/blogs_ar');
const blogFiles = fs.readdirSync(blogsDir).sort();
const blogs = blogFiles.map(f => {
  const content = fs.readFileSync(path.join(blogsDir, f), 'utf8');
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  const kwMatch = content.match(/primary_keyword:\s*["']([^"']+)["']/);
  const clusterMatch = content.match(/cluster:\s*([^\n\r]+)/);
  const excerptMatch = content.match(/## 1\.[^\n]+\n\n([^\n\r]+)/);
  const bodyText = content.replace(/^---[\s\S]*?---/, '').trim();
  
  return {
    id: f.replace('.md', ''),
    title: titleMatch ? titleMatch[1] : 'دليل VALUE HUB',
    keyword: kwMatch ? kwMatch[1] : '',
    cluster: clusterMatch ? clusterMatch[1].trim() : 'daily',
    excerpt: excerptMatch ? excerptMatch[1] : 'دليل إرشادي عملي حول اختيار المكملات وروتينات العناية في المغرب.',
    content: bodyText
  };
});

// Category Arabic names mapping
const categoryLabels = {
  supplements: 'مكملات غذائية',
  superfood: 'سوبرفود وأغذية طبيعية',
  skin: 'العناية بالبشرة',
  hair: 'العناية بالشعر',
  bodycare: 'العناية بالجسم والانتعاش'
};

// Goals mapping
const goalLabels = {
  daily: 'العناية اليومية',
  calm: 'الهدوء والاسترخاء',
  sleep: 'النوم والراحة',
  hair: 'العناية بالشعر',
  glow: 'إشراقة البشرة',
  clarity: 'صفاء البشرة',
  beauty_inside: 'الجمال من الداخل',
  beauty: 'شعر وأظافر وجمال',
  active: 'النشاط والطاقة',
  vitality: 'الحيوية والنشاط',
  fresh: 'الانتعاش الشخصي',
  bodycare: 'العناية بالجسم'
};

// Filter 56 indexed products
const products = seoMeta
  .filter(p => p.indexable)
  .map(p => {
    const seed = seedMap[p.sku] || {};
    return {
      sku: p.sku,
      title: p.title_ar.replace(' في المغرب | VALUE HUB', ''),
      fullTitle: p.title_ar,
      metaDescription: p.meta_description_ar,
      primaryKeyword: p.primary_keyword,
      intent: p.intent,
      intentLabel: goalLabels[p.intent] || 'العناية اليومية',
      category: seed.category || 'supplements',
      categoryLabel: categoryLabels[seed.category] || 'مكملات غذائية',
      form: seed.form || 'capsules',
      priceMad: seed.priceMad || 49,
      packEligible: seed.packEligible !== false,
      synonyms: synonyms[p.sku] || []
    };
  });

// Moroccan Cities Delivery Matrix
const moroccanCities = [
  { name: 'الدار البيضاء', delay: '24 ساعة (توصيل فوري)', zone: 'A' },
  { name: 'الرباط - سلا', delay: '24 ساعة (توصيل فوري)', zone: 'A' },
  { name: 'مراكش', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'طنجة', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'فاس', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'أكادير', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'مكناس', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'وجدة', delay: '48 ساعة', zone: 'C' },
  { name: 'القنيطرة', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'تطوان', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'الجديدة', delay: '24 إلى 48 ساعة', zone: 'B' },
  { name: 'المحمدية', delay: '24 ساعة', zone: 'A' },
  { name: 'آسفي', delay: '48 ساعة', zone: 'C' },
  { name: 'بني ملال', delay: '48 ساعة', zone: 'C' },
  { name: 'الناظور', delay: '48 ساعة', zone: 'C' },
  { name: 'خريبكة', delay: '48 ساعة', zone: 'C' },
  { name: 'العيون', delay: '48 إلى 72 ساعة', zone: 'D' },
  { name: 'الداخلة', delay: '48 إلى 72 ساعة', zone: 'D' },
  { name: 'باقي المدن والمناطق', delay: '48 إلى 72 ساعة', zone: 'D' }
];

// Write store-data.js
const storeDataJs = `// VALUE HUB STORE — Arabic Storefront Data & Dynamic Engine
// Canonical Origin: https://value-hub.store | Currency: MAD (Moroccan Dirham)

window.VALUE_HUB = {
  domain: "https://value-hub.store",
  brand: {
    name: "VALUE HUB",
    nameAr: "فاليو هاب المغرب",
    tagline: "سوبرفود، مكملات وعناية — باختيار أبسط وروتين أوضح",
    phone: "+212 6 00 00 00 00",
    whatsapp: "212600000000",
    supportEmail: "contact@value-hub.store",
    currency: "د.م.",
    currencyCode: "MAD",
    packPrice: 189
  },
  goalLabels: ${JSON.stringify(goalLabels, null, 2)},
  categoryLabels: ${JSON.stringify(categoryLabels, null, 2)},
  cities: ${JSON.stringify(moroccanCities, null, 2)},
  packs: ${JSON.stringify(packs, null, 2)},
  products: ${JSON.stringify(products, null, 2)},
  synonyms: ${JSON.stringify(synonyms, null, 2)},
  guides: ${JSON.stringify(blogs.map(b => ({ id: b.id, title: b.title, keyword: b.keyword, cluster: b.cluster, excerpt: b.excerpt })), null, 2)}
};
`;

fs.writeFileSync(path.join(__dirname, 'assets/js/store-data.js'), storeDataJs, 'utf8');
console.log('Generated assets/js/store-data.js successfully!');

// Write full guides data
const guidesJs = `// VALUE HUB STORE — Educational Guides & Research Data
window.VALUE_HUB_GUIDES = ${JSON.stringify(blogs, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, 'assets/js/guides-data.js'), guidesJs, 'utf8');
console.log('Generated assets/js/guides-data.js successfully with ' + blogs.length + ' articles!');

// 6. Generate Canonical sitemap.xml
const today = new Date().toISOString().split('T')[0];
const baseUrl = 'https://value-hub.store';

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Core Storefront Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar-MA" href="${baseUrl}/"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/"/>
  </url>
  <url>
    <loc>${baseUrl}/packs/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar-MA" href="${baseUrl}/packs/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/packs/"/>
  </url>
  <url>
    <loc>${baseUrl}/shop/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar-MA" href="${baseUrl}/shop/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/shop/"/>
  </url>
  <url>
    <loc>${baseUrl}/guides/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="ar-MA" href="${baseUrl}/guides/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/guides/"/>
  </url>
  <url>
    <loc>${baseUrl}/delivery/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="ar-MA" href="${baseUrl}/delivery/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/delivery/"/>
  </url>
`;

// Add 12 Packs to sitemap
sitemapXml += `  <!-- 12 Pack 189 Signature Pages -->\n`;
packs.forEach(p => {
  sitemapXml += `  <url>
    <loc>${baseUrl}/packs/#${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
});

// Add 56 Indexed Products to sitemap
sitemapXml += `  <!-- 56 Indexed Verified Products -->\n`;
products.forEach(p => {
  sitemapXml += `  <url>
    <loc>${baseUrl}/shop/#${p.sku}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>\n`;
});

// Add 36 Educational Blogs
sitemapXml += `  <!-- 36 Educational Guides & Blogs -->\n`;
blogs.forEach(b => {
  sitemapXml += `  <url>
    <loc>${baseUrl}/guides/#${b.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

sitemapXml += `</urlset>\n`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('Generated sitemap.xml with ' + (5 + packs.length + products.length + blogs.length) + ' canonical URLs!');

// 7. Generate robots.txt
const robotsTxt = `# ==============================================================================
# VALUE HUB STORE — Robots Exclusion Policy
# Canonical Host: https://value-hub.store
# ==============================================================================

User-agent: *
Allow: /
Allow: /packs/
Allow: /shop/
Allow: /guides/
Allow: /delivery/
Allow: /assets/

# Block faceted search explosion & query duplicates
Disallow: /*?*q=
Disallow: /*?*filter=
Disallow: /admin/
Disallow: /api/
Disallow: /extracted_v2/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt, 'utf8');
console.log('Generated robots.txt successfully!');

// 8. Generate manifest.json (PWA)
const manifestJson = {
  name: "VALUE HUB المغرب — متجر السوبرفود والعناية",
  short_name: "VALUE HUB",
  description: "متجر السوبرفود والمكملات الغذائية في المغرب مع باكات 189 درهم والدفع عند الاستلام.",
  start_url: "/",
  display: "standalone",
  background_color: "#F8FAF7",
  theme_color: "#0B7A53",
  dir: "rtl",
  lang: "ar-MA",
  icons: [
    {
      src: "/assets/img/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/assets/img/icon-512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ]
};
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifestJson, null, 2), 'utf8');
console.log('Generated manifest.json successfully!');


