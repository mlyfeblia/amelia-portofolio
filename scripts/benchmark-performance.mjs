const BASE = 'http://127.0.0.1:3009';

const routes = [
  { name: 'Homepage (/)', path: '/' },
  { name: 'Articles Hub (/articles)', path: '/articles' },
  { name: 'Article Detail (SSG)', path: '/articles/rest-and-mindfulness-in-islamic-tradition' },
  { name: 'Counseling Overview (/counseling)', path: '/counseling' },
  { name: 'Booking Schedule (/schedule)', path: '/schedule' },
  { name: 'Self-Assessment (/assessment)', path: '/assessment' },
  { name: 'Services Directory (/services)', path: '/services' },
  { name: 'About Profile (/about)', path: '/about' },
  { name: 'API Articles (GET /api/articles)', path: '/api/articles' },
  { name: 'API Curhat (GET /api/curhat)', path: '/api/curhat' },
];

async function measureRoute(path, runs = 5) {
  const times = [];
  let status = 0;
  let size = 0;

  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const res = await fetch(`${BASE}${path}`);
    const text = await res.text();
    const elapsed = performance.now() - start;
    times.push(elapsed);
    status = res.status;
    size = text.length;
  }

  // discard first run (warmup) for calculating stable averages
  const stableTimes = times.slice(1);
  const avg = stableTimes.reduce((a, b) => a + b, 0) / stableTimes.length;
  const min = Math.min(...stableTimes);
  const max = Math.max(...stableTimes);

  return {
    status,
    sizeKb: (size / 1024).toFixed(2),
    warmupMs: times[0].toFixed(2),
    avgMs: avg.toFixed(2),
    minMs: min.toFixed(2),
    maxMs: max.toFixed(2),
  };
}

async function run() {
  console.log('=== BENCHMARKING PRODUCTION SERVER LATENCY & TTFB (PORT 3009) ===\n');
  const results = [];

  for (const r of routes) {
    const data = await measureRoute(r.path, 5);
    results.push({
      Route: r.name,
      Status: data.status,
      'Size (KB)': `${data.sizeKb} KB`,
      'Avg Latency': `${data.avgMs} ms`,
      'Min Latency': `${data.minMs} ms`,
      'Max Latency': `${data.maxMs} ms`,
    });
  }

  console.table(results);
}

run().catch(console.error);
