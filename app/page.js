
"use client";
import { useState } from "react";

export default function Page() {
  const [step, setStep] = useState("script");

  return (
    <div style={{background:"#0f0f14",color:"#fff",minHeight:"100vh",padding:"20px"}}>
      <h1 style={{fontSize:"22px",marginBottom:"20px"}}>🎬 NeuroCine Studio</h1>

      {step==="script" && (
        <div>
          <h2>1. Сценарий</h2>
          <textarea style={{width:"100%",height:"120px",background:"#111",color:"#fff"}} />
          <button onClick={()=>setStep("frames")} style={{marginTop:"10px"}}>Дальше</button>
        </div>
      )}

      {step==="frames" && (
        <div>
          <h2>2. Кадры</h2>
          <div style={{display:"flex",gap:"10px"}}>
            {[1,2,3].map(i=>(
              <div key={i} onClick={()=>setStep("frame")} style={{padding:"20px",background:"#222",cursor:"pointer"}}>
                Кадр {i}
              </div>
            ))}
          </div>
        </div>
      )}

      {step==="frame" && (
        <div>
          <h2>Frame Studio</h2>
          <button onClick={()=>setStep("explore")}>Explore</button>
        </div>
      )}

      {step==="explore" && (
        <div>
          <h2>Варианты</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            {["A","B","C","D"].map(v=>(
              <div key={v} style={{background:"#222",padding:"30px"}}>{v}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
