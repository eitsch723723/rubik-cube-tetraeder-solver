'use strict';
(function(){
  const $=id=>document.getElementById(id);
  const api=window.__PYRA_TEST__;
  if(!api)return;
  const {Core,state}=api;
  const FULL_TEST='rrryyygggbgbybbbgggggrbbbyyrrryyybrr';
  const byCode={g:'green',r:'red',b:'blue',y:'yellow'};
  const originalSolve=window.solve;

  function setTestResult(text='',kind=''){
    const e=$('testResult');
    if(!e)return;
    e.textContent=text;
    e.className='test-result'+(kind?' '+kind:'');
  }
  function loadTest(s,mode,message){
    state.testMode=mode;
    state.solution=[];
    state.states=[];
    state.step=0;
    state.faces=Array.from({length:4},(_,fi)=>Array.from({length:9},(_,i)=>byCode[s[fi*9+i]]));
    state.currentFace=0;
    state.selected='green';
    window.showInput();
    window.setValidation(message,'success');
    window.setStatus('Testzustand geladen.','ok');
    setTestResult();
    $('testDrawer').hidden=true;
  }

  $('chooseCube').onclick=()=>{location.href='./cube.html';};
  $('testsBtn').onclick=()=>{$('testDrawer').hidden=!$('testDrawer').hidden;};
  $('quickTestBtn').onclick=()=>loadTest(Core.KNOWN,'quick','Schnelltest geladen. Erwartung: geprüfte 4-Zug-Lösung.');
  $('fullTestBtn').onclick=()=>loadTest(FULL_TEST,'full',"Großer Test geladen. Der Zustand entstand aus L R L R' L' B O L H O H' und benötigt eine längere Lösung.");
  $('invalidTestBtn').onclick=()=>loadTest(Core.INVALID,'invalid','Fehlertest geladen. Erwartung: Die App muss diesen Zustand ablehnen.');

  $('solveBtn').onclick=async()=>{
    const mode=state.testMode;
    state.solution=[];
    await originalSolve();
    if(mode==='quick'){
      const ok=state.solution.length===4;
      setTestResult(ok?'Schnelltest bestanden: 4-Zug-Referenz korrekt gelöst.':`Schnelltest auffällig: ${state.solution.length} Züge gefunden.`,ok?'success':'error');
    }else if(mode==='full'){
      const ok=state.solution.length>0&&Core.verifySolution(FULL_TEST,state.solution);
      setTestResult(ok?`Großer Test bestanden: verifizierte Lösung mit ${state.solution.length} Zügen gefunden.`:'Großer Test fehlgeschlagen: keine verifizierte Lösung gefunden.',ok?'success':'error');
    }else if(mode==='invalid'){
      const path=Core.solveBidirectional(Core.INVALID,11);
      setTestResult(path===null?'Fehlertest bestanden: Der unmögliche Tetraeder wurde richtig abgelehnt.':'Fehlertest nicht bestanden: Der unmögliche Zustand wurde akzeptiert.',path===null?'success':'error');
    }
  };

  document.addEventListener('pointerdown',e=>{
    const drawer=$('testDrawer'),button=$('testsBtn');
    if(drawer&&!drawer.hidden&&!drawer.contains(e.target)&&!button.contains(e.target))drawer.hidden=true;
  });
})();
