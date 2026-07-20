import asyncio, hashlib, json, re, statistics, time, sys

def bench(fn, rounds=5):
    xs=[]
    for _ in range(rounds):
        t=time.perf_counter(); fn(); xs.append((time.perf_counter()-t)*1000)
    return statistics.median(xs)

records=[{
    'id':i,
    'url':f'https://example.com/docs/{i%1000}?q={i}',
    'title':f'Document {i}',
    'score':(i%101)/100,
    'tags':['agent','crawler',f'group-{i%17}'],
    'active':(i%3)!=0,
} for i in range(20000)]
json_text=json.dumps(records,separators=(',',':'))
buf=b'a'*(16*1024*1024)
text='https://example.com/path?q=agentic AI systems and secure crawling. '*25000
regex=re.compile(r'https://[^\s]+|agentic|crawler|secure',re.I)

results={}
def json_work():
    x=json.loads(json_text); y=json.dumps(x,separators=(',',':'))
    if len(y)!=len(json_text): raise RuntimeError('bad json')
results['json_ms']=bench(json_work)

def hash_work():
    for _ in range(4): hashlib.sha256(buf).digest()
results['sha256_ms']=bench(hash_work)

def scan_work():
    for _ in range(3):
        c=sum(1 for _ in regex.finditer(text))
        if c==0: raise RuntimeError('bad scan')
results['text_scan_ms']=bench(scan_work)

async def main():
    rounds=[]
    for _ in range(5):
        t=time.perf_counter()
        await asyncio.gather(*(asyncio.sleep(0.002) for _ in range(2000)))
        rounds.append((time.perf_counter()-t)*1000)
    results['async_2000x2ms_ms']=statistics.median(rounds)
    print(json.dumps({'language':'python','version':sys.version.split()[0], 'payload_mb':len(json_text)/1048576, **results}))
asyncio.run(main())
