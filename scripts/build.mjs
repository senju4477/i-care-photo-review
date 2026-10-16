import {mkdir,readFile,writeFile,cp,rm,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {brotliCompressSync,gzipSync,constants} from 'node:zlib';
import path from 'node:path';
import {pages as sourcePages,header,footer,notFound,esc} from '../src/templates.mjs';
import {redirects} from '../src/data.mjs';
import {siteConfig} from '../src/config.mjs';
import {pageMetadata,structuredData} from '../src/seo.mjs';
import {renderWidgets} from '../src/widgets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const {review,indexable,origin,delivery}=siteConfig();
const pages=sourcePages.map(pageMetadata);
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
await cp(path.join(root,'public'),dist,{recursive:true});
const revisions={};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,12);
for(const name of await readdir(path.join(dist,'assets')))revisions['/assets/'+name]=digest(await readFile(path.join(dist,'assets',name)));
// Version imported scripts and fonts as well as the page's direct resources.
const cssPath=path.join(dist,'assets/style.css');
let css=await readFile(cssPath,'utf8');
css=css.replace(/\.\/(poppins-[a-z]+\.woff)/g,(_,name)=>'./'+name+'?v='+revisions['/assets/'+name]);
await writeFile(cssPath,css);revisions['/assets/style.css']=digest(css);
const appPath=path.join(dist,'assets/app.js');
let app=await readFile(appPath,'utf8');
app=app.replace("'./validation.js'", "'./validation.js?v="+revisions['/assets/validation.js']+"'");
await writeFile(appPath,app);revisions['/assets/app.js']=digest(app);
const widgetsPath=path.join(dist,'assets/widgets.js');
const widgets=(await readFile(widgetsPath,'utf8')).replace("'./widget-utils.js'", "'./widget-utils.js?v="+revisions['/assets/widget-utils.js']+"'");
await writeFile(widgetsPath,widgets);revisions['/assets/widgets.js']=digest(widgets);
const asset=ref=>ref+(revisions[ref]?'?v='+revisions[ref]:'');
const versionAssets=html=>html.replace(/\/assets\/[a-zA-Z0-9._/-]+\.(?:png|svg|webp|woff|css|js)(?=["\s,])/g,asset);
function body(page){
 let html=header(page.path)+`<main id="main" tabindex="-1">${page.render()}</main>`+footer()+renderWidgets();
 if(!review){
  html=html.replace(/<span class="review-indicator">[\s\S]*?<\/span>/g,'').replace(/<div class="review-notice"[^>]*>[\s\S]*?<\/div>/g,'');
  html=html.replace(/(<form[^>]*data-form="([^"]+)"[^>]*>)/g,(_,tag)=>tag.replace(' novalidate',` data-delivery="${delivery}" novalidate`));
  html=html.replace(/(<button[^>]*class="button primary submit-button"[^>]*><span>)[\s\S]*?(<\/span>)/g,(_,before,after)=>before+(delivery==='email-app'?'Prepare Email Draft':'Send Message')+after);
  if(delivery==='email-app')html=html.replace(/<p class="small muted required-help">/g,'<p class="small email-draft-note">This prepares a draft in your email app. Review it and send it there. Your message is not sent by this website.</p><p class="small muted required-help">');
 }
 return versionAssets(html);
}
function document(page,{notFoundPage=false}={}){
 const content=body(page),allowIndex=indexable&&!notFoundPage;
 const eager=content.match(/<img\b[^>]*fetchpriority="high"[^>]*>/)?.[0];
 const preload=eager?`<link rel="preload" as="image" href="${eager.match(/\bsrc="([^"]+)"/)[1]}"${eager.includes('srcset=')?` imagesrcset="${eager.match(/srcset="([^"]+)"/)[1]}" imagesizes="${eager.match(/sizes="([^"]+)"/)[1]}"`:''} fetchpriority="high">`:'';
 return `<!doctype html><html lang="en-AU" data-review="${review}" data-delivery="${delivery}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.title)} | I Care Group Services</title><meta name="description" content="${esc(page.description)}"><meta name="robots" content="${allowIndex?'index,follow,max-image-preview:large':'noindex,follow'}"><meta name="theme-color" content="#1c605f"><link rel="canonical" href="${origin+page.path}"><link rel="icon" href="${asset('/assets/favicon.png')}" type="image/png"><meta property="og:site_name" content="I Care Group Services"><meta property="og:title" content="${esc(page.title)} | I Care Group Services"><meta property="og:description" content="${esc(page.description)}"><meta property="og:type" content="website"><meta property="og:url" content="${origin+page.path}"><meta property="og:image" content="${origin}/assets/hero.webp"><meta property="og:image:width" content="1440"><meta property="og:image:height" content="960"><meta property="og:image:alt" content="A woman standing behind a man using a wheelchair on a leafy park path"><meta property="og:locale" content="en_AU"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(page.title)} | I Care Group Services"><meta name="twitter:description" content="${esc(page.description)}"><meta name="twitter:image" content="${origin}/assets/hero.webp"><link rel="preload" href="${asset('/assets/poppins-regular.woff')}" as="font" type="font/woff" crossorigin>${preload}<link rel="stylesheet" href="${asset('/assets/style.css')}"><link rel="stylesheet" href="${asset('/assets/widgets.css')}"><script type="application/ld+json">${JSON.stringify(structuredData(page,origin)).replace(/</g,'\\u003c')}</script><script src="${asset('/assets/app.js')}" type="module"></script><script src="${asset('/assets/widgets.js')}" type="module"></script></head><body>${content}</body></html>`;
}
for(const page of pages){const target=path.join(dist,page.path.slice(1),'index.html');await mkdir(path.dirname(target),{recursive:true});await writeFile(target,document(page));}
await writeFile(path.join(dist,'404.html'),document({path:'/404/',title:'Page not found',description:'Find your way back to I Care Group Services in Melbourne.',render:notFound},{notFoundPage:true}));
await writeFile(path.join(dist,'robots.txt'),indexable?`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
await writeFile(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>`<url><loc>${origin+p.path}</loc></url>`).join('')+'</urlset>\n');
await writeFile(path.join(dist,'redirects.json'),JSON.stringify(redirects,null,2));
await writeFile(path.join(dist,'_redirects'),Object.entries(redirects).map(([a,b])=>`${a} ${b} 301`).join('\n')+'\n');
await writeFile(path.join(dist,'_headers'),`/assets/*\n  Cache-Control: public, max-age=0, must-revalidate\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${indexable?'':'  X-Robots-Tag: noindex, follow\n'}`);
await writeFile(path.join(dist,'.htaccess'),`Options -Indexes\nRewriteEngine On\n${Object.entries(redirects).map(([a,b])=>`RewriteRule ^${a.slice(1).replace(/\./g,'\\.')}\x24 ${b} [R=301,L,NE]`).join('\n')}\nErrorDocument 404 /404.html\n<IfModule mod_headers.c>\nHeader always set X-Content-Type-Options "nosniff"\nHeader always set Referrer-Policy "strict-origin-when-cross-origin"\n${indexable?'':'Header always set X-Robots-Tag "noindex, follow"'}\n</IfModule>\n`);
let textBytes=0,compressedBytes=0;
async function compress(directory){for(const item of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(item.isDirectory()){await compress(file);continue}if(!/\.(html|css|js|svg|xml|json|txt)$/.test(item.name))continue;const bytes=await readFile(file);if(bytes.length<800)continue;const br=brotliCompressSync(bytes,{params:{[constants.BROTLI_PARAM_QUALITY]:6}}),gz=gzipSync(bytes,{level:7});await writeFile(file+'.br',br);await writeFile(file+'.gz',gz);textBytes+=bytes.length;compressedBytes+=br.length;}}
await compress(dist);
await writeFile(path.join(root,'build-info.json'),JSON.stringify({pages:pages.length,review,indexable,delivery,origin,textBytes,compressedBytes,paths:pages.map(p=>p.path)},null,2)+'\n');
console.log(`Built ${pages.length} complete pages, 404, sitemap, redirects and compressed assets. Review: ${review}; indexable: ${indexable}; forms: ${delivery}. Text assets: ${textBytes} → ${compressedBytes} bytes with Brotli.`);
