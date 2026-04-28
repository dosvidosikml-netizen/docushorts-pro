
"use client";
import {useState} from "react";
import {generateScenes} from "../engine/sceneEngine";
import FrameView from "../components/FrameView";

export default function Page(){
 const [script,setScript]=useState("");
 const [scenes,setScenes]=useState([]);
 const [active,setActive]=useState(0);

 const make=()=>setScenes(generateScenes(script));

 return (
  <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:20}}>
   <h1>NeuroCine Studio</h1>

   <textarea value={script} onChange={e=>setScript(e.target.value)}
    style={{width:"100%",height:200}}/>

   <br/><br/>
   <button onClick={make}>СДЕЛАТЬ ВИДЕО</button>

   <div style={{display:"flex",gap:20,marginTop:20}}>
    <div style={{width:200}}>
     {scenes.map((s,i)=>(
      <div key={s.id} onClick={()=>setActive(i)}
       style={{padding:10,background:i===active?"red":"#111",marginBottom:10,cursor:"pointer"}}>
       {s.id}
      </div>
     ))}
    </div>

    <FrameView frame={scenes[active]}/>
   </div>
  </div>
 );
}
