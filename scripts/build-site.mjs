import fs from 'node:fs';
import path from 'node:path';
const cwd=process.cwd(),src=path.join(cwd,'src'),cube=path.join(cwd,'cube-source'),out=path.join(cwd,'site');
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
console.log('Built deterministic site with pinned local Cube at ./cube/.');
