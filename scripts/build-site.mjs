import fs from 'node:fs';
import path from 'node:path';
const cwd=process.cwd(),src=path.join(cwd,'src'),cube=path.join(cwd,'cube-source'),out=path.join(cwd,'site');
const MIN2PHASE_COMMIT='0ba83a6177d816f72af1a45c9015349da597456a';
const MASTER_SOLVER='https://cdn.jsdelivr.net/gh/cs0x7f/min2phase.js@master/min2phase.js';
const PINNED_SOLVER=`https://cdn.jsdelivr.net/gh/cs0x7f/min2phase.js@${MIN2PHASE_COMMIT}/min2phase.js`;
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const rootFiles=['index.html','styles.css','features.css','tetra-visuals.css','tetra-core.js','tetra-worker.js','app.js','release-fixes.js','features.js','tetra-visuals.js','manifest.webmanifest','sw.js','.nojekyll'];
for(const f of rootFiles){const p=path.join(src,f);if(!fs.existsSync(p))throw new Error(`Missing root file ${f}`);fs.copyFileSync(p,path.join(out,f));}
const cubeOut=path.join(out,'cube');fs.mkdirSync(cubeOut,{recursive:true});
const cubeFiles=['index.html','styles.css','app.js','solver-worker.js','sw.js','manifest.webmanifest','.nojekyll'];
for(const f of cubeFiles){const p=path.join(cube,f);if(!fs.existsSync(p))throw new Error(`Missing pinned cube file ${f}`);fs.copyFileSync(p,path.join(cubeOut,f));}
fs.cpSync(path.join(cube,'icons'),path.join(cubeOut,'icons'),{recursive:true});
fs.cpSync(path.join(cube,'icons'),path.join(out,'icons'),{recursive:true});
let html=fs.readFileSync(path.join(cubeOut,'index.html'),'utf8');
const marker='<button class="btn" id="testsBtn" type="button">Tests</button>';
if(!html.includes(marker))throw new Error('Pinned Cube header marker changed; review integration before deploying.');
html=html.replace(marker,'<button class="btn" id="choosePuzzleBtn" type="button" onclick="location.href=\'../\'">Puzzle wählen</button>\n      '+marker);
fs.writeFileSync(path.join(cubeOut,'index.html'),html);
for(const file of ['solver-worker.js','sw.js']){
  const p=path.join(cubeOut,file);let text=fs.readFileSync(p,'utf8');
  if(!text.includes(MASTER_SOLVER))throw new Error(`${file}: expected @master min2phase URL not found in pinned Cube source.`);
  text=text.replaceAll(MASTER_SOLVER,PINNED_SOLVER);fs.writeFileSync(p,text);
}
const worker=fs.readFileSync(path.join(cubeOut,'solver-worker.js'),'utf8');
if(worker.includes('@master')||!worker.includes(MIN2PHASE_COMMIT))throw new Error('Cube solver dependency pinning failed.');
console.log(`Built deterministic site with pinned local Cube and min2phase ${MIN2PHASE_COMMIT}.`);
