import {business, services} from './data.mjs';
import {faqItems} from './faqs.mjs';

const metadata = {
  '/': ['NDIS Support Melbourne', 'Explore NDIS disability support across Melbourne. Contact I Care Group Services in Niddrie on 0435 825 566 to discuss your needs.'],
  '/about-us/': ['About Our Melbourne NDIS Support Team', 'Meet I Care Group Services, based in Niddrie, Melbourne. Learn about our person-centred approach, promises and disability support across Melbourne.'],
  '/services/': ['NDIS Services Melbourne', 'Explore personal care, household tasks, community participation and living skills in Melbourne. Ask our Niddrie team about availability.'],
  '/areas-we-serve/': ['NDIS Support in Melbourne', 'Discuss NDIS support in Melbourne. I Care Group Services is based in Niddrie.'],
  '/contact/': ['Contact Our Niddrie, Melbourne NDIS Team', 'Call 0435 825 566 or email admin@icgservices.com.au. Visit I Care Group Services at 384 Keilor Road, Niddrie VIC 3042 by arrangement.'],
  '/make-a-referral/': ['NDIS Referrals Melbourne', 'Refer yourself, a family member or a participant for disability support in Melbourne. Start with a short introduction to our Niddrie team.'],
  '/ndis-information/': ['NDIS Information for Melbourne Participants', 'Understand the next steps in exploring NDIS support in Melbourne. Find official resources and questions to ask I Care Group Services in Niddrie.'],
  '/faqs/': ['Melbourne NDIS Support FAQs', 'Find answers about disability support, referrals, funding and contacting I Care Group Services in Melbourne. Contact our Niddrie team to discuss your location and availability.']
};

export function pageMetadata(page) {
  const service = services.find(s => page.path === '/services/' + s.slug + '/');
  if (service) return {...page, title: service.short + ' Melbourne', description: `Explore ${service.short.toLowerCase()} with I Care Group Services in Melbourne. Contact our Niddrie team to discuss your needs and availability.`};
  const values = metadata[page.path];
  return values ? {...page, title: values[0], description: values[1]} : page;
}

export function structuredData(page, origin) {
  const businessId = origin + '/#business', websiteId = origin + '/#website';
  const areaServed = [{ '@type': 'City', name: 'Melbourne', containedInPlace: {'@type': 'State', name: 'Victoria'} }];
  const graph = [
    {'@type': 'LocalBusiness', '@id': businessId, name: business.name, url: origin + '/', telephone: business.tel, email: business.email,
      description: 'Disability support based in Niddrie, with enquiries welcome from Melbourne.',
      address: {'@type': 'PostalAddress', streetAddress: '384 Keilor Road', addressLocality: 'Niddrie', addressRegion: 'VIC', postalCode: '3042', addressCountry: 'AU'},
      areaServed, logo: origin + '/assets/logo.png', image: origin + '/assets/hero.webp', hasMap: business.directions,
      openingHoursSpecification: [{'@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '09:00', closes: '17:00'}]},
    {'@type': 'WebSite', '@id': websiteId, name: business.name, url: origin + '/', inLanguage: 'en-AU', publisher: {'@id': businessId}},
    {'@type': page.path === '/faqs/' ? 'FAQPage' : page.path === '/contact/' ? 'ContactPage' : page.path === '/about-us/' ? 'AboutPage' : 'WebPage',
      '@id': origin + page.path + '#webpage', url: origin + page.path, name: page.title, description: page.description, inLanguage: 'en-AU',
      isPartOf: {'@id': websiteId}, about: {'@id': businessId}, ...(page.path === '/faqs/' ? {mainEntity: faqItems.map(item => ({'@type': 'Question', name: item.question, acceptedAnswer: {'@type': 'Answer', text: item.answer}}))} : {})}
  ];
  if (page.path !== '/') {
    const crumbs = [{name: 'Home', item: origin + '/'}];
    if (page.path.startsWith('/services/')) crumbs.push({name: 'Our services', item: origin + '/services/'});
    crumbs.push({name: page.title, item: origin + page.path});
    graph.push({'@type': 'BreadcrumbList', itemListElement: crumbs.map((item, index) => ({'@type': 'ListItem', position: index + 1, ...item}))});
  }
  const service = services.find(s => page.path === '/services/' + s.slug + '/');
  if (service) graph.push({'@type': 'Service', '@id': origin + page.path + '#service', name: service.name, description: page.description, serviceType: service.short, url: origin + page.path, provider: {'@id': businessId}, areaServed});
  return {'@context': 'https://schema.org', '@graph': graph};
}
