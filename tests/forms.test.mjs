import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHandler} from '../src/http.mjs';
import {validateForm} from '../public/assets/validation.js';
import {pages} from '../src/templates.mjs';
import {redirects} from '../src/data.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const enquiry={kind:'enquiry',name:'Review Test',method:'email',email:'review@example.com',service:'unsure',message:'Test data only',consent:'on'};
const req=(data=enquiry,{origin='https://review.example',headers={},method='POST'}={})=>new Request('https://review.example/api/forms',{method,headers:{'Content-Type':'application/json',Origin:origin,...headers},...(method==='POST'?{body:JSON.stringify(data)}:{})});
test('valid enquiries, participant referrals and anonymous feedback are accepted',()=>{
 assert.equal(validateForm(enquiry).valid,true);
 assert.equal(validateForm({kind:'referral',name:'Test Referrer',email:'review@example.com',message:'Example support enquiry'}).valid,true);
 assert.equal(validateForm({kind:'feedback',feedbackType:'concern',method:'none',message:'Sample concern',consent:'on'}).valid,true);
});
test('consent, selected contact method and service are enforced',()=>{
 const result=validateForm({...enquiry,consent:'',method:'phone',phone:'',service:'invalid'});
 assert.deepEqual(Object.keys(result.errors).sort(),['consent','phone','service']);
 assert.equal(validateForm({...enquiry,email:'bad\nBcc:other@example.com'}).valid,false);
 assert.equal(validateForm({...enquiry,website:'spam'}).valid,false);
 assert.equal(validateForm({...enquiry,message:'x'.repeat(2001)}).valid,false);
});
test('simple referrals require only name, email and reason',()=>{
 const basic={kind:'referral',name:'Test Referrer',email:'review@example.com',message:'Sample reason'};
 assert.equal(validateForm(basic).valid,true);
 for(const field of ['name','email','message'])assert.equal(validateForm({...basic,[field]:''}).valid,false,field);
 assert.equal(validateForm({...basic,email:'invalid'}).valid,false);
});
test('review API validates but never sends or stores a message',async()=>{
 let count=0;const handle=createHandler({root,env:{REVIEW_MODE:'true'},send:async()=>{count++;throw Error('Must not send')}});
 const response=await handle(req());assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{mode:'review',validated:true,delivered:false});assert.equal(count,0);
});
test('unconfigured live delivery fails honestly',async()=>{
 const handle=createHandler({root,env:{REVIEW_MODE:'false'}});
 assert.equal((await handle(req())).status,503);
});
test('delivery only reports acceptance after a successful provider response',async()=>{
 let sent;
 const env={REVIEW_MODE:'false',RESEND_API_KEY:'dummy-test-only',FROM_EMAIL:'test@example.com',BUSINESS_EMAIL:'inbox@example.com'};
 const handle=createHandler({root,env,send:async(url,options)=>{sent=JSON.parse(options.body);return Response.json({id:'test-provider-receipt'})}});
 const response=await handle(req());const output=await response.json();assert.equal(response.status,200);assert.equal(output.delivered,true);assert.ok(output.reference);assert.deepEqual(sent.to,['inbox@example.com']);assert.equal(sent.reply_to,enquiry.email);assert.match(sent.text,/Consent: confirmed/);
 const failed=createHandler({root,env,send:async()=>Response.json({error:'test failure'},{status:500})});assert.equal((await failed(req())).status,502);
 const rejected=createHandler({root,env,send:async()=>Response.json({})});assert.equal((await rejected(req())).status,502);
});
test('wrong origins, invalid input, wrong methods and large requests are blocked',async()=>{
 const handle=createHandler({root,env:{REVIEW_MODE:'true'}});
 assert.equal((await handle(req(enquiry,{origin:'https://other.example'}))).status,403);
 assert.equal((await handle(req({...enquiry,email:''}))).status,422);
 assert.equal((await handle(req(enquiry,{method:'GET'}))).status,405);
 assert.equal((await handle(req(enquiry,{headers:{'Content-Length':'20000'}}))).status,413);
 assert.equal((await handle(req(enquiry,{headers:{'Content-Type':'text/plain'}}))).status,415);
});
test('rapid repeated submissions are limited',async()=>{
 const handle=createHandler({root,env:{REVIEW_MODE:'true'}});
 for(let i=0;i<5;i++)assert.equal((await handle(req(),'repeat-client')).status,200);
 assert.equal((await handle(req(),'repeat-client')).status,429);
});
test('all published page routes and original About redirects resolve',async()=>{
 const handle=createHandler({root,env:{REVIEW_MODE:'true'}});
 for(const page of pages){const response=await handle(new Request('https://review.example'+page.path));assert.equal(response.status,200,page.path);assert.match(response.headers.get('content-type'),/text\/html/);assert.match(response.headers.get('x-robots-tag'),/noindex/)}
 for(const [old,destination] of Object.entries(redirects)){const response=await handle(new Request('https://review.example'+old));assert.equal(response.status,301,old);assert.equal(response.headers.get('location'),destination)}
 assert.equal((await handle(new Request('https://review.example/missing-page/'))).status,404);
 assert.equal((await handle(new Request('https://review.example/.env'))).status,404);
 assert.equal((await handle(new Request('https://review.example/%2e%2e%2fpackage.json'))).status,404);
});
