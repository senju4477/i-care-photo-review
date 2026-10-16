import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import {pages} from '../src/templates.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const build=JSON.parse(await readFile(path.join(root,'build-info.json'),'utf8'));
const errors=[],titles=new Set(),descriptions=new Set(),htmls={};
for(const p of pages)htmls[p.path]=await readFile(path.join(dist,p.path.slice(1),'index.html'),'utf8');
for(const p of pages){
 const html=htmls[p.path],ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(p.path+': requires exactly one H1');
 if(new Set(ids).size!==ids.length)errors.push(p.path+': duplicate IDs');
 if(titles.has(p.title))errors.push(p.path+': duplicate title');titles.add(p.title);
 if(!html.includes('name="description"'))errors.push(p.path+': missing description');
 if(build.indexable&&!html.includes('content="index,follow'))errors.push(p.path+': production indexing disabled');
 if(!build.indexable&&!html.includes('content="noindex'))errors.push(p.path+': preview missing noindex');
 const description=html.match(/name="description" content="([^"]+)"/)?.[1];if(descriptions.has(description))errors.push(p.path+': duplicate description');descriptions.add(description);
 if(!html.includes('rel="canonical" href="'+build.origin+p.path+'"'))errors.push(p.path+': incorrect canonical');
 if(!build.review&&/Website review · forms in test mode|Check Test Enquiry/.test(html))errors.push(p.path+': stale test form text');
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const href=match[1];if(!href.startsWith('/')&&!href.startsWith('#'))continue;
  const u=new URL(href,'https://review.example'+p.path);
  if(u.pathname.startsWith('/assets/')){try{await access(path.join(dist,u.pathname))}catch{errors.push(p.path+': missing asset '+u.pathname)}}
  else{const target=htmls[u.pathname];if(!target){errors.push(p.path+': broken page '+href);continue}if(u.hash&&!target.includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'))errors.push(p.path+': broken anchor '+href)}
 }
 for(const img of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="/.test(img[0])||!(/\bwidth="/.test(img[0])&&/\bheight="/.test(img[0])))errors.push(p.path+': image missing alt or dimensions');
 const jsonld=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);if(jsonld){const graph=JSON.parse(jsonld[1])['@graph'];const local=graph?.find(x=>x['@type']==='LocalBusiness');if(local?.address?.streetAddress!=='384 Keilor Road'||local?.address?.addressLocality!=='Niddrie')errors.push(p.path+': incorrect local business address');if(!graph?.some(x=>x['@type']==='WebPage'||x['@type']==='ContactPage'||x['@type']==='FAQPage'||x['@type']==='AboutPage'))errors.push(p.path+': missing page schema')}else errors.push(p.path+': missing structured data');
 if(/AAAR Ability|24\/7|Preston|Starter Project/.test(html))errors.push(p.path+': stale source content');
}
// Runtime scripts are syntax-checked by Node separately from HTML validation.
for(const name of ['logo.svg','footer-logo.svg']){const sourceLogo=await readFile(path.join(root,'public/assets',name)),distLogo=await readFile(path.join(dist,'assets',name));if(!sourceLogo.equals(distLogo))errors.push('Built logo differs from source: '+name);}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Checked '+pages.length+' pages: internal routes, anchors, images, metadata, vector brand logos, local business schema, canonical URLs and correct indexing passed.');
