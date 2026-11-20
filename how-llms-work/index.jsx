import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {PerspectiveCamera, Vector3} from 'three';
import storyboard from './storyboard.json';

const ink='#e9f5ff', muted='#8da7bd', cyan='#5bf5de', amber='#ffbb77', violet='#ac9aff', panel='#101d32';
const progress=(t,a,b)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ease=(t,a,b)=>{const p=progress(t,a,b);return p*p*(3-2*p);};
const mix=(a,b,f)=>a+(b-a)*f;
const label=(x,y,txt,size=30,color=ink,anchor='middle',weight=500)=><text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} fontWeight={weight}>{txt}</text>;

function Box({x,y,w=228,h=88,children,color=cyan,active=false}){
  return <g><rect x={x-w/2} y={y-h/2} width={w} height={h} rx="18" fill={active?'#17334a':panel} stroke={color} strokeOpacity={active?.95:.39} strokeWidth="2"/>{label(x,y+10,children,29,active?color:ink)}</g>;
}
function Wire({x1,y1,x2,y2,phase,color=cyan,strength=.45}){
  return <g><line {...{x1,y1,x2,y2}} stroke={color} strokeOpacity={strength} strokeWidth="2"/>{phase!=null&&<circle cx={mix(x1,x2,phase)} cy={mix(y1,y2,phase)} r="6" fill={color}/>}</g>;
}
function Bars({values,mode=false,y=470}){
  return values.map(([name,value],i)=><g key={name} transform={`translate(0 ${y+i*76})`}>
    {label(665,12,name,32,ink,'end')}
    <rect x="711" y="-16" width="555" height="32" rx="9" fill="#172740"/>
    <rect x="711" y="-16" width={555*value} height="32" rx="9" fill={i===(mode?3:0)?cyan:violet} opacity={i===(mode?3:0)?1:.68}/>
    {label(1300,10,Math.round(value*100)+'%',26,muted,'start')}
  </g>);
}
function Opening({t}){
  const shift=ease(t,11,15);
  return <>
    {label(960,326,'The cat sat on the …',96,ink,'middle',650)}
    <g opacity={ease(t,4,5)}>
      {label(960,405,shift>.5?'Context · aboard a rocket':'Context · everyday setting',26,cyan)}
      <Bars values={['mat','floor','chair','moon'].map((n,i)=>[n,mix([.58,.27,.14,.01][i],[.29,.24,.12,.35][i],shift)])}/>
      {label(960,789,'Illustrative probabilities for four possible continuations',24,muted)}
    </g>
  </>;
}
function Tokens({t}){
  const split=ease(t,31,34), lookup=ease(t,39,40), embed=ease(t,46,48);
  return <>
    {['The','␣cat','␣sat'].map((item,i)=>{
      const x=960+(i-1)*mix(123,280,split);
      return <g key={item}>
        <Box x={x} y={345} w={mix(122,225,split)} color={i===1?cyan:violet} active={i===1}>{split>.5?item:item.replace('␣','')}</Box>
        <g opacity={lookup}><Wire x1={x} y1={393} x2={x} y2={463} phase={lookup} color={i===1?cyan:violet}/><Box x={x} y={510} active={i===1} w={150}>{['17','52','91'][i]}</Box></g>
      </g>;
    })}
    <g opacity={split}>{label(960,245,'Tokens · ␣ marks a space',26,muted)}</g>
    <g opacity={lookup}>{label(960,594,'Example vocabulary IDs',25,muted)}</g>
    <g opacity={embed}>
      <Wire x1={960} y1={612} x2={960} y2={665} phase={embed}/>
      <Box x={960} y={724} w={620} active>[ 0.21, −0.48, 0.73, … ]</Box>
      {label(960,807,'One learned vector for token 52',25,cyan)}
    </g>
  </>;
}
function projection(angle,elevation,target,dist){
  const camera=new PerspectiveCamera(38,16/9,.1,100);
  camera.position.set(target[0]+Math.sin(angle)*dist,elevation,target[2]+Math.cos(angle)*dist);
  camera.lookAt(...target);
  camera.updateMatrixWorld();
  return (x,y,z)=>{
    const p=new Vector3(x,y,z).project(camera);
    return [960+p.x*960,550-p.y*540];
  };
}
function Space({t}){
  const p=projection(.36+(t-55)*.016,3.8,[0,.65,0],10.7);
  const entries=[
    ['Cat',-1.7,1.2,0, cyan,64],['Dog',-.74,1.84,.25,cyan,65],
    ['Animal',-2.18,2.36,-.54,violet,66],['Car',2.35,.95,.15,amber,73]
  ];
  return <>
    <g stroke="#315371" strokeWidth="1.5" opacity=".65">
      {Array.from({length:11},(_,i)=>i-5).map(i=>{const a=p(i,0,-4),b=p(i,0,4),c=p(-5,0,i*.8),d=p(5,0,i*.8);return <path key={i} d={`M${a} L${b} M${c} L${d}`}/>;})}
    </g>
    {entries.map(([name,x,y,z,color,start])=>{
      const [cx,cy]=p(x,y,z),[fx,fy]=p(x,0,z);
      return <g key={name} opacity={ease(t,start,start+1.1)}>
        <path d={`M${fx},${fy} L${cx},${cy}`} stroke={color} strokeDasharray="4 7" opacity=".55"/>
        <circle cx={cx} cy={cy} r="33" fill={color} opacity=".13"/>
        <circle cx={cx} cy={cy} r="14" fill={color} opacity=".26"/>
        <circle cx={cx} cy={cy} r="7" fill={color}/>{label(cx+19,cy+9,name,31,color,'start')}
      </g>;
    })}
    {[1,2].map(i=>{const [,x,y,z]=entries[i];const a=p(-1.7,1.2,0),b=p(x,y,z);return <path key={i} d={`M${a} L${b}`} stroke={cyan} strokeWidth="2" opacity={ease(t,67,69)*.5}/>;})}
    {label(960,875,'Illustrative 3D space · real embeddings use many more dimensions',25,muted)}
  </>;
}
const words=['The','animal','didn’t','cross','the','street','because','it','was','tired.'];
function Attention({t}){
  const x=i=>276+i*152;
  const links=ease(t,97,100), combine=ease(t,105,108);
  return <>
    {words.map((w,i)=><Box key={i} x={x(i)} y={343} w={139} h={70} active={i===7||i===1&&t>=97} color={i===7?cyan:violet}>{w}</Box>)}
    {[0,1,2,3,4,5,6].map(i=>{
      const height=92+(7-i)*28, path=`M${x(i)},384 C${x(i)},${height+405} ${x(7)},${height+405} ${x(7)},384`;
      return <path key={i} d={path} pathLength="1" strokeDasharray={`${links} 1`} fill="none" stroke={i===1?cyan:violet} strokeWidth={i===1?5:2} opacity={(i===1?.95:i===5?.47:.27)*links}/>;
    })}
    <g opacity={combine}><Wire x1={x(7)} y1={563} x2={x(7)} y2={644} phase={((t-105)%2+2)%2/2}/><Box x={x(7)} y={691} w={390} active>Updated representation</Box></g>
    {[[113,'Query','What should this position look for?'],[116,'Keys','How well does each earlier position match?'],[119,'Values','What information does each position contribute?']].map(([start,name,description])=><g key={name} opacity={ease(t,start,start+.6)*(1-ease(t,start+3,start+3.4))}>
      {label(297,681,name,43,cyan,'start',700)}{label(297,727,description,26,ink,'start')}
    </g>)}
    {t>=122&&label(960,827,'Example attention pattern · only earlier positions are shown',25,muted)}
  </>;
}
function Layers({t}){
  const p=projection(.54+(t-130)*.014,3.7,[0,.5,0],mix(12.5,9.5,ease(t,130,145)));
  const stage=((t-130)*.53)%6;
  return <>
    {Array.from({length:7},(_,i)=>{
      const z=(i-3)*1.03, corners=[[-2,0],[2,0],[2,2.1],[-2,2.1]].map(([x,y])=>p(x,y,z));
      const bright=Math.max(0,1-Math.abs(stage-i)*.75);
      return <g key={i}>
        <polygon points={corners.join(' ')} fill={cyan} fillOpacity={.035+bright*.12} stroke={cyan} strokeWidth={1+bright*2} strokeOpacity={.28+bright*.7}/>
        {Array.from({length:12},(_,j)=>{
          const [x,y]=p((j%4-1.5)*.87,.5+Math.floor(j/4)*.55,z);
          return <circle key={j} cx={x} cy={y} r={2.5+2.7*bright} fill={j%3===0?violet:cyan} opacity={.35+bright*.6}/>;
        })}
      </g>;
    })}
    {Array.from({length:4},(_,i)=>{
      const x=(i-1.5)*.87;const a=p(x,1.05,-3.09),b=p(x,1.05,3.09),c=p(x,1.05,(stage-3)*1.03);
      return <g key={i}><Wire x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} color={violet}/><circle cx={c[0]} cy={c[1]} r="7" fill={cyan}/></g>;
    })}
    {t>=139&&<g>
      <Box x={625} y={792} w={260} active={t<143}>Attention</Box>
      <Wire x1={755} y1={792} x2={785} y2={792} phase={(t%1)}/>
      <Box x={960} y={792} w={345} active={t>=143&&t<147}>Feed-forward network</Box>
      <Wire x1={1133} y1={792} x2={1162} y2={792} phase={t%1}/>
      <Box x={1305} y={792} w={282} active={t>=147&&t<155}>Normalization</Box>
      {t>=147&&<path d="M625,747 V715 H1305 V747" fill="none" stroke={violet} strokeWidth="2" strokeDasharray="7 7"/>}
      {t>=147&&t<155&&label(960,703,'Residual path',23,violet)}
      {t>=155&&label(960,875,'Vector components change across layers',25,muted)}
      {t>=155&&Array.from({length:21},(_,i)=><rect key={i} x={735+i*22} y={686-(13+12*Math.sin(i*1.9+t*1.9))} height={13+12*Math.sin(i*1.9+t*1.9)} width="11" rx="3" fill={i%3?cyan:violet}/>)}
    </g>}
  </>;
}
function Training({t}){
  const steps=['Training text','Predict','Compare target','Measure loss','Backpropagate','Adjust weights'];
  const samples=[['The cat sat on the','floor','mat'],['The kettle began to','cool','whistle'],['She turned the','corner','page']];
  const active=t<173?Math.min(2,Math.floor((t-165)/2.5)):t<181?3+Math.min(1,Math.floor((t-173)/3)):t<183?5:t<188?Math.floor((t-183)*2.4)%6:-1;
  const index=t<183?0:1+Math.floor((t-183)/2.5)%2;
  return <>
    {label(960,284,t<188?`“${samples[index][0]} …”`:'From pretraining to use',52,ink,'middle',650)}
    {t<188?<>
      {steps.map((s,i)=>{
        const x=284+i*270;
        return <g key={s}><Box x={x} y={500} w={238} active={active===i} color={i===4?violet:cyan}>{s}</Box>{i<5&&<Wire x1={x+119} y1={500} x2={x+151} y2={500} phase={active===i?t%1:null}/>}</g>;
      })}
      <path d="M1634,550 V690 Q1634,722 1600,722 H318 Q284,722 284,690 V550" stroke={cyan} strokeWidth="2" opacity={t>=181?.66:.19} fill="none"/>
      {t>=173&&t<181&&<path d="M1364,555 C1364,630 1094,630 1094,555" stroke={violet} strokeWidth="4" fill="none"/>}
      {t>=168&&label(960,399,`Example guess: ${samples[index][1]}     ·     Actual next token: ${samples[index][2]}`,30,muted)}
      {label(960,797,t<173?'The training text supplies the target':t<181?'Gradients describe how the loss changes with the weights':'Update weights and repeat with more training text',29,cyan)}
    </>:<>
      {['Pretraining','Instruction tuning','Preference training','Ordinary use'].map((s,i)=><g key={s} opacity={ease(t,[188,188.6,191,195][i],[188.6,189.3,191.7,195.7][i])}>
        <Box x={342+i*412} y={493} w={350} active={i===3?t>=195:i===2?t>=191:i===1?t>=188.6:false}>{s}</Box>
        {i<3&&<Wire x1={517+i*412} y1={493} x2={579+i*412} y2={493}/>}
        {label(342+i*412,588,['Learn text patterns','Train on examples','Favor preferred outputs','Keep weights fixed'][i],24,muted)}
      </g>)}
    </>}
  </>;
}
const stages=['Prompt','Token IDs','Embeddings','Transformer','Scores','Probabilities','Select token'];
function Pipeline({t,recap=false}){
  const pulse=recap?((t-230)*.65)%7:t<209?Math.min(3,(t-200)*.64):t<217?4+ease(t,209,212):t<224?6:((t-224)*2)%7;
  const generated=t>=224?(t>=228?' mat and purred.':t>=226?' mat and':' mat'):t>=220?' mat':'';
  return <>
    {label(960,294,recap?'Context becomes a prediction':'The cat sat on the'+(generated||' …'),recap?65:59,ink,'middle',640)}
    {stages.map((s,i)=>{
      const x=237+i*241;
      return <g key={s}><Box x={x} y={490} w={215} h={82} color={i===3?violet:cyan} active={Math.floor(pulse)===i}>{s}</Box>{i<6&&<Wire x1={x+108} y1={490} x2={x+134} y2={490} phase={Math.floor(pulse)===i?pulse%1:null}/>}</g>;
    })}
    <g opacity={recap?1:ease(t,224,225)}>
      <path d="M1683 540 V591 Q1683 625 1649 625 H271 Q237 625 237 591 V540" fill="none" stroke={cyan} strokeOpacity=".57" strokeWidth="2"/>
      {label(960,672,'Append the selected token and repeat',26,cyan)}
    </g>
    {!recap&&t>=209&&t<224&&<g opacity={ease(t,209,210)}>
      {label(960,590,t<212?'Example scores':t<217?'Softmax converts scores to probabilities':'Example sampling distribution',27,muted)}
      {['mat','floor','chair'].map((s,i)=>{
        const values=t<212?['2.6','1.5','0.8']:t<219?['67%','22%','11%']:['54%','28%','18%'];
        return <g key={s}><Box x={664+i*296} y={681} active={t>=220&&i===0}>{s+'   '+values[i]}</Box></g>;
      })}
    </g>}
    {recap&&<g opacity={ease(t,237,238)}>
      <Wire x1={960} y1={751} x2={960} y2={691} phase={t%1} color={violet}/>
      {label(960,798,'Training learns the weights used by the Transformer',29,violet)}
    </g>}
    {recap&&t>=245&&label(960,880,'Likely text can still be wrong.',34,amber,'middle',650)}
  </>;
}
const artwork=[Opening,Tokens,Space,Attention,Layers,Training,Pipeline,props=><Pipeline {...props} recap/>];

