import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 for(const id of ['elmos','renesas','novosense','ti','melexis','adi','jhm']){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Object.defineProperty(navigator,'serial',{configurable:true,value:{requestPort:async()=>{throw new DOMException('Cancelled','NotFoundError')},getPorts:async()=>[],addEventListener:()=>{},removeEventListener:()=>{}}})});
  await page.goto('http://127.0.0.1:8000/modules/'+id+'/index.html',{waitUntil:'domcontentloaded'});
  const gear=page.locator(id==='renesas'?'#settings':'#settingsOpen');
  const panel=page.locator(id==='adi'?'#settingsDialog':'#settingsPanel');
  await gear.waitFor({state:'visible',timeout:20000});
  await gear.click();assert.ok(await panel.isVisible(),id+' open');
  assert.equal(await gear.getAttribute('aria-expanded'),'true',id);
  await panel.locator('h2,h3,strong').first().click();assert.ok(await panel.isVisible(),id+' inside click');
  await page.keyboard.press('Escape');assert.equal(await panel.isVisible(),false,id+' Escape');
  assert.equal(await gear.evaluate(el=>document.activeElement===el),true,id+' focus');
  await gear.click();await page.evaluate(()=>{document.body.click()});assert.equal(await panel.isVisible(),false,id+' outside click');
  await gear.click();await gear.click();assert.equal(await panel.isVisible(),false,id+' toggle');
  assert.deepEqual(errors,[],id+' uncaught errors');await page.close();console.log(id+' shared settings contract passed');
 }
}finally{await browser.close()}
