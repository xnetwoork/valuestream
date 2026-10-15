const fs = require('fs');

const files = [
  'index.html',
  'packs/index.html',
  'shop/index.html',
  'guides/index.html',
  'delivery/index.html',
  'packs.html',
  'shop.html',
  'guides.html',
  'delivery.html'
];

let errors = 0;

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.error('File missing:', f);
    errors++;
    return;
  }
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('lang="ar-MA"') || !content.includes('dir="rtl"')) {
    console.error('Error in ' + f + ': Missing ar-MA or dir=rtl');
    errors++;
  }
  if (!content.includes('https://value-hub.store')) {
    console.error('Error in ' + f + ': Missing canonical domain');
    errors++;
  }
  if (!content.includes('<meta name="robots"')) {
    console.error('Error in ' + f + ': Missing robots meta');
    errors++;
  }
  // Check JSON-LD
  const matches = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  matches.forEach((m, idx) => {
    const jsonStr = m.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '').trim();
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed['@context'] && !parsed['@graph']) {
        console.error('Warning in ' + f + ' JSON-LD block ' + idx + ': missing context/graph');
      }
    } catch (e) {
      console.error('JSON-LD parse error in ' + f + ' block ' + idx + ':', e.message);
      errors++;
    }
  });
});

// Check sitemap.xml
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
if (!sitemap.includes('<urlset') || !sitemap.includes('https://value-hub.store')) {
  console.error('Error in sitemap.xml');
  errors++;
}
const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
console.log('Sitemap total URLs:', urlMatches.length);

// Check robots.txt
const robots = fs.readFileSync('robots.txt', 'utf8');
if (!robots.includes('Sitemap: https://value-hub.store/sitemap.xml')) {
  console.error('Error in robots.txt: Missing sitemap reference');
  errors++;
}

// Check store data
const storeData = fs.readFileSync('assets/js/store-data.js', 'utf8');
if (!storeData.includes('https://value-hub.store') || !storeData.includes('packs') || !storeData.includes('products')) {
  console.error('Error in assets/js/store-data.js');
  errors++;
}

// Check guides data
const guidesData = fs.readFileSync('assets/js/guides-data.js', 'utf8');
if (!guidesData.includes('VALUE_HUB_GUIDES')) {
  console.error('Error in assets/js/guides-data.js');
  errors++;
}

if (errors === 0) {
  console.log('✓ AUDIT SUCCESS: All 9 HTML files, JSON-LD schemas, sitemap.xml, robots.txt, store-data.js, and guides-data.js passed 100% verification!');
} else {
  console.error('FAILED with ' + errors + ' errors.');
  process.exit(1);
}
