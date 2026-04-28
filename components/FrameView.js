
export default function FrameView({frame}) {
 if(!frame) return null;
 const copy=t=>navigator.clipboard.writeText(t);
 return (
  <div style={{flex:1}}>
   <h2>{frame.id}</h2>
   <h3>IMAGE</h3><button onClick={()=>copy(frame.image)}>copy</button><pre>{frame.image}</pre>
   <h3>VIDEO</h3><button onClick={()=>copy(frame.video)}>copy</button><pre>{frame.video}</pre>
   <h3>VO</h3><button onClick={()=>copy(frame.vo)}>copy</button><pre>{frame.vo}</pre>
  </div>
 );
}
