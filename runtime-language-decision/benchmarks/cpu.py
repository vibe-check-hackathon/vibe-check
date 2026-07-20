import time,json,statistics
xs=[];z=0
for _ in range(5):
 s=0;t=time.perf_counter()
 for i in range(10_000_000): s=(s+((i*31)%97)) & 0xffffffff
 xs.append((time.perf_counter()-t)*1000);z^=s
print(json.dumps({'language':'python','cpu_loop_ms':statistics.median(xs),'guard':z}))
