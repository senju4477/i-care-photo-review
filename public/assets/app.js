import {validateForm} from './validation.js';
const safe=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=(s,root=document)=>root.querySelector(s),qa=(s,root=document)=>[...root.querySelectorAll(s)];
function setupPage(){
 const menu=q('.menu-toggle'),nav=q('#primary-navigation');
 if(menu&&nav){
  const close=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open')};
  menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)};
  nav.onclick=e=>{if(e.target.closest('a'))close()};
  document.onkeydown=e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus()}};
 }
 const search=q('#service-search');
 if(search){let group='All support';const update=()=>{let count=0;qa('.service-item').forEach(el=>{el.hidden=!((group==='All support'||el.dataset.group===group)&&el.dataset.search.includes(search.value.toLowerCase().trim()));if(!el.hidden)count++});q('.result-count').textContent=count+' support option'+(count===1?'':'s');q('.empty-results').hidden=count>0};search.oninput=update;qa('[data-filter]').forEach(button=>button.onclick=()=>{group=button.dataset.filter;qa('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update()})}
 setupServiceRail();
 setupFaqDirectory();
 qa('form[data-form]').forEach(setupForm);
}

function setupFaqDirectory(){
 const list=q('#faq-question-list');if(!list)return;
 const items=qa('[data-faq-category]',list),buttons=qa('[data-faq-filter]');
 const apply=(category)=>{
  let count=0;
  for(const item of items){
   item.hidden=category!=='all'&&item.dataset.faqCategory!==category;
   if(item.hidden)item.open=false;else count++;
  }
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.faqFilter===category));
  q('.faq-result-count').textContent=count+' question'+(count===1?'':'s');
  q('.faq-no-results').hidden=count>0;
 };
 for(const button of buttons)button.onclick=()=>apply(button.dataset.faqFilter);
 for(const item of items)item.addEventListener('toggle',()=>{
  if(item.open)for(const other of items)if(other!==item&&other.open)other.open=false;
 });
 apply('all');
}

function setupServiceRail(){
 if(window.ICGRailResize)window.removeEventListener('resize',window.ICGRailResize);
 const track=q('.service-rail');if(!track)return;
 const cards=qa('.service-slide',track),previous=q('[data-service-scroll="-1"]'),next=q('[data-service-scroll="1"]'),counter=q('.rail-count');
 const stride=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:track.clientWidth;
 const update=()=>{previous.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;counter.textContent=(Math.min(cards.length-1,Math.max(0,Math.round(track.scrollLeft/stride())))+1)+' of '+cards.length};
 const move=(direction)=>track.scrollBy({left:direction*stride(),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 previous.onclick=()=>move(-1);next.onclick=()=>move(1);track.addEventListener('scroll',update,{passive:true});
 track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 window.ICGRailResize=update;window.addEventListener('resize',update);requestAnimationFrame(update);
}

function setupForm(form){
 if(form.dataset.initialized)return;form.dataset.initialized='true';
 let step=0;const kind=form.dataset.form,fields=q('.form-fields',form),result=q('.form-result',form),errorBox=q('.form-errors',form);
 const multiStep=!!q('[data-step]',form);
 const review=window.ICG_REVIEW ?? (document.documentElement.dataset.review!=='false');
 if(!review){const notice=q('.review-notice',form);if(notice)notice.hidden=true;const span=q('.submit-button span',form);if(span)span.textContent=(form.dataset.delivery||document.documentElement.dataset.delivery)==='email-app'?'Prepare Email Draft':kind==='referral'?'Send Referral':kind==='feedback'?'Send Feedback':'Send Enquiry';const hint=q('[data-step="2"]>.small',form);if(hint)hint.textContent='The team will review your referral and discuss the next step.';const p=q('[data-step="2"]>p',form);if(p)p.textContent='Check your information before sending your referral.';}
 const data=()=>Object.fromEntries(new FormData(form).entries());
 const setContact=()=>{const method=kind==='referral'?'email':q('[name=method]',form)?.value;['email','phone'].forEach(name=>{const input=q('[name='+name+']',form);if(input){input.required=method===name;const label=q('label[for="'+input.id+'"]',form);if(label)label.innerHTML=(name==='email'?(kind==='referral'?'Email':'Email address'):'Phone number')+(input.required?' <span aria-hidden="true">*</span>':' <span class="optional">(optional)</span>')}})};
 q('[name=method]',form)?.addEventListener('change',setContact);setContact();
 const clearErrors=()=>{errorBox.hidden=true;errorBox.replaceChildren();qa('.field-error',form).forEach(e=>e.textContent='');qa('[aria-invalid]',form).forEach(e=>e.removeAttribute('aria-invalid'))};
 const showErrors=(errors)=>{clearErrors();errorBox.hidden=false;errorBox.innerHTML='<strong>Please check the following:</strong><ul>'+Object.entries(errors).map(([name,message])=>`<li><a href="#${safe(q('[name="'+name+'"]',form)?.id||name)}">${safe(message)}</a></li>`).join('')+'</ul>';for(const [name,message] of Object.entries(errors)){const input=q('[name="'+name+'"]',form);if(input)input.setAttribute('aria-invalid','true');const target=q('#'+(input?.id||name)+'-error',form);if(target)target.textContent=message}errorBox.focus()};
 errorBox.onclick=e=>{const link=e.target.closest('a');if(link){e.preventDefault();q(link.getAttribute('href'),form)?.focus()}};
 const currentService=window.ICG_OFFLINE?new URLSearchParams(location.hash.split('?')[1]?.split('#')[0]||'').get('service'):new URLSearchParams(location.search).get('service');if(currentService){const option=q('select[name=service]',form);if(option&&[...option.options].some(x=>x.value===currentService))option.value=currentService}
 const summary=()=>{const d=data(),dl=q('.review-summary',form);const optionLabel=name=>q('[name='+name+'] option:checked',form)?.textContent;const rows=[['Referring',optionLabel('role')],['Your name',d.name],['Contact by',optionLabel('method')],['Email',d.email],['Phone',d.phone],...(d.role!=='self'?[['Participant',d.participant],['Relationship',d.relationship]]:[]),['Support',optionLabel('service')],['Suburb',d.suburb],['Overview',d.message]];dl.innerHTML=rows.filter(([,v])=>v).map(([label,value])=>'<div><dt>'+safe(label)+'</dt><dd>'+safe(value)+'</dd></div>').join('')};
 const go=(n)=>{step=n;clearErrors();qa('[data-step]',form).forEach(el=>el.hidden=Number(el.dataset.step)!==step);qa('.form-progress li').forEach((el,i)=>{if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current')});if(step===2)summary();const legend=q('[data-step="'+step+'"] legend',form);if(legend){legend.tabIndex=-1;legend.focus()}const other=q('[data-other-person]',form);if(other){const self=q('[name=role]',form).value==='self';other.hidden=self;qa('input',other).forEach(input=>{input.disabled=self;if(self)input.value=''})}};
 qa('[data-next]',form).forEach(button=>button.onclick=()=>{const v=validateForm(data(),step);if(!v.valid){showErrors(v.errors);return}go(step+1)});
 qa('[data-back]',form).forEach(button=>button.onclick=()=>go(Math.max(0,step-1)));
 q('[data-edit]',form)?.addEventListener('click',()=>go(0));
 form.addEventListener('keydown',e=>{if(multiStep&&step<2&&e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();q('[data-step="'+step+'"] [data-next]',form)?.click()}});
 form.addEventListener('reset',()=>{setTimeout(()=>{fields.hidden=false;result.hidden=true;clearErrors();setContact();if(multiStep)go(0);else q('[name=name]',form)?.focus()},0)});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(multiStep&&step<2){q('[data-step="'+step+'"] [data-next]',form)?.click();return}
  const value=data(),validation=validateForm(value);if(!validation.valid){if(multiStep){const first=Object.keys(validation.errors)[0];go(['name','email','phone','method','role'].includes(first)?0:first==='consent'?2:1)}showErrors(validation.errors);return}
  if(!review&&(form.dataset.delivery||document.documentElement.dataset.delivery)==='email-app'){
   const labels={kind:'Message type',name:'Name',method:'Preferred contact',email:'Email',phone:'Phone',suburb:'Suburb',service:'Support interest',feedbackType:'Feedback type',message:'Message'};
   const lines=Object.entries(labels).filter(([key])=>validation.data[key]).map(([key,label])=>label+': '+validation.data[key]);
   const draft='mailto:admin@icgservices.com.au?subject='+encodeURIComponent('I Care website '+kind)+'&body='+encodeURIComponent(lines.join('\n')+'\n\nContact request submitted by email.');
   result.innerHTML='<h3>Your email draft is ready.</h3><p>Open the draft in your email app, review it and press Send there. Your message has not been sent by this website.</p><p><a class="button primary" href="'+safe(draft)+'">Open Email Draft</a></p>'+(kind==='feedback'&&value.method==='none'?'<p>Sending by email shares your sender address. Call our team if you would like to discuss another way to give feedback.</p>':'')+'<p>If an email app does not open, email <a href="mailto:admin@icgservices.com.au">admin@icgservices.com.au</a> or call <a href="tel:+61435825566">0435 825 566</a>.</p><button class="button outline" type="reset">Edit your message</button>';
   fields.hidden=true;result.hidden=false;result.focus();return;
  }
  const button=q('.submit-button',form),label=button.innerHTML;button.disabled=true;button.textContent=review?'Checking…':'Sending…';clearErrors();
  try{
   let output;
   if(review){output={mode:'review',validated:true,delivered:false}}
   else{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);let response;try{response=await fetch('/api/forms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value),signal:controller.signal})}finally{clearTimeout(timer)}output=await response.json();if(!response.ok){if(output.errors){showErrors(output.errors);return}throw new Error(output.message||'Your message could not be sent. Please try again or call 0435 825 566.')}}
   const delivered=output.delivered===true;
   result.innerHTML='<h3>'+(delivered?'Thank you. Your message has been sent.':'Test complete. Nothing was sent.')+'</h3><p>'+(delivered?'Your '+safe(kind)+' has been accepted for delivery to I Care Group Services. Keep your reference: <strong>'+safe(output.reference)+'</strong>.':'The form checks passed. This review does not send or save your details. For real support, call <a href="tel:+61435825566">0435 825 566</a> or email <a href="mailto:admin@icgservices.com.au">admin@icgservices.com.au</a>.')+'</p><button class="button outline" type="reset">'+(delivered?'Start another message':'Try another test')+'</button>';
   fields.hidden=true;result.hidden=false;result.focus();
  }catch(error){errorBox.hidden=false;errorBox.textContent=error.name==='AbortError'?'We could not confirm delivery. Please call 0435 825 566 before trying again.':error.message||'Unable to send. Please contact the team by phone.';errorBox.focus()}
  finally{button.disabled=false;button.innerHTML=label}
 });
}
window.ICGSetup=setupPage;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupPage);else setupPage();
