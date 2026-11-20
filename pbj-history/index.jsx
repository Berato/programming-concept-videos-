import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, interpolate, registerRoot, spring, staticFile, useCurrentFrame} from 'remotion';
import './style.css';

const fps=24;
const shots=[
  {at:0,art:0,kind:'hero',tag:'THE UNLIKELY HISTORY OF',title:'PB&J',note:'Once a luxury'},
  {at:4.05,art:1,kind:'right',tag:'AT THE TEA TABLE',title:'RICH\nPEOPLE.'},
  {at:7.05,art:2,kind:'left',tag:'AT THE LUNCH TABLE',title:'THAT\nSANDWICH.'},
  {at:10,art:3,kind:'right',tag:'LATE 1800s',title:'HEALTH\nFOOD?!',calendar:true},
  {at:17.5,art:4,kind:'left',tag:'THE FANCY VERSION',title:'TEA\nSANDWICHES',chips:['Watercress','Cheese','Pimentos']},
  {at:24.8,art:4,kind:'freeze',tag:'PEANUT BUTTER + VEGETABLES',title:'WHY?'},
  {at:28,art:5,kind:'right',tag:'BOSTON',title:'1901',note:'Julia Davis Chandler'},
  {at:31.15,art:6,kind:'left',tag:'THE RECIPE',title:'PEANUT PASTE\n+ JELLY',note:'A Boston Cooking-School Magazine recipe'},
  {at:36.5,art:6,kind:'right',tag:'THE ORIGINAL FLAVORS',title:'CURRANT\nOR CRABAPPLE'},
  {at:42,art:0,kind:'freeze',tag:'THE MODERN SANDWICH',title:'…WAIT, WHAT?'},
  {at:45,art:7,kind:'right',tag:'THE 1920s',title:'CREAMIER.\nCHEAPER.',note:'And it kept longer.'},
  {at:51,art:7,kind:'left',tag:'1928',title:'PRE-SLICED\nBREAD',note:'Commercially sold by the loaf'},
  {at:55.7,art:8,kind:'assembly',tag:'BREAD + PEANUT BUTTER + JELLY',title:'THREE INGREDIENTS.'},
  {at:63,art:9,kind:'left',tag:'WORLD WAR II',title:'AMERICAN\nRATIONS',mono:true},
  {at:68.65,art:9,kind:'right',tag:'READY TO PACK',title:'CHEAP.\nPORTABLE.',note:'Packed with energy.',mono:true},
  {at:73.2,art:10,kind:'left',tag:'AFTER THE WAR',title:'LUNCHBOX\nSTAPLE'},
  {at:77,art:1,kind:'montage',tag:'FROM TEA PARTIES',title:'From tea parties'},
  {at:82.7,art:11,kind:'hero',tag:'THE FINISHING TOUCH',title:'FRUIT GOO.'},
  {at:87.5,art:0,kind:'end',tag:'THE ACCIDENTAL AMERICAN ICON',title:'PB&J'},
];
const ease=(t,a,b)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const file=i=>staticFile(`art/${String(i).padStart(2,'0')}.webp`);
const propFile=name=>staticFile(`art/${name}.webp`);
const crops={0:'50% 48%',2:'51% 55%',4:'54% 64%',6:'62% 64%',9:'49% 49%',10:'52% 53%'};

