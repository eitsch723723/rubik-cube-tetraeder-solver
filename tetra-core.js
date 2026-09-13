'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.TetraCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const MOVES=['U',"U'",'R',"R'",'L',"L'",'B',"B'"];
  const SOLVED='gggggggggrrrrrrrrrbbbbbbbbbyyyyyyyyy';
  const KNOWN='gggyggrggrrrbrrrrrbgbbbbbbbyyyyyygyy';
  const INVALID='rgggggggggrrrrrrrrbbbbbbbbbyyyyyyyyy';

  function cycle(a,x,y,z){const t=a[x];a[x]=a[y];a[y]=a[z];a[z]=t;}
  function quarter(s,face){
    const a=s.split('');
    if(face==='U'){
      const x=a.slice(0,4);
      a.splice(0,4,...a.slice(18,22));
      a.splice(18,4,...a.slice(9,13));
      a.splice(9,4,...x);
    }else if(face==='R'){
      [[3,33,24],[6,28,19],[7,32,23],[8,31,22]].forEach(v=>cycle(a,...v));
    }else if(face==='L'){
      [[1,15,33],[4,17,35],[5,16,34],[6,12,30]].forEach(v=>cycle(a,...v));
    }else if(face==='B'){
      [[10,24,30],[13,26,27],[14,25,29],[15,21,28]].forEach(v=>cycle(a,...v));
    }else throw new Error('unknown move '+face);
    return a.join('');
  }
  function applyMove(s,m){let n=m.endsWith("'")?2:1;while(n--)s=quarter(s,m[0]);return s;}
  function inverse(m){return m.endsWith("'")?m[0]:m+"'";}
  function permutations(a){
    if(a.length<=1)return[a];
    const out=[];
    a.forEach((x,i)=>permutations(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>out.push([x,...p])));
    return out;
  }
  function goalsFor(s){
    const colors=[...new Set(s)];
    if(colors.length!==4)return[];
    return permutations(colors).map(p=>p.map(c=>c.repeat(9)).join(''));
  }
  function solveBidirectional(start,maxDepth=11){
    const goals=goalsFor(start);
    if(goals.includes(start))return[];
    const fm=new Map([[start,[]]]),bm=new Map(goals.map(g=>[g,[]]));
    let ff=[start],bf=goals.slice(),df=0,db=0;
    while(ff.length&&bf.length&&df+db<maxDepth){
      if(ff.length<=bf.length){
        const next=[];
        for(const s of ff){
          const path=fm.get(s),last=path.length?path[path.length-1][0]:null;
          for(const m of MOVES){
            if(m[0]===last)continue;
            const ns=applyMove(s,m);if(fm.has(ns))continue;
            const np=path.concat(m);fm.set(ns,np);
            if(bm.has(ns))return np.concat(bm.get(ns));
            next.push(ns);
          }
        }
        ff=next;df++;
      }else{
        const next=[];
        for(const s of bf){
          const path=bm.get(s),first=path.length?path[0][0]:null;
          for(const m of MOVES){
            if(m[0]===first)continue;
            const ns=applyMove(s,m);if(bm.has(ns))continue;
            const np=[inverse(m)].concat(path);bm.set(ns,np);
            if(fm.has(ns))return fm.get(ns).concat(np);
            next.push(ns);
          }
        }
        bf=next;db++;
      }
    }
    return null;
  }
  function verifySolution(start,moves){
    let s=start;for(const m of moves)s=applyMove(s,m);
    return goalsFor(start).includes(s);
  }
  function buildStates(start,moves){const out=[start];let s=start;for(const m of moves){s=applyMove(s,m);out.push(s);}return out;}
  return {MOVES,SOLVED,KNOWN,INVALID,quarter,applyMove,inverse,goalsFor,solveBidirectional,verifySolution,buildStates};
});
