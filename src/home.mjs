import {services, business as b} from './data.mjs';

// A distinctive homepage composition, within I Care's existing brand system.
export function renderHome({image, icon, btn, eyebrow, faqs, cta, serviceCard}) {
 const entryPoints = [
  {title:'I’m looking for support',copy:'Find practical support for your everyday life and the goals ahead.',href:'/services/',link:'Explore our services',photo:'creative.webp',alt:'Two adults sharing a creative activity',tone:'home'},
  {title:'I’m a family member or carer',copy:'Talk through the options with a team that takes time to listen.',href:'/contact/',link:'Talk with our team',photo:'about.webp',alt:'Two adults talking together indoors',tone:'community'},
  {title:'I’d like to make a referral',copy:'A simple first step for participants, families and support coordinators.',href:'/make-a-referral/',link:'Make a referral',photo:'planning.webp',alt:'Two adults discussing information at a table',tone:'skills'},
  {title:'I have a question',copy:'Clear answers about support, the NDIS and getting started.',href:'/faqs/',link:'Find helpful answers',photo:'family-support.webp',alt:'An adult using a wheelchair and a companion spending time outdoors',tone:'home'}
 ];
 const featured = ['personal-care','daily-tasks-shared-living','household-tasks','social-community-participation','independent-living-skills','travel-transport'].map(slug=>services.find(s=>s.slug===slug));
 const safeguards = [
  ['person','Your choices come first','Be part of the decisions about your support, with space for your goals and preferences.','/about-us/#our-promises','Our promises to you'],
  ['shield','Your dignity and privacy','Understand how your information is handled and where to find our policies.','/privacy-policies/','Privacy & policies'],
  ['heart','Your voice matters','Ask questions, share feedback or raise a concern. We make it easy to find the next step.','/feedback/','Feedback & complaints'],
  ['people','Respect for who you are','Your culture, identity and ways of communicating help shape the support you receive.','/about-us/#our-guiding-principles','Our guiding principles']
 ];
 return `<div class="home-v3">
 <section class="home-hero">
  <div class="wrap home-hero-grid">
   <div class="home-hero-copy">
    <a class="home-provider-pill" href="/ndis-information/">${icon('check')}Registered NDIS provider</a>
    ${eyebrow('NDIS support in Melbourne')}
    <h1>NDIS support,<br>shaped around<br><span>your life.</span></h1>
    <p>Person-centred NDIS support in Melbourne. From our Niddrie office, we help you explore everyday assistance, community connections and greater independence.</p>
    <div class="button-row">${btn('Contact Our Team','/contact/','home-primary')}${btn('Explore Our Services','/services/','home-outline')}</div>
    <div class="home-hero-assurance"><span>${icon('person')}Your choices</span><span>${icon('people')}Your community</span><span>${icon('pin')}Melbourne</span></div>
   </div>
   <div class="home-hero-visual">
    <div class="home-photo-frame">${image('hero.webp','A woman standing behind a man using a wheelchair on a leafy park path','home-hero-photo',true)}</div>
    <div class="home-photo-note">${icon('heart')}<span>More choice.<br><strong>More possibilities.</strong></span></div>
    <div class="home-hero-caption">Good support starts with you.</div>
   </div>
  </div>
 </section>

 <section class="section home-start" aria-labelledby="home-start-title">
  <div class="wrap">
   <div class="home-heading">${eyebrow('A good place to start')}<h2 id="home-start-title">How can we help you today?</h2><p>Wherever you are in your journey, there’s a simple next step.</p></div>
   <div class="home-entry-grid">${entryPoints.map(e=>`<a class="home-entry-card" data-support-tone="${e.tone}" href="${e.href}"><div class="home-entry-photo">${image(e.photo,e.alt,'home-entry-image')}</div><div class="home-entry-copy"><h3>${e.title}</h3><p>${e.copy}</p><span class="text-link">${e.link}${icon('arrow')}</span></div></a>`).join('')}</div>
  </div>
 </section>

 <section class="section home-services" aria-labelledby="home-services-title">
  <div class="wrap">
   <div class="section-heading"><div>${eyebrow('Support for your everyday')}<h2 id="home-services-title">Small steps.<br>A world of possibility.</h2></div><div><p>At home, in your community, or learning something new. Find support that fits your life.</p><a class="text-link" href="/services/">Explore all 11 services${icon('arrow')}</a></div></div>
   <div class="home-service-grid">${featured.map(s=>serviceCard(s,'home')).join('')}</div>
  </div>
 </section>

 <section class="section home-safeguards" aria-labelledby="home-quality-title">
  <div class="wrap home-quality-grid">
   <div class="home-quality-copy">
    ${eyebrow('Quality & safeguards')}
    <h2 id="home-quality-title">Feel safe.<br> Be heard.<br> Stay in control.</h2>
    <p>Good support is about more than getting things done. It means respect, clear communication and having a voice in the things that affect you.</p>
    <div class="home-policy-links"><a href="/feedback/">Feedback & complaints${icon('arrow')}</a><a href="/covid-19/#health-safety">Health & safety${icon('arrow')}</a></div>
    <a class="home-ndis-card" href="/ndis-information/"><img src="/assets/ndis-provider-logo.png" alt="NDIS" width="186" height="99" loading="lazy" decoding="async"><div><strong>Registered NDIS provider</strong><span>I Care Group Services</span><span class="text-link">Understand your NDIS options${icon('arrow')}</span></div></a>
   </div>
   <div class="home-safeguard-cards">${safeguards.map(([symbol,title,copy,href,label])=>`<article><span class="home-quality-icon">${icon(symbol)}</span><h3>${title}</h3><p>${copy}</p><a class="text-link" href="${href}">${label}${icon('arrow')}</a></article>`).join('')}</div>
  </div>
 </section>

 <section class="section home-getting-started" aria-labelledby="home-steps-title">
  <div class="wrap">
   <div class="home-heading">${eyebrow('Getting started')}<h2 id="home-steps-title">Let’s find your next step, together.</h2><p>No pressure to have it all worked out. Start with a conversation.</p></div>
   <div class="home-steps"><article><span>01</span><h3>Get in touch</h3><p>Call us, send an enquiry or make a referral. Tell us what you would like help with.</p></article><article><span>02</span><h3>Talk about your life</h3><p>We’ll discuss your goals, preferences, location and the support that may suit you.</p></article><article><span>03</span><h3>Choose your next step</h3><p>Ask questions and consider your options. Together, we can agree on a way forward.</p></article></div>
   <div class="center">${btn('Make a Referral','/make-a-referral/','outline')}<a class="home-start-phone" href="tel:${b.tel}">${icon('phone')}Or call ${b.phone}</a></div>
  </div>
 </section>

 <section class="section home-local cream" aria-labelledby="home-local-title"><div class="wrap split"><div>${eyebrow('Here in your community')}<h2 id="home-local-title">NDIS support in Melbourne.<br>Shaped around your life.</h2><p>Based at ${b.address}, our team welcomes enquiries from Niddrie and Melbourne.</p><p>Tell us your suburb and the support you are exploring. We’ll discuss what is suitable and available before you decide.</p>${btn('Explore Our Local Areas','/areas-we-serve/','outline')}</div><div class="local-contact-panel"><h3>Your local first step</h3><p>Explore <a href="/services/">our support services</a>, <a href="/make-a-referral/">make a referral</a> or contact the team.</p><a class="phone-link" href="tel:${b.tel}">${icon('phone')}${b.phone}</a><p><a href="mailto:${b.email}">${b.email}</a></p><p>${b.address}<br>${b.hours}</p></div></div></section>
 <section class="section home-faq-section" aria-labelledby="home-faq-title">
  <div class="wrap faq-grid"><div>${eyebrow('A few helpful answers')}<h2 id="home-faq-title">A little clarity.<br>A confident start.</h2><p>Questions are welcome. Here are some useful places to begin.</p><a class="text-link" href="/faqs/">Browse all FAQs${icon('arrow')}</a></div>${faqs()}</div>
 </section>
 ${cta()}
 </div>`;
}