function Art({index,local=0,style={}}){
  return <Img className="art" src={file(index)} style={{objectPosition:crops[index]??'center',transform:`scale(${1.025+Math.min(local,10)*.009})`,...style}}/>;
}
function Prop({name,style={}}){
  return <Img className="prop" src={propFile(name)} style={style}/>;
}
function Rays({local,color='#e7a93a'}){
  return <div className="rays" style={{background:`repeating-conic-gradient(from ${local*2}deg, ${color} 0deg 5deg, transparent 5deg 16deg)`}}/>;
}
function Sandwich({local}){
  const colors=['#e4b567','#c88643','#8b1640','#e4b567'];
  return <div className="sandwich" aria-label="Bread, peanut butter, and jelly assemble into a sandwich">
    {colors.map((color,index)=>{
      const p=spring({frame:Math.max(0,local*24-index*10),fps,config:{damping:13,stiffness:125}});
      return <div key={index} className="food-layer" style={{background:color,top:340-index*62-130*(1-p),opacity:Math.min(1,p*4),height:index===0||index===3?110:64,transform:`rotate(-9deg) scale(${.86+p*.14})`}}/>;
    })}
  </div>;
}
function IngredientCutouts({local,collide=false}){
  const items=collide?['peanut','jelly']:['bread','peanut','jelly'];
  return <div className={collide?'cutouts collide':'cutouts'}>{items.map((item,i)=>{
    const delay=collide?0:i*.38;
    const slide=ease(local,delay,delay+.65);
    const leave=collide?ease(local,2.28,2.9):ease(local,2.15,2.65);
    const x=collide?(i===0?-1:1)*(480-350*slide):i*176-175;
    const y=collide?30:205-280*slide;
    return <Img key={item} src={staticFile(`art/${item}.webp`)} style={{opacity:slide*(1-leave),transform:`translate(${x}px,${y}px) rotate(${(i-1)*15}deg)`}}/>;
  })}</div>;
}
function Montage({local}){
  const items=[[1,'TEA PARTIES'],[5,'1901 RECIPE'],[7,'SLICED BREAD'],[9,'WARTIME RATIONS'],[10,'SCHOOL LUNCH']];
  const index=Math.min(items.length-1,Math.floor(local/1.13)), [art,title]=items[index];
  return <div className="montage">
    <Rays local={local}/>
    <div className="montage-rail">{items.map(([item,name],i)=><div className={i===index?'tile on':'tile'} key={item}><Art index={item}/><span>{name}</span></div>)}</div>
    <div className="montage-focus torn" key={art} style={{transform:`rotate(${index%2?2:-2}deg) scale(${1+local%1.13*.035})`}}><Art index={art}/></div>
    <div className="montage-title">{title}</div>
  </div>;
}
function Shot({shot,local,global}){
  const pop=spring({frame:local*fps,fps,config:{damping:17,stiffness:145}});
  const isHero=['hero','end','freeze'].includes(shot.kind);
  if(shot.kind==='montage') return <Montage local={local}/>;
  if(shot.kind==='assembly')return <>
    <Rays local={local}/>
    <div className="assembly-title">{shot.title}<small>{shot.tag}</small></div>
    <div className="assembly-card torn"><Art index={shot.art} local={local} style={{opacity:.36}}/><IngredientCutouts local={local}/><div style={{opacity:ease(local,1.7,2.25)}}><Sandwich local={Math.max(0,local-1.7)}/></div></div>
  </>;
  if(isHero){
    const opening=shot.at===0, ending=shot.kind==='end', fruit=shot.art===11;
    const angle=(opening?-6:ending?-3:4)+Math.sin(local*.6)*3;
    return <>
      <Rays local={local} color={shot.kind==='freeze'?'#d99499':'#e1a23a'}/>
      {shot.kind==='freeze'?<div className="hero-art freeze torn" style={{transform:`rotate(${angle}deg)`}}>
        <Art index={shot.art} local={local}/>
      </div>:<div className={`artifact-stage ${opening?'museum':''}`}>
        <div className="artifact-plate"/>
        <Prop name="hero-sandwich" style={{transform:`translateY(${(ending?-127:55)*(1-pop)}px) perspective(1100px) rotateY(${Math.sin(local*.66)*12}deg) rotate(${angle}deg) scale(${.85+pop*.15})`}}/>
        {fruit&&<Prop name="jelly-spoon" style={{top:-121,left:391,width:630,height:572,transform:`translate(${130-100*ease(local,.1,2.6)}px,${-201+218*ease(local,.1,2.6)}px) rotate(${-29+32*ease(local,1,2.8)}deg)`}}/>}
      </div>}
      <div className={`hero-copy ${shot.kind}`} style={{transform:`translateY(${(1-pop)*60}px)`}}>
        {(!fruit || global>=85.8)&&<><div className="eyebrow">{shot.tag}</div><h1>{shot.title}</h1></>}
        {opening&&global>1.9&&<p>{shot.note}</p>}
      </div>
      {fruit&&<div className="jelly-drop" style={{transform:`translateY(${-132+ease(local,1.9,2.85)*620}px) rotate(${local*8}deg)`,opacity:1-ease(local,2.7,3.06)}}/>}
    </>;
  }
  const right=shot.kind==='right';
  const prop=shot.art===2?'school-tray':shot.at===31.15?'recipe-magazine':null;
  return <div className={`layout ${right?'right':'left'}`}>
    <div className="shape" style={{background:shot.mono?'#b3a89a':shot.at>=45&&shot.at<63?'#e4aa3a':'#b84645'}}/>
    {prop?<div className="loose-prop" style={{transform:`translateY(${(prop==='school-tray'?-290:105)*(1-pop)}px) rotate(${-7+7*pop}deg)`}}><Prop name={prop}/></div>:
    <div className="photo torn" style={{transform:`translateX(${(right?1:-1)*120*(1-pop)}px) rotate(${(right?2:-2)+Math.sin(local*.48)*1.5}deg) scale(${.96+pop*.04})`}}>
      <Art index={shot.art} local={local} style={{filter:shot.mono?'grayscale(1) contrast(1.12)':undefined,...(shot.at===51?{objectPosition:'58% 38%'}:{})}}/>
    </div>}
    {shot.at===31.15&&<IngredientCutouts local={local} collide/>}
    <div className="copy" style={{transform:`translateY(${44*(1-pop)}px)`}}>
      <div className="eyebrow">{shot.calendar&&local<1.15?Math.round(2026-128*ease(local,0,1.15)):shot.tag}</div>
      <h1 style={{fontSize:shot.title.split('\n').some(line=>line.length>=12)?78:108}}>{shot.title}</h1>
      {shot.note&&<p style={{opacity:ease(local,.5,1)}}>{shot.note}</p>}
      {shot.chips&&<div className="chips">{shot.chips.map((item,i)=><span key={item} style={{opacity:ease(local,[3.1,4.35,5.45][i],[3.45,4.7,5.8][i])}}>{item}</span>)}</div>}
    </div>
    {!prop&&<div className="tape" style={{transform:`rotate(${right?19:-17}deg)`}}/>}
  </div>;
}
function Film(){
  const frame=useCurrentFrame(),t=frame/fps;
  const shot=shots[shots.findLastIndex(c=>c.at<=t)],local=t-shot.at;
  return <AbsoluteFill className="paper">
    <Audio src={staticFile('narration.wav')} volume={.94}/>
    <Audio src={staticFile('effects.wav')} volume={.68}/>
    <Shot shot={shot} local={local} global={t}/>
    <div className="ink-grain"/>
    <div className="rule" style={{width:`${100*t/90}%`}}/>
  </AbsoluteFill>;
}
registerRoot(()=> <Composition id="PBJ" component={Film} width={1920} height={1080} fps={fps} durationInFrames={90*fps}/>);
