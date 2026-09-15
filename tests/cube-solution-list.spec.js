const {test,expect}=require('@playwright/test');

async function solveFullCube(page){
  await page.goto('/cube/',{waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle('Zauberwürfel-Löser');
  await page.locator('#testsBtn').click();
  await expect(page.locator('#testDrawer')).toBeVisible();
  await page.locator('#fullTestBtn').click();
  await expect(page.locator('#solveBtn')).toBeVisible();
  await page.locator('#solveBtn').click();
  await expect(page.locator('#solveView')).toBeVisible();
  await expect(page.locator('#statusText')).toContainText('Kurze Lösung gefunden');
}

async function expectCompleteMoveList(page){
  const result=await page.evaluate(()=>{
    const sequence=document.querySelector('.solution-sequence');
    const list=document.querySelector('#solutionList');
    const instruction=document.querySelector('.instruction-panel');
    const chips=[...list.querySelectorAll('.move-chip')];
    const lr=list.getBoundingClientRect(),ir=instruction.getBoundingClientRect();
    const stepText=document.querySelector('#stepCount').textContent;
    const total=Number((stepText.match(/von\s+(\d+)/)||[])[1]||0);
    const allVisible=chips.every(chip=>{const r=chip.getBoundingClientRect();return r.left>=lr.left-1&&r.right<=lr.right+1&&r.top>=lr.top-1&&r.bottom<=lr.bottom+1&&r.bottom<=ir.bottom+1;});
    const allTextVisible=chips.every(chip=>chip.scrollWidth<=chip.clientWidth+1&&chip.scrollHeight<=chip.clientHeight+1);
    return {
      total,
      count:chips.length,
      sequenceDisplay:getComputedStyle(sequence).display,
      listOverflow:getComputedStyle(list).overflow,
      allVisible,
      allTextVisible,
      listFits:list.scrollWidth<=list.clientWidth+1&&list.scrollHeight<=list.clientHeight+1,
      instructionFits:instruction.scrollHeight<=instruction.clientHeight+2,
      pageFits:document.documentElement.scrollWidth<=window.innerWidth+2&&document.body.scrollWidth<=window.innerWidth+2&&document.documentElement.scrollHeight<=window.innerHeight+2&&document.body.scrollHeight<=window.innerHeight+2
    };
  });
  expect(result.total).toBeGreaterThan(5);
  expect(result.count).toBe(result.total);
  expect(result.sequenceDisplay).not.toBe('none');
  expect(result.listOverflow).toBe('visible');
  expect(result.allVisible).toBe(true);
  expect(result.allTextVisible).toBe(true);
  expect(result.listFits).toBe(true);
  expect(result.instructionFits).toBe(true);
  expect(result.pageFits).toBe(true);
  return result;
}

test('Zauberwürfel always shows the complete solution move list on iPhone portrait and landscape',async({page})=>{
  await page.setViewportSize({width:402,height:740});
  await solveFullCube(page);
  await expectCompleteMoveList(page);

  const tightStillVisible=await page.evaluate(()=>{
    document.body.classList.add('tight');
    const sequence=document.querySelector('.solution-sequence');
    const list=document.querySelector('#solutionList');
    return getComputedStyle(sequence).display!=='none'&&getComputedStyle(list).overflow==='visible';
  });
  expect(tightStillVisible).toBe(true);

  await page.setViewportSize({width:844,height:390});
  await page.waitForTimeout(180);
  await expectCompleteMoveList(page);
});
