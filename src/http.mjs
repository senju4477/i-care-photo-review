import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {validateForm} from '../public/assets/validation.js';
import {redirects,business} from './data.mjs';
import {siteConfig} from './config.mjs';
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const baseHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'"};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{...baseHeaders,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
export function createHandler({root,env=process.env,send=fetch,now=Date.now}={}){
 const requests=new Map();
 return async function handle(request,client='local'){
  const url=new URL(request.url),{review,indexable}=siteConfig(env);
  if(url.pathname==='/api/forms'){
   if(request.method!=='POST')return json({message:'Use POST.'},405,{'Allow':'POST'});
   const origin=request.headers.get('origin');
   if(!origin||!([url.origin,env.SITE_URL?.replace(/\/$/,'')].filter(Boolean).includes(origin)))return json({message:'The request origin was not accepted.'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({message:'Use JSON.'},415);
   if(Number(request.headers.get('content-length')||0)>16000)return json({message:'This request is too large.'},413);
   const time=now();for(const [key,v] of requests)if(v.until<time)requests.delete(key);
   const counter=requests.get(client)||{count:0,until:time+60000};counter.count++;requests.set(client,counter);
   if(counter.count>5)return json({message:'Please wait a minute before trying again, or call the team.'},429,{'Retry-After':'60'});
   let raw;try{const body=await request.text();if(body.length>16000)return json({message:'This request is too large.'},413);raw=JSON.parse(body)}catch{return json({message:'We could not read the form.'},400)}
   if(!raw||typeof raw!=='object'||Array.isArray(raw))return json({message:'Invalid form.'},400);
   const {valid,errors,data}=validateForm(raw);if(!valid)return json({errors},422);
   if(review)return json({mode:'review',validated:true,delivered:false});
   if(!env.RESEND_API_KEY||!env.FROM_EMAIL)return json({message:'The online form is not connected yet. Please call 0435 825 566 or email admin@icgservices.com.au.'},503);
   const reference=randomUUID(),labels={kind:'Message type',name:'Contact name',method:'Preferred contact method',email:'Email',phone:'Phone',role:'Referrer role',participant:'Participant first name',relationship:'Relationship or organisation',suburb:'Suburb',service:'Support interest',feedbackType:'Feedback type',message:'Message'};
   const text='Website message reference: '+reference+'\n\n'+Object.entries(labels).filter(([k])=>data[k]).map(([k,label])=>label+': '+data[k]).join('\n')+(data.kind==='referral'?'\n\nCollection notice displayed with the referral submission. Referrer advised to obtain permission when referring another person.\n':'\n\nConsent: confirmed in website form.\n');
   try{
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);let response;
    try{response=await send('https://api.resend.com/emails',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':reference},body:JSON.stringify({from:env.FROM_EMAIL,to:[env.BUSINESS_EMAIL||business.email],subject:'I Care website '+data.kind+' — '+reference.slice(0,8),...(data.email?{reply_to:data.email}:{}),text})})}finally{clearTimeout(timeout)}
    if(!response.ok)return json({message:'Your message could not be accepted for delivery. Please call 0435 825 566.'},502);
    const receipt=await response.json();if(!receipt.id)return json({message:'We could not confirm delivery. Please call 0435 825 566.'},502);
    return json({delivered:true,reference},200);
   }catch{return json({message:'We could not confirm delivery. Please call 0435 825 566 before trying again.'},502)}
  }
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{...baseHeaders,Allow:'GET, HEAD'}});
  if(url.pathname.endsWith('/index.html')&&url.pathname!=='/index.html')return new Response(null,{status:301,headers:{...baseHeaders,Location:url.pathname.slice(0,-10)+url.search}});
  if(redirects[url.pathname])return new Response(null,{status:301,headers:{...baseHeaders,Location:redirects[url.pathname]+(redirects[url.pathname].includes('#')?'':url.search)}});
  let decoded;try{decoded=decodeURIComponent(url.pathname)}catch{return new Response('Bad request',{status:400})}
  if(decoded.includes('\0')||decoded.includes('\\')||decoded.split('/').some(x=>x==='..'||x.startsWith('.')))return new Response('Not found',{status:404,headers:baseHeaders});
  let filename=path.resolve(root,'.'+decoded);if(filename!==root&&!filename.startsWith(root+path.sep))return new Response('Not found',{status:404});
  let status=200;
  try{const info=await stat(filename);if(info.isDirectory()){if(!url.pathname.endsWith('/'))return new Response(null,{status:301,headers:{...baseHeaders,Location:url.pathname+'/'+url.search}});filename=path.join(filename,'index.html')}}catch{filename=path.join(root,'404.html');status=404}
  const accepts=request.headers.get('accept-encoding')||'';
  const encodings=Object.fromEntries(accepts.toLowerCase().split(',').map(item=>{const [name,...params]=item.trim().split(';');const quality=params.find(x=>x.trim().startsWith('q='));return [name,quality?Number(quality.trim().slice(2)):1]}));
  let encoding;
  if((encodings.br||0)>0){try{await stat(filename+'.br');encoding='br'}catch{}}
  if(!encoding&&(encodings.gzip||0)>0){try{await stat(filename+'.gz');encoding='gzip'}catch{}}
  let bytes,info;const representation=filename+(encoding==='br'?'.br':encoding==='gzip'?'.gz':'');
  try{[bytes,info]=await Promise.all([readFile(representation),stat(representation)])}catch{return new Response('Not found',{status:404,headers:baseHeaders})}
  const versioned=url.pathname.startsWith('/assets/')&&/^[a-f0-9]{12}$/.test(url.searchParams.get('v')||'');
  const etag='W/"'+info.size.toString(16)+'-'+Math.trunc(info.mtimeMs).toString(16)+'-'+(encoding||'identity')+'"';
  const headers={...baseHeaders,'Content-Type':MIME[path.extname(filename)]||'application/octet-stream','Cache-Control':status===404?'no-store':versioned?'public, max-age=31536000, immutable':filename.endsWith('.html')?'no-cache':'public, max-age=0, must-revalidate','ETag':etag,'Vary':'Accept-Encoding','Content-Length':String(bytes.length),...(encoding?{'Content-Encoding':encoding}:{})};
  if(!indexable||status===404)headers['X-Robots-Tag']='noindex, follow';
  if(status===200&&request.headers.get('if-none-match')?.split(',').map(x=>x.trim()).includes(etag))return new Response(null,{status:304,headers});
  return new Response(request.method==='HEAD'?null:bytes,{status,headers});
 };
}