function Film(){
  const frame=useCurrentFrame(),t=frame/24;
  const index=storyboard.findLastIndex(s=>s.at<=t),scene=storyboard[index],next=storyboard[index+1]?.at??250;
  const Art=artwork[index];
  const motion=ease(t,scene.at,scene.at+.48);
  const opacity=index===0?1:motion;
  const exit=ease(t,next-.42,next);
  return <AbsoluteFill style={{background:'#07101f',fontFamily:'DejaVu Sans, Arial, sans-serif'}}>
    <Audio src={staticFile('narration.wav')} volume={.9}/>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" role="img" aria-label={scene.title}>
      <defs><radialGradient id="background" cx="51%" cy="48%" r="64%"><stop stopColor="#152c48"/><stop offset="1" stopColor="#060b16"/></radialGradient></defs>
      <rect width="1920" height="1080" fill="url(#background)"/>
      <path d="M105 164 H1815 M105 973 H1815" stroke="#2d445d" strokeWidth="1"/>
      {label(107,92,'HOW LARGE LANGUAGE MODELS ACTUALLY WORK',21,muted,'start',650)}
      {label(107,137,scene.title,35,ink,'start',650)}
      <g opacity={opacity*(index===7?1:1-exit)} transform={`translate(0 ${(1-opacity)*18-exit*9})`}><Art t={t}/></g>
      {storyboard.map(({at,title},i)=><rect key={title} x={106+i*215} y="995" width="197" height="4" rx="2" fill={t>=at?(i===index?cyan:'#477886'):'#263b52'}/>)}
    </svg>
  </AbsoluteFill>;
}
registerRoot(()=> <Composition id="LLM" component={Film} width={1920} height={1080} fps={24} durationInFrames={6000}/>);
