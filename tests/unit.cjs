'use strict';
const assert=require('node:assert/strict');
const Core=require('../tetra-core.js');
for(const m of Core.MOVES){const back=Core.applyMove(Core.applyMove(Core.SOLVED,m),Core.inverse(m));assert.equal(back,Core.SOLVED,`inverse failed for ${m}`);let s=Core.SOLVED;const q=m.endsWith("'")?m[0]:m;for(let i=0;i<3;i++)s=Core.applyMove(s,q);assert.equal(s,Core.SOLVED,`three 120-degree turns failed for ${m}`);}
const known=Core.solveFull(Core.KNOWN,11);assert.ok(known);assert.equal(known.length,4);assert.ok(Core.verifySolution(Core.KNOWN,known));
const tipState=Core.applyMove(Core.SOLVED,'u');const tipSolution=Core.solveFull(tipState,11);assert.ok(tipSolution);assert.equal(tipSolution.length,1);assert.ok(Core.verifySolution(tipState,tipSolution));
const sequence=['U','R',"L'",'B',"U'",'L',"R'",'B','u',"r'",'l','b'];let full=Core.SOLVED;for(const m of sequence)full=Core.applyMove(full,m);const fullSolution=Core.solveFull(full,11);assert.ok(fullSolution);assert.ok(fullSolution.some(m=>m[0]===m[0].toLowerCase()));assert.ok(Core.verifySolution(full,fullSolution));
assert.equal(Core.solveFull(Core.INVALID,11),null);
console.log(`Tetraeder unit regression passed: known=${known.length}, full=${fullSolution.length}, tip=${tipSolution.length}`);
