const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');

const router = express.Router();

router.use(requireAdmin);

// ─── Data helpers ──────────────────────────────────────────────────────────────

async function getStats() {
  const [
    { count: totalUsers },
    { data: curlTypes },
    { data: porosityData },
    { data: cities },
    { data: products },
    { data: auntyMessages },
    { data: checkinsByWeek },
    { data: moistureByWeek },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('hair_profiles').select('curl_type').is('deleted_at', null),
    supabaseAdmin.from('hair_profiles').select('porosity').is('deleted_at', null),
    supabaseAdmin.from('users').select('city').is('deleted_at', null),
    supabaseAdmin.from('product_interactions').select('product_name, brand, shown, clicked, purchased, aunty_recommended_by').is('deleted_at', null),
    supabaseAdmin.from('council_messages').select('aunty_id, created_at').is('deleted_at', null),
    supabaseAdmin.from('checkins').select('checkin_week, completed_at').is('deleted_at', null),
    supabaseAdmin.from('checkins').select('checkin_week, moisture_rating, condition_rating').is('deleted_at', null),
  ]);

  // Curl type breakdown
  const curlBreakdown = {};
  (curlTypes || []).forEach(({ curl_type }) => {
    if (curl_type) curlBreakdown[curl_type] = (curlBreakdown[curl_type] || 0) + 1;
  });

  // Porosity breakdown
  const porosityBreakdown = {};
  (porosityData || []).forEach(({ porosity }) => {
    if (porosity) porosityBreakdown[porosity] = (porosityBreakdown[porosity] || 0) + 1;
  });

  // City distribution
  const cityCount = {};
  (cities || []).forEach(({ city }) => {
    if (city) cityCount[city] = (cityCount[city] || 0) + 1;
  });
  const topCities = Object.entries(cityCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([city, count]) => ({ city, count }));

  // Product performance
  const productMap = {};
  (products || []).forEach((p) => {
    const key = p.product_name;
    if (!productMap[key]) {
      productMap[key] = { product_name: p.product_name, brand: p.brand, shown: 0, clicked: 0, purchased: 0, aunty: p.aunty_recommended_by };
    }
    if (p.shown) productMap[key].shown++;
    if (p.clicked) productMap[key].clicked++;
    if (p.purchased) productMap[key].purchased++;
  });
  const productPerformance = Object.values(productMap)
    .map((p) => ({ ...p, click_rate: p.shown ? ((p.clicked / p.shown) * 100).toFixed(1) + '%' : '0%' }))
    .sort((a, b) => b.clicked - a.clicked);

  // Aunty engagement
  const auntyCount = {};
  (auntyMessages || []).forEach(({ aunty_id }) => {
    auntyCount[aunty_id] = (auntyCount[aunty_id] || 0) + 1;
  });

  // Retention by week
  const weekCompletion = { 1: 0, 2: 0, 3: 0, 4: 0 };
  (checkinsByWeek || []).forEach(({ checkin_week }) => {
    if (checkin_week) weekCompletion[checkin_week] = (weekCompletion[checkin_week] || 0) + 1;
  });

  // Average moisture and condition by week
  const moistureAgg = { 1: [], 2: [], 3: [], 4: [] };
  const conditionAgg = { 1: [], 2: [], 3: [], 4: [] };
  (moistureByWeek || []).forEach(({ checkin_week, moisture_rating, condition_rating }) => {
    if (checkin_week && moisture_rating) moistureAgg[checkin_week].push(moisture_rating);
    if (checkin_week && condition_rating) conditionAgg[checkin_week].push(condition_rating);
  });
  const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;
  const outcomeData = [1, 2, 3, 4].map((w) => ({
    week: w,
    avg_moisture: avg(moistureAgg[w]),
    avg_condition: avg(conditionAgg[w]),
    checkin_count: weekCompletion[w],
  }));

  const activeThisWeek = (checkinsByWeek || []).filter((c) => {
    const d = new Date(c.completed_at);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    totalUsers,
    activeThisWeek,
    curlBreakdown,
    porosityBreakdown,
    topCities,
    productPerformance,
    auntyCount,
    weekCompletion,
    outcomeData,
  };
}

