package main

import (
  "crypto/sha256"
  "encoding/json"
  "fmt"
  "regexp"
  "runtime"
  "sort"
  "strings"
  "sync"
  "time"
)

type Record struct { Id int `json:"id"`; URL string `json:"url"`; Title string `json:"title"`; Score float64 `json:"score"`; Tags []string `json:"tags"`; Active bool `json:"active"` }
func median(xs []float64) float64 { ys:=append([]float64{},xs...); sort.Float64s(ys); return ys[len(ys)/2] }
func bench(fn func(), rounds int) float64 { xs:=make([]float64,0,rounds); for i:=0;i<rounds;i++{ t:=time.Now(); fn(); xs=append(xs,float64(time.Since(t).Microseconds())/1000) }; return median(xs) }
func main(){
  records:=make([]Record,20000)
  for i:=range records { records[i]=Record{i,fmt.Sprintf("https://example.com/docs/%d?q=%d",i%1000,i),fmt.Sprintf("Document %d",i),float64(i%101)/100,[]string{"agent","crawler",fmt.Sprintf("group-%d",i%17)},i%3!=0} }
  jsonBytes,_:=json.Marshal(records)
  buf:=make([]byte,16*1024*1024); for i:=range buf { buf[i]='a' }
  text:=strings.Repeat("https://example.com/path?q=agentic AI systems and secure crawling. ",25000)
  regex:=regexp.MustCompile(`(?i)https://[^\s]+|agentic|crawler|secure`)
  results:=map[string]float64{}
  results["json_ms"]=bench(func(){ var x []Record; if err:=json.Unmarshal(jsonBytes,&x); err!=nil{panic(err)}; y,err:=json.Marshal(x); if err!=nil||len(y)!=len(jsonBytes){panic("bad json")} },5)
  results["sha256_ms"]=bench(func(){ for i:=0;i<4;i++{ _=sha256.Sum256(buf) } },5)
  results["text_scan_ms"]=bench(func(){ for i:=0;i<3;i++{ c:=len(regex.FindAllStringIndex(text,-1)); if c==0{panic("bad scan")} } },5)
  rounds:=make([]float64,0,5)
  for r:=0;r<5;r++{ t:=time.Now(); var wg sync.WaitGroup; wg.Add(2000); for i:=0;i<2000;i++{ go func(){ defer wg.Done(); time.Sleep(2*time.Millisecond) }() }; wg.Wait(); rounds=append(rounds,float64(time.Since(t).Microseconds())/1000) }
  results["async_2000x2ms_ms"]=median(rounds)
  fmt.Printf(`{"language":"go","version":"%s","payload_mb":%.3f,"json_ms":%.3f,"sha256_ms":%.3f,"text_scan_ms":%.3f,"async_2000x2ms_ms":%.3f}`+"\n",runtime.Version(),float64(len(jsonBytes))/1048576,results["json_ms"],results["sha256_ms"],results["text_scan_ms"],results["async_2000x2ms_ms"])
}
