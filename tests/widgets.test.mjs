import test from 'node:test';
import assert from 'node:assert/strict';
import {renderWidgets,whatsappUrl} from '../src/widgets.mjs';
import {business} from '../src/data.mjs';
import {pages,header,footer} from '../src/templates.mjs';
import {normalisePreferences,readPreferences,savePreferences,PREFERENCE_KEY} from '../public/assets/widget-utils.js';
import {validateForm} from '../public/assets/validation.js';

test('WhatsApp requires an explicit international business destination',()=>{
  assert.equal(whatsappUrl(''),'');
  assert.equal(whatsappUrl('0435 825 566'),'');
  assert.equal(whatsappUrl('javascript:alert(1)'),'');
  assert.equal(whatsappUrl('+61 435 825 566'),'https://wa.me/61435825566');
  assert.doesNotMatch(renderWidgets({whatsappNumber:''}),/href="https:\/\/wa\.me\//);
  assert.match(renderWidgets({whatsappNumber:'+61 435 825 566'}),/href="https:\/\/wa\.me\/61435825566"/);
  assert.equal(whatsappUrl(business.whatsapp),'https://wa.me/61435825566');
});

test('display preferences recover from blocked, corrupt and unsupported storage',()=>{
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(readPreferences(blocked),{scale:100,contrast:false,underline:false,motion:false});
  assert.equal(savePreferences(blocked,{scale:120}),false);
  assert.equal(readPreferences({getItem:()=>'{invalid'}).scale,100);
  assert.deepEqual(normalisePreferences({scale:999,contrast:'false',motion:true,underline:true}),{scale:140,contrast:false,underline:true,motion:true});
  const stored=new Map(),storage={getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value)};
  assert.equal(savePreferences(storage,{scale:120,contrast:true}),true);
  assert.equal(JSON.parse(stored.get(PREFERENCE_KEY)).scale,120);
  assert.equal(readPreferences(storage).contrast,true);
});

test('widget controls coexist with every page without duplicate IDs or broken labels',()=>{
  for(const page of pages){
    const html=header(page.path)+page.render()+footer()+renderWidgets({whatsappNumber:''});
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(ids.length,new Set(ids).size,page.path+': duplicate ID');
    for(const [,target] of html.matchAll(/\bfor="([^"]+)"/g))assert.ok(ids.includes(target),page.path+': missing label target '+target);
    for(const [,targets] of html.matchAll(/\baria-(?:controls|labelledby|describedby)="([^"]+)"/g))for(const target of targets.split(/\s+/))assert.ok(ids.includes(target),page.path+': missing accessible target '+target);
  }
});

test('quick callback requests require a valid phone number and permission',()=>{
  const callback={kind:'enquiry',name:'Sample visitor',method:'phone',phone:'0400 000 000',service:'unsure',message:'Please discuss an appointment.',consent:'on'};
  assert.equal(validateForm(callback).valid,true);
  assert.equal(validateForm({...callback,phone:''}).errors.phone,'Enter your phone number.');
  assert.equal(validateForm({...callback,phone:'abc'}).valid,false);
  assert.equal(validateForm({...callback,consent:''}).valid,false);
});
