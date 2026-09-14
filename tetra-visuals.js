'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const api=window.__PYRA_TEST__;
  if(!api)return;
  const {Core,state,TRIANGLES}=api;
  const SVG='http://www.w3.org/2000/svg';

  // Regular tetrahedron. Vertex order: O(oben), L(links), R(rechts), H(hinten).
  const H=Math.sqrt(8/3);
  const V=[
    [0,2/Math.sqrt(3),H/4],
    [-1,-1/Math.sqrt(3),H/4],
    [1,-1/Math.sqrt(3),H/4],
    [0,0,H/4-H]
  ];
  // State face order: V, L, R, U (unten).
  const FACE_VERTICES=[[0,1,2],[0,3,1],[0,2,3],[1,3,2]];
  const FACE_LABELS=[['V','Vorne'],['L','Links'],['R','Rechts'],['U','Unten']];
  const MOVE_VERTEX={U:0,L:1,R:2,B:3};
  const CODE_COLOR={g:'#079455',r:'#d92d20',b:'#175cd3',y:'#ffd500'};

  // Maps each solver sticker position to its geometric triangle position on the same face.
  // This mapping was derived against the exact U/R/L/B permutation model in tetra-core.js.
  const SOLVER_TO_GEOM=[
    [0,1,6,2,3,7,4,5,8],
    [0,1,6,2,3,7,4,8,5],
    [0,1,6,2,7,3,4,8,5],
    [3,4,7,1,8,5,2,6,0]
  ];

  function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
  function scale(a,s){return[a[0]*s,a[1]*s,a[2]*s];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function norm(a){return Math.hypot(a[0],a[1],a[2]);}
  function unit(a){const n=norm(a);return scale(a,1/n);}
  function rotateAxis(p,axis,angle){
    const k=unit(axis),c=Math.cos(angle),s=Math.sin(angle);
    return add(add(scale(p,c),scale(cross(k,p),s)),scale(k,dot(k,p)*(1-c)));
  }
  function rotateView(p){
    let [x,y,z]=p;
    const ax=-0.16,ay=0.42;
    let c=Math.cos(ax),s=Math.sin(ax);
    [y,z]=[y*c-z*s,y*s+z*c];
    c=Math.cos(ay);s=Math.sin(ay);
    [x,z]=[x*c+z*s,-x*s+z*c];
    return[x,y,z];
  }
  function project(p){
    const [x,y,z]=rotateView(p),cam=4.7,k=cam/(cam-z),sc=75;
    return[150+x*sc*k,116-y*sc*k,z];
  }
  function polygon(points,attrs={}){
    const p=document.createElementNS(SVG,'polygon');
    p.setAttribute('points',points.map(q=>`${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' '));
    Object.entries(attrs).forEach(([k,v])=>p.setAttribute(k,String(v)));
    return p;
  }

  function faceTriangles(faceIndex){
    const [ai,bi,ci]=FACE_VERTICES[faceIndex],A=V[ai],B=V[bi],C=V[ci],n=3,out=[];
    const P=(r,c)=>add(scale(A,1-r/n),add(scale(B,(r-c)/n),scale(C,c/n)));
    for(let r=0;r<n;r++)for(let c=0;c<=r;c++)out.push([P(r,c),P(r+1,c),P(r+1,c+1)]);
    for(let r=1;r<n;r++)for(let c=0;c<r;c++)out.push([P(r,c),P(r,c+1),P(r+1,c+1)]);
    return out;
  }
  const GEOM=FACE_VERTICES.map((_,i)=>faceTriangles(i));

  function permutationFor(move){
    const tokens=Array.from({length:36},(_,i)=>String.fromCharCode(0x400+i)).join('');
    const moved=Core.applyMove(tokens,move);
    const oldToNew=Array(36);
    for(let newPos=0;newPos<36;newPos++)oldToNew[moved.charCodeAt(newPos)-0x400]=newPos;
    return oldToNew;
  }
  const MOVE_PERM=Object.fromEntries(['U','R','L','B'].map(m=>[m,permutationFor(m)]));
  const AFFECTED=Object.fromEntries(Object.entries(MOVE_PERM).map(([m,p])=>[m,new Set(p.map((j,i)=>j!==i?i:null).filter(i=>i!==null))]));

  function currentState(){return state.states[state.step]||Core.SOLVED;}
  function drawTetra(angle=0,move=null){
    const svg=$('solvePreview');
    if(!svg)return;
    svg.innerHTML='';
    const s=currentState();
    const moveFace=move?move[0]:null;
    const affected=moveFace?AFFECTED[moveFace]:null;
    const axis=moveFace?V[MOVE_VERTEX[moveFace]]:null;
    const items=[];
    for(let solverPos=0;solverPos<36;solverPos++){
      const fi=Math.floor(solverPos/9),li=solverPos%9,gi=SOLVER_TO_GEOM[fi][li];
      let pts=GEOM[fi][gi];
      if(affected&&affected.has(solverPos))pts=pts.map(p=>rotateAxis(p,axis,angle));
      const pp=pts.map(project),z=pp.reduce((n,p)=>n+p[2],0)/3;
      items.push({pp,z,fill:CODE_COLOR[s[solverPos]]||'#eef2f6',moving:!!(affected&&affected.has(solverPos))});
    }
    items.sort((a,b)=>a.z-b.z);
    for(const item of items){
      svg.appendChild(polygon(item.pp,{fill:item.fill,stroke:item.moving?'#0b4ca8':'#101828','stroke-width':item.moving?2.9:2.2,'stroke-linejoin':'round'}));
    }
  }

  let raf=0,animationKey='';
  function stopAnimation(){if(raf)cancelAnimationFrame(raf);raf=0;animationKey='';}
  function startAnimation(force=false){
    stopAnimation();
    if($('solveView')?.hidden)return;
    const move=state.solution[state.step];
    if(!move){drawTetra(0,null);return;}
    animationKey=`${state.step}:${move}:${Date.now()}`;
    const key=animationKey,start=performance.now();
    const target=(move.endsWith("'")?1:-1)*(2*Math.PI/3);
    const duration=900,hold=260,cycle=1650;
    const frame=now=>{
      if(key!==animationKey||$('solveView')?.hidden)return;
      const t=(now-start)%cycle;
      let angle=0;
      if(t<duration){const x=t/duration,e=.5-.5*Math.cos(Math.PI*x);angle=target*e;}
      else if(t<duration+hold)angle=target;
      drawTetra(angle,move);
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
  }

  function renderLabeledFlat(){
    const h=$('flatPyra');
    if(!h)return;
    const s=currentState();
    h.innerHTML='';
    for(let f=0;f<4;f++){
      const card=document.createElement('div');card.className='mini-face-card';
      const svg=document.createElementNS(SVG,'svg');svg.setAttribute('viewBox','0 0 346.41 300');svg.classList.add('mini-face-svg');
      TRIANGLES.forEach((pts,i)=>svg.appendChild(polygon(pts,{fill:CODE_COLOR[s[f*9+i]]||'#eef2f6',stroke:'#101828','stroke-width':5,'stroke-linejoin':'round'})));
      const label=document.createElement('div');label.className='mini-face-label';
      label.innerHTML=`<strong>${FACE_LABELS[f][0]}</strong><span>${FACE_LABELS[f][1]}</span>`;
      card.append(svg,label);h.appendChild(card);
    }
  }

  // Mathematical regression check: a full animated turn must land on the same
  // sticker destinations as tetra-core.js for each main move.
  function verifyVisualMapping(){
    const eps=1e-7;
    for(const m of ['U','R','L','B']){
      const p=MOVE_PERM[m],axis=V[MOVE_VERTEX[m]],angle=-2*Math.PI/3;
      for(const i of AFFECTED[m]){
        const fi=Math.floor(i/9),li=i%9,gi=SOLVER_TO_GEOM[fi][li];
        const c=GEOM[fi][gi].reduce((a,q)=>add(a,q),[0,0,0]).map(x=>x/3);
        const rc=rotateAxis(c,axis,angle),j=p[i],fj=Math.floor(j/9),lj=j%9,gj=SOLVER_TO_GEOM[fj][lj];
        const dc=GEOM[fj][gj].reduce((a,q)=>add(a,q),[0,0,0]).map(x=>x/3);
        if(norm([rc[0]-dc[0],rc[1]-dc[1],rc[2]-dc[2]])>eps)return false;
      }
    }
    return true;
  }

  const step=$('stepCount');
  if(step){
    new MutationObserver(()=>requestAnimationFrame(()=>{renderLabeledFlat();startAnimation();})).observe(step,{childList:true,subtree:true,characterData:true});
  }
  const replay=$('replayBtn');if(replay)replay.onclick=()=>startAnimation(true);
  const edit=$('editBtn');if(edit)edit.addEventListener('click',stopAnimation);
  const backHome=$('backHome');if(backHome)backHome.addEventListener('click',stopAnimation);

  if(!verifyVisualMapping())console.error('Tetraeder visual mapping regression failed');
  window.__PYRA_VISUAL_TEST__={verifyVisualMapping,startAnimation,renderLabeledFlat};
})();