// ─── Dashboard HTML ────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const stats = await getStats();

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aunty — Admin Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FBF6F0; color: #2C1810; }
    header { background: #2C1810; padding: 20px 32px; display: flex; align-items: center; gap: 16px; }
    header h1 { font-size: 24px; color: #F0D5A8; font-style: italic; }
    header span { font-size: 12px; color: #9B6840; }
    main { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #EDD9C0; }
    .card h3 { font-size: 11px; color: #9B6840; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
    .card .value { font-size: 36px; font-weight: 700; color: #C97B3A; }
    .card .sub { font-size: 11px; color: #9B6840; margin-top: 4px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .panel { background: white; border-radius: 16px; padding: 24px; border: 1px solid #EDD9C0; }
    .panel h2 { font-size: 14px; font-weight: 600; color: #2C1810; margin-bottom: 20px; }
    canvas { max-height: 260px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; color: #9B6840; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #EDD9C0; }
    td { padding: 10px 12px; border-bottom: 1px solid #F5EDE2; }
    tr:last-child td { border-bottom: none; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; background: #FFF3E8; color: #C97B3A; }
    @media (max-width: 900px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Aunty — The Curl Council</h1>
      <span>Admin Dashboard · Data Asset Report</span>
    </div>
  </header>

  <main>
    <div class="cards">
      <div class="card">
        <h3>Total Users</h3>
        <div class="value">${stats.totalUsers || 0}</div>
        <div class="sub">All time</div>
      </div>
      <div class="card">
        <h3>Active This Week</h3>
        <div class="value">${stats.activeThisWeek}</div>
        <div class="sub">Check-ins in last 7 days</div>
      </div>
      <div class="card">
        <h3>Week 4 Completion</h3>
        <div class="value">${stats.weekCompletion[4]}</div>
        <div class="sub">Full journey completions</div>
      </div>
      <div class="card">
        <h3>Avg Moisture W4</h3>
        <div class="value">${stats.outcomeData[3]?.avg_moisture || '—'}</div>
        <div class="sub">/ 5 — week 4 average</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <h2>Curl Type Distribution</h2>
        <canvas id="curlChart"></canvas>
      </div>
      <div class="panel">
        <h2>Porosity Breakdown</h2>
        <canvas id="porosityChart"></canvas>
      </div>
    </div>

    <div class="panel" style="margin-bottom: 32px;">
      <h2>Outcome Data — Moisture &amp; Condition by Week (Efficacy)</h2>
      <canvas id="outcomeChart"></canvas>
    </div>

    <div class="grid-2" style="margin-bottom: 32px;">
      <div class="panel">
        <h2>Check-In Retention by Week</h2>
        <canvas id="retentionChart"></canvas>
      </div>
      <div class="panel">
        <h2>Aunty Engagement</h2>
        <canvas id="auntyChart"></canvas>
      </div>
    </div>

    <div class="panel" style="margin-bottom: 32px;">
      <h2>Product Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th><th>Brand</th><th>Aunty</th>
            <th>Shown</th><th>Clicks</th><th>Click Rate</th><th>Purchases</th>
          </tr>
        </thead>
        <tbody>
          ${stats.productPerformance.map((p) => `
            <tr>
              <td>${p.product_name}</td>
              <td>${p.brand || '—'}</td>
              <td><span class="pill">${p.aunty || '—'}</span></td>
              <td>${p.shown}</td>
              <td>${p.clicked}</td>
              <td>${p.click_rate}</td>
              <td>${p.purchased}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="panel">
      <h2>Geographic Distribution — Top Cities</h2>
      <table>
        <thead><tr><th>City</th><th>Users</th></tr></thead>
        <tbody>
          ${stats.topCities.map((c) => `<tr><td>${c.city}</td><td>${c.count}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </main>

  <script>
    const amber = '#C97B3A';
    const amberLight = '#F0D5A8';
    const green = '#2D7D4A';
    const blue = '#4040C0';
    const purple = '#6030A0';
    const rose = '#C03060';
    const brown = '#2C1810';

    const curlData = ${JSON.stringify(stats.curlBreakdown)};
    new Chart(document.getElementById('curlChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(curlData),
        datasets: [{ data: Object.values(curlData), backgroundColor: amber, borderRadius: 6 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const porosityData = ${JSON.stringify(stats.porosityBreakdown)};
    new Chart(document.getElementById('porosityChart'), {
      type: 'pie',
      data: {
        labels: Object.keys(porosityData),
        datasets: [{ data: Object.values(porosityData), backgroundColor: [amber, green, blue] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });

    const outcomeData = ${JSON.stringify(stats.outcomeData)};
    new Chart(document.getElementById('outcomeChart'), {
      type: 'line',
      data: {
        labels: outcomeData.map(d => 'Week ' + d.week),
        datasets: [
          { label: 'Avg Moisture', data: outcomeData.map(d => d.avg_moisture), borderColor: amber, backgroundColor: 'transparent', tension: 0.4, pointBackgroundColor: amber },
          { label: 'Avg Condition', data: outcomeData.map(d => d.avg_condition), borderColor: green, backgroundColor: 'transparent', tension: 0.4, pointBackgroundColor: green }
        ]
      },
      options: { scales: { y: { min: 1, max: 5 } } }
    });

    const retentionData = ${JSON.stringify(stats.weekCompletion)};
    new Chart(document.getElementById('retentionChart'), {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{ data: [retentionData[1], retentionData[2], retentionData[3], retentionData[4]], backgroundColor: [amber, amberLight, '#D4A017', '#9A5820'], borderRadius: 6 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const auntyData = ${JSON.stringify(stats.auntyCount)};
    const auntyColors = { ngozi: amber, marcia: green, denise: blue, fatou: purple, carmen: rose, amara: '#B85C00', salma: '#1A6080' };
    new Chart(document.getElementById('auntyChart'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(auntyData),
        datasets: [{ data: Object.values(auntyData), backgroundColor: Object.keys(auntyData).map(k => auntyColors[k] || amber) }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  </script>
</body>
</html>`);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).send(`<h1>Dashboard error: ${err.message}</h1>`);
  }
});

// JSON endpoint for programmatic access
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
