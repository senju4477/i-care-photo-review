import {DEFAULT_PREFERENCES,normalisePreferences,readPreferences,savePreferences} from './widget-utils.js';

function setupWidgets(){
  const root=document.querySelector('[data-icg-widgets]');
  if(!root||root.dataset.ready)return;
  root.dataset.ready='true';
  const html=document.documentElement,launcher=root.querySelector('[data-icg-contact-toggle]'),actions=root.querySelector('#icg-contact-actions');
  const panels={enquiry:root.querySelector('#icg-quick-enquiry'),accessibility:root.querySelector('#icg-accessibility')};
  const panelTriggers=new Map();
  let storage;
  try{storage=window.localStorage;}catch{storage=undefined;}
  let preferences=readPreferences(storage);

  const setContact=(open,{restore=false}={})=>{
    launcher.setAttribute('aria-expanded',String(open));
    actions.hidden=!open;
    launcher.querySelector('.icg-launcher-open').hidden=open;
    launcher.querySelector('.icg-launcher-close').hidden=!open;
    launcher.setAttribute('aria-label',open?'Close contact options':'Open contact options');
    if(restore)launcher.focus();
  };
  launcher.addEventListener('click',()=>setContact(launcher.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('pointerdown',event=>{
    if(!root.contains(event.target)&&launcher.getAttribute('aria-expanded')==='true')setContact(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&launcher.getAttribute('aria-expanded')==='true'&&!Object.values(panels).some(panel=>panel.open)){
      setContact(false,{restore:true});event.preventDefault();
    }
  });

  function openPanel(name,trigger){
    const panel=panels[name];if(!panel)return;
    for(const other of Object.values(panels))if(other.open)other.close();
    panelTriggers.set(panel,trigger);
    if(typeof panel.showModal!=='function'){
      window.location.assign(name==='enquiry'?'/contact/':'/accessibility/');return;
    }
    trigger.setAttribute('aria-expanded','true');
    panel.showModal();
    (panel.querySelector('[data-icg-close]')||panel).focus();
  }
  root.querySelectorAll('[data-icg-open]').forEach(button=>button.addEventListener('click',()=>openPanel(button.dataset.icgOpen,button)));
  for(const panel of Object.values(panels)){
    panel.querySelector('[data-icg-close]').addEventListener('click',()=>panel.close());
    panel.addEventListener('click',event=>{if(event.target===panel){const bounds=panel.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)panel.close();}});
    panel.addEventListener('close',()=>{
      const trigger=panelTriggers.get(panel);trigger?.setAttribute('aria-expanded','false');
      if(trigger&&trigger.isConnected)trigger.focus();
    });
  }

  const originalFonts=new Map();
  function restoreFonts(){
    for(const [element,value] of originalFonts)if(element.isConnected){if(value)element.style.fontSize=value;else element.style.removeProperty('font-size');}
    originalFonts.clear();
  }
  function resizeText(){
    restoreFonts();
    if(preferences.scale===100)return;
    const elements=new Set(document.querySelectorAll('input,textarea,select,button,summary'));
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;
      if(node.textContent.trim()&&parent?.namespaceURI==='http://www.w3.org/1999/xhtml'&&!parent.closest('script,style,noscript,template'))elements.add(parent);
    }
    const measurements=[...elements].filter(element=>element.isConnected).map(element=>[element,parseFloat(getComputedStyle(element).fontSize),element.style.fontSize]);
    for(const [element,size,original] of measurements)if(Number.isFinite(size)){
      originalFonts.set(element,original);element.style.fontSize=(Math.round(size*preferences.scale)/100)+'px';
    }
  }
  let resizeTimer;
  const queueTextResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resizeText,140);};
  window.addEventListener('resize',queueTextResize,{passive:true});
  const observer=new MutationObserver(()=>{if(preferences.scale!==100)queueTextResize();});
  observer.observe(document.body,{childList:true,subtree:true});

  function applyPreferences(){
    preferences=normalisePreferences(preferences);
    html.toggleAttribute('data-icg-large-text',preferences.scale>100);
    html.toggleAttribute('data-icg-high-contrast',preferences.contrast);
    html.toggleAttribute('data-icg-underline-links',preferences.underline);
    html.toggleAttribute('data-icg-reduce-motion',preferences.motion);
    root.querySelectorAll('[data-icg-preference]').forEach(button=>button.setAttribute('aria-pressed',String(preferences[button.dataset.icgPreference])));
    const output=root.querySelector('[data-icg-text-value]'),label=preferences.scale+'%';
    if(output.textContent!==label)output.textContent=label;
    root.querySelector('[data-icg-text="decrease"]').disabled=preferences.scale===100;
    root.querySelector('[data-icg-text="increase"]').disabled=preferences.scale===140;
    resizeText();savePreferences(storage,preferences);
  }
  root.querySelectorAll('[data-icg-preference]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.icgPreference;preferences[key]=!preferences[key];applyPreferences();
  }));
  root.querySelectorAll('[data-icg-text]').forEach(button=>button.addEventListener('click',()=>{
    preferences.scale+=button.dataset.icgText==='increase'?10:-10;applyPreferences();
  }));
  root.querySelector('[data-icg-reset]').addEventListener('click',()=>{preferences={...DEFAULT_PREFERENCES};applyPreferences();});
  applyPreferences();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupWidgets);else setupWidgets();
