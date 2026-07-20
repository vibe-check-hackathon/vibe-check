const crypto = require('crypto');
const { performance } = require('perf_hooks');

function median(xs){ const a=[...xs].sort((x,y)=>x-y); return a[Math.floor(a.length/2)]; }
function bench(fn, rounds=5){ const out=[]; for(let i=0;i<rounds;i++){ const t0=performance.now(); fn(); out.push(performance.now()-t0); } return median(out); }

const records = Array.from({length: 20000}, (_, i) => ({
  id: i,
  url: `https://example.com/docs/${i % 1000}?q=${i}`,
  title: `Document ${i}`,
  score: (i % 101) / 100,
  tags: ['agent','crawler',`group-${i%17}`],
  active: (i % 3) !== 0
}));
const jsonText = JSON.stringify(records);
const buf = Buffer.alloc(16 * 1024 * 1024, 97);
const text = ('https://example.com/path?q=agentic AI systems and secure crawling. '.repeat(25000));
const regex = /https:\/\/[^\s]+|agentic|crawler|secure/gi;

const results = {};
results.json_ms = bench(() => { const x=JSON.parse(jsonText); const y=JSON.stringify(x); if(y.length !== jsonText.length) throw new Error('bad json'); }, 5);
results.sha256_ms = bench(() => { for(let i=0;i<4;i++) crypto.createHash('sha256').update(buf).digest(); }, 5);
results.text_scan_ms = bench(() => { for(let i=0;i<3;i++){ regex.lastIndex=0; let c=0; while(regex.exec(text)) c++; if(c===0) throw new Error('bad scan'); }}, 5);

async function asyncBench(){
  const rounds=[];
  for(let r=0;r<5;r++){
    const t0=performance.now();
    await Promise.all(Array.from({length: 2000}, () => new Promise(res => setTimeout(res, 2))));
    rounds.push(performance.now()-t0);
  }
  results.async_2000x2ms_ms = median(rounds);
  console.log(JSON.stringify({language:'node', version:process.version, payload_mb:(jsonText.length/1048576), ...results}));
}
asyncBench();
