const {test,expect}=require('@playwright/test');

async function openPyra(page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#chooser')).toBeVisible();
  await expect(page.locator('#choosePyra')).toBeVisible();
  await page.locator('#choosePyra').click();
  await expect(page.locator('#chooser')).toBeHidden();
  await expect(page.locator('#pyraApp')).toBeVisible();
  await expect(page.locator('#testsBtn')).toBeVisible();
}
async function loadPyraTest(page,button){
  await openPyra(page);
  await page.locator('#testsBtn').click();
  await expect(page.locator('#testDrawer')).toBeVisible();
  await page.locator(button).click();
  await expect(page.locator('#solveBtn')).toBeVisible();
}
async function expectSolveFitsViewport(page){
  await expect(page.locator('#solveView')).toBeVisible();
  const fit=await page.evaluate(()=>{
    const r=document.querySelector('#solveView').getBoundingClientRect();
    return document.documentElement.scrollWidth<=window.innerWidth+2&&document.body.scrollWidth<=window.innerWidth+2&&document.documentElement.scrollHeight<=window.innerHeight+2&&document.body.scrollHeight<=window.innerHeight+2&&r.right<=window.innerWidth+2&&r.bottom<=window.innerHeight+2;
  });
  expect(fit).toBe(true);
}

test('Puzzle selection opens deterministic local Cube and returns to chooser',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#chooser')).toBeVisible();
  await expect(page.locator('#pyraApp')).toBeHidden();
  await page.click('#chooseCube');
  await expect(page).toHaveURL(/\/cube\/$/);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('#choosePuzzleBtn')).toBeVisible();
  await page.click('#testsBtn');await page.click('#quickTestBtn');await page.click('#solveBtn');
  await expect(page.locator('#solveView')).toBeVisible();
  await expect(page.locator('#moveTitle')).toContainText('R');
  await page.click('#choosePuzzleBtn');await expect(page).toHaveURL(/\/$/);await expect(page.locator('#chooser')).toBeVisible();
});

test('Tetraeder quick test solves completely, maps animation exactly and keeps permanent orientation markers',async({page})=>{
  await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();
  await expect(page.locator('#solveView')).toBeVisible();await expect(page.locator('#statusText')).toContainText('Lösung verifiziert');
  const mapping=await page.evaluate(()=>window.__PYRA_VISUAL_TEST__?.verifyVisualMapping());expect(mapping).toBe(true);
  await expect(page.locator('.mini-face-label strong')).toHaveText(['V','L','R','U']);
  await expect(page.locator('.orientation-marker text')).toHaveText(['V','L','R','U']);
  const points=()=>page.locator('#solvePreview').evaluate(svg=>[...svg.querySelectorAll('polygon')].map(p=>p.getAttribute('points')).join('|'));
  const before=await points(),statsBefore=await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.stats());await page.waitForTimeout(350);const after=await points(),statsAfter=await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.stats());
  expect(after).not.toBe(before);expect(statsAfter.sceneBuilds).toBe(statsBefore.sceneBuilds);expect(statsAfter.movingPointUpdates).toBeGreaterThan(statsBefore.movingPointUpdates);expect(statsAfter.polygonCount).toBe(36);
  await expectSolveFitsViewport(page);
});

test('Tetraeder full test includes independent tip moves and verifies final state',async({page})=>{
  await loadPyraTest(page,'#fullTestBtn');await page.locator('#solveBtn').click();
  await expect(page.locator('#solveView')).toBeVisible();await expect(page.locator('#testResult')).toContainText('Großer Test bestanden');
  const hasTip=await page.evaluate(()=>window.__PYRA_TEST__.state.solution.some(m=>m[0]===m[0].toLowerCase()));expect(hasTip).toBe(true);
  const verified=await page.evaluate(()=>{const a=window.__PYRA_TEST__;const s=a.state.states[0];return a.Core.verifySolution(s,a.state.solution);});expect(verified).toBe(true);
});

test('Tetraeder impossible state is rejected',async({page})=>{
  await loadPyraTest(page,'#invalidTestBtn');await page.locator('#solveBtn').click();
  await expect(page.locator('#statusText')).toContainText('physikalisch nicht erreichbar');await expect(page.locator('#solveView')).toBeHidden();
  await expect(page.locator('#testResult')).toContainText('Fehlertest bestanden');
});

test('Reduced motion disables continuous Tetraeder turn animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();await expect(page.locator('#solveView')).toBeVisible();
  const before=await page.locator('#solvePreview').evaluate(svg=>[...svg.querySelectorAll('polygon')].map(p=>p.getAttribute('points')).join('|'));await page.waitForTimeout(450);const after=await page.locator('#solvePreview').evaluate(svg=>[...svg.querySelectorAll('polygon')].map(p=>p.getAttribute('points')).join('|'));
  expect(after).toBe(before);expect(await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.isReducedMotion())).toBe(true);expect(await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.isAnimating())).toBe(false);
});

test('Tetraeder animation pauses while hidden and resumes when visible',async({page})=>{
  await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();await expect(page.locator('#solveView')).toBeVisible();await page.waitForTimeout(100);
  expect(await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.isAnimating())).toBe(true);await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.syncVisibility(true));expect(await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.isAnimating())).toBe(false);await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.syncVisibility(false));await page.waitForTimeout(50);expect(await page.evaluate(()=>window.__PYRA_VISUAL_TEST__.isAnimating())).toBe(true);
});

test('Tetraeder solution progress survives reload',async({page})=>{
  await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();await expect(page.locator('#solveView')).toBeVisible();await page.locator('#nextStep').click();await expect(page.locator('#stepCount')).toContainText('Zug 2 von 4');
  await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('#pyraApp')).toBeVisible();await expect(page.locator('#solveView')).toBeVisible();await expect(page.locator('#stepCount')).toContainText('Zug 2 von 4');expect(await page.evaluate(()=>window.__PYRA_TEST__.state.step)).toBe(1);
});

test('Cube min2phase dependency is immutable in generated Pages site',async({request})=>{
  const pin='0ba83a6177d816f72af1a45c9015349da597456a';const worker=await request.get('/cube/solver-worker.js');expect(worker.ok()).toBe(true);const workerText=await worker.text();expect(workerText).toContain(pin);expect(workerText).not.toContain('@master/min2phase.js');
  const nestedSw=await request.get('/cube/sw.js');expect(nestedSw.ok()).toBe(true);const nestedText=await nestedSw.text();expect(nestedText).toContain(pin);expect(nestedText).not.toContain('@master/min2phase.js');
  const rootSw=await request.get('/sw.js');expect(rootSw.ok()).toBe(true);const rootText=await rootSw.text();expect(rootText).toContain(pin);expect(rootText).not.toContain('@master/min2phase.js');
});

test('Tetraeder solve view fits iPhone landscape without page scrolling',async({page})=>{
  await page.setViewportSize({width:844,height:390});await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();await expectSolveFitsViewport(page);
});

test('Tetraeder solve view fits iPad portrait and landscape',async({page})=>{
  for(const viewport of [{width:820,height:1180},{width:1180,height:820}]){
    await page.setViewportSize(viewport);await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();await expectSolveFitsViewport(page);
  }
});
