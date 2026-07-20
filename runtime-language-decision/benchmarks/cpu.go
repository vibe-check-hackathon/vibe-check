package main
import("encoding/json";"fmt";"sort";"time")
func main(){xs:=make([]float64,5);z:=0;for r:=0;r<5;r++{s:=0;t:=time.Now();for i:=0;i<10000000;i++{s=(s+((i*31)%97))&0xffffffff};xs[r]=float64(time.Since(t).Microseconds())/1000;z^=s};sort.Float64s(xs);b,_:=json.Marshal(map[string]any{"language":"go","cpu_loop_ms":xs[2],"guard":z});fmt.Println(string(b))}
