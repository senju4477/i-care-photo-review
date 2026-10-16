import {business} from './data.mjs';

const escape=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
  contact:'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z',
  close:'m6 6 12 12M6 18 18 6',
  phone:'M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-7-7l2-2-2-5Z',
  pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  form:'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6ZM14 3v6h6M8 13h8M8 17h5',
  accessibility:'M14 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3 8l9 2 9-2M12 10v5m0 0-5 7m5-7 5 7',
  whatsapp:'M13.601 2.326A7.854 7.854 0 0 0 7.988 0C3.62 0 .068 3.552 .064 7.917c0 1.399.365 2.76 1.057 3.965L0 16l4.204-1.102a7.93 7.93 0 0 0 3.787.964h.004c4.364 0 7.916-3.552 7.92-7.917a7.9 7.9 0 0 0-2.314-5.619zM7.995 14.525a6.573 6.573 0 0 1-3.354-.918l-.24-.144-2.494.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.517c0-3.626 2.957-6.583 6.588-6.583a6.522 6.522 0 0 1 4.66 1.931 6.539 6.539 0 0 1 1.928 4.66c-.004 3.645-2.96 6.6-6.591 6.6zm3.615-4.942c-.197-.099-1.17-.578-1.352-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.197-.011-.304.087-.403.088-.087.198-.232.297-.346.099-.114.133-.198.197-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.728.728 0 0 0-.529.247c-.182.198-.692.677-.692 1.654s.711 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.327 1.129.418.475.152.908.13 1.25.08.38-.057 1.17-.48 1.337-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z'
};
// WhatsApp glyph: Bootstrap Icons (MIT); see THIRD-PARTY-NOTICES.md.
const icon=name=>name==='whatsapp'?`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="${paths.whatsapp}"/></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;

export function whatsappUrl(number=''){
  const digits=String(number).replace(/[+\s().-]/g,'');
  if(!/^[1-9]\d{7,14}$/.test(digits))return '';
  return 'https://wa.me/'+digits;
}

export function renderWidgets({whatsappNumber=process.env.WHATSAPP_NUMBER??business.whatsapp??''}={}){
  const whatsapp=whatsappUrl(whatsappNumber);
  return `<div class="icg-widgets" data-icg-widgets>
  <div class="icg-contact-dock">
    <nav class="icg-contact-actions" id="icg-contact-actions" aria-label="Quick contact options" hidden>
      ${whatsapp?`<a class="icg-contact-action icg-action-whatsapp" href="${escape(whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="Chat with I Care Group Services on WhatsApp (opens a new tab)">${icon('whatsapp')}</a>`:''}
      <button class="icg-contact-action icg-action-form" type="button" data-icg-open="enquiry" aria-haspopup="dialog" aria-controls="icg-quick-enquiry" aria-label="Open the quick enquiry form">${icon('form')}</button>
      <a class="icg-contact-action icg-action-map" href="${escape(business.directions)}" target="_blank" rel="noopener noreferrer" aria-label="Open Google Maps for ${escape(business.address)} (opens a new tab)">${icon('pin')}</a>
      <a class="icg-contact-action icg-action-phone" href="tel:${business.tel}" aria-label="Call I Care Group Services on ${business.phone}">${icon('phone')}</a>
    </nav>
    <button class="icg-contact-launcher" type="button" data-icg-contact-toggle aria-expanded="false" aria-controls="icg-contact-actions"><span class="icg-launcher-open">${icon('contact')}</span><span class="icg-launcher-close" hidden>${icon('close')}</span><span>Contact</span></button>
  </div>
  <button class="icg-access-launcher" type="button" data-icg-open="accessibility" aria-haspopup="dialog" aria-controls="icg-accessibility" aria-expanded="false">${icon('accessibility')}<span class="icg-access-label">Accessibility</span></button>
  <dialog class="icg-widget-panel" id="icg-quick-enquiry" aria-labelledby="icg-enquiry-heading" aria-describedby="icg-enquiry-intro">
    <div class="icg-panel-heading"><div><p class="icg-panel-eyebrow">A simple first step</p><h2 id="icg-enquiry-heading">Quick enquiry</h2></div><button class="icg-panel-close" type="button" data-icg-close aria-label="Close quick enquiry">${icon('close')}</button></div>
    <p id="icg-enquiry-intro">Ask for a call or a time to talk. Our team will discuss availability; an enquiry does not confirm an appointment.</p>
    <form class="contact-form icg-quick-form" data-form="enquiry" novalidate>
      <div class="review-notice" role="note"><strong>Website review — test form</strong><span>Use sample details only. This review does not send a message.</span></div>
      <div class="form-errors" role="alert" tabindex="-1" hidden></div><div class="form-result" role="status" tabindex="-1" hidden></div>
      <div class="form-fields">
        <input type="hidden" name="kind" value="enquiry"><input type="hidden" name="method" value="phone"><input type="hidden" name="service" value="unsure">
        <div class="honey" aria-hidden="true"><label for="icg-quick-website">Leave this empty</label><input id="icg-quick-website" name="website" tabindex="-1" autocomplete="off"></div>
        <div class="field"><label for="icg-quick-name">Your name <span aria-hidden="true">*</span></label><input id="icg-quick-name" name="name" type="text" required autocomplete="name" maxlength="120" aria-describedby="icg-quick-name-error"><span class="field-error" id="icg-quick-name-error"></span></div>
        <div class="field"><label for="icg-quick-phone">Phone number <span aria-hidden="true">*</span></label><input id="icg-quick-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" maxlength="30" aria-describedby="icg-quick-phone-error"><span class="field-error" id="icg-quick-phone-error"></span></div>
        <div class="field"><label for="icg-quick-message">How can we help? <span class="optional">(optional)</span></label><textarea id="icg-quick-message" name="message" rows="3" maxlength="2000" aria-describedby="icg-quick-message-hint icg-quick-message-error"></textarea><small id="icg-quick-message-hint">Please leave out NDIS numbers and medical or plan documents.</small><span class="field-error" id="icg-quick-message-error"></span></div>
        <div class="field"><label class="checkbox-label" for="icg-quick-consent"><input id="icg-quick-consent" name="consent" type="checkbox" required aria-describedby="icg-quick-consent-error"><span>I have read the <a href="/privacy-policies/">privacy information</a> and agree to being contacted about this enquiry. *</span></label><span class="field-error" id="icg-quick-consent-error"></span></div>
        <button class="button primary submit-button" type="submit"><span>Prepare Email Draft</span></button><p class="small muted required-help">Fields marked * are required. Prefer to call? <a href="tel:${business.tel}">${business.phone}</a>.</p>
      </div>
    </form>
  </dialog>
  <dialog class="icg-widget-panel icg-access-panel" id="icg-accessibility" aria-labelledby="icg-access-heading">
    <div class="icg-panel-heading"><div><p class="icg-panel-eyebrow">Make yourself comfortable</p><h2 id="icg-access-heading">Accessibility options</h2></div><button class="icg-panel-close" type="button" data-icg-close aria-label="Close accessibility options">${icon('close')}</button></div>
    <p>Choose the display settings that work for you. Your choices are remembered on this device.</p>
    <div class="icg-text-controls" role="group" aria-label="Text size"><span>Text size</span><div><button type="button" data-icg-text="decrease" aria-label="Decrease text size">A−</button><output data-icg-text-value aria-live="polite">100%</output><button type="button" data-icg-text="increase" aria-label="Increase text size">A+</button></div></div>
    <button class="icg-preference" type="button" data-icg-preference="contrast" aria-pressed="false"><span>High contrast</span><span class="icg-toggle-mark" aria-hidden="true"></span></button>
    <button class="icg-preference" type="button" data-icg-preference="underline" aria-pressed="false"><span>Underline links</span><span class="icg-toggle-mark" aria-hidden="true"></span></button>
    <button class="icg-preference" type="button" data-icg-preference="motion" aria-pressed="false"><span>Reduce motion</span><span class="icg-toggle-mark" aria-hidden="true"></span></button>
    <button class="icg-reset-preferences" type="button" data-icg-reset>Reset display settings</button>
    <p class="icg-access-help">Need information another way? <a href="/accessibility/">Accessibility information</a> or <a href="tel:${business.tel}">call our team</a>.</p>
  </dialog>
  </div>`;
}
