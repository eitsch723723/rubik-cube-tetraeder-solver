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

test('Tetraeder quick test solves completely and animation mapping is exact',async({page})=>{
  await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();
  await expect(page.locator('#solveView')).toBeVisible();await expect(page.locator('#statusText')).toContainText('Lösung verifiziert');
  const mapping=await page.evaluate(()=>window.__PYRA_VISUAL_TEST__?.verifyVisualMapping());expect(mapping).toBe(true);
  await expect(page.locator('.mini-face-label strong')).toHaveText(['V','L','R','U']);
  const points=()=>page.locator('#solvePreview').evaluate(svg=>[...svg.querySelectorAll('polygon')].map(p=>p.getAttribute('points')).join('|'));
  const before=await points();await page.waitForTimeout(350);const after=await points();expect(after).not.toBe(before);
  const noScroll=await page.evaluate(()=>document.documentElement.scrollHeight<=window.innerHeight+2&&document.body.scrollHeight<=window.innerHeight+2);expect(noScroll).toBe(true);
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

test('Tetraeder solve view fits iPhone landscape without page scrolling',async({page})=>{
  await page.setViewportSize({width:844,height:390});await loadPyraTest(page,'#quickTestBtn');await page.locator('#solveBtn').click();await expect(page.locator('#solveView')).toBeVisible();
  const fit=await page.evaluate(()=>{const r=document.querySelector('#solveView').getBoundingClientRect();return document.documentElement.scrollHeight<=window.innerHeight+2&&document.body.scrollHeight<=window.innerHeight+2&&r.bottom<=window.innerHeight+2;});expect(fit).toBe(true);
});
