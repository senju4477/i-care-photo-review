import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {brotliDecompressSync,gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHandler} from '../src/http.mjs';
import {siteConfig} from '../src/config.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const info=JSON.parse(await readFile(path.join(root,'../build-info.json'),'utf8'));
const handle=createHandler({root,env:{REVIEW_MODE:'false',SITE_INDEXABLE:String(info.indexable)}});
test('explicit production mode is independent of indexing and the separate review stays private by default',()=>{
 const production={REVIEW_MODE:'false',SITE_URL:'https://icgservices.com.au'};
 assert.deepEqual(siteConfig(production),{review:false,indexable:true,delivery:'email-app',origin:'https://icgservices.com.au'});
 assert.equal(siteConfig({...production,SITE_INDEXABLE:'false'}).review,false);
 assert.equal(siteConfig({REVIEW_MODE:'true'}).indexable,false);
 assert.equal(siteConfig({...production,RESEND_API_KEY:'dummy',FROM_EMAIL:'sender@example.com'}).delivery,'provider');
 assert.equal(siteConfig({}).review,true);
 assert.equal(siteConfig({}).indexable,false);
});
test('compressed responses decode to the actual page and have representation-specific validators',async()=>{
 const plain=await handle(new Request('https://example.test/'));
 const html=await plain.text();
 for(const [encoding,decode] of [['br',brotliDecompressSync],['gzip',gunzipSync]]){
  const response=await handle(new Request('https://example.test/',{headers:{'Accept-Encoding':encoding}}));
  assert.equal(response.headers.get('content-encoding'),encoding);
  assert.equal(decode(Buffer.from(await response.arrayBuffer())).toString(),html);
  assert.notEqual(response.headers.get('etag'),plain.headers.get('etag'));
 }
 const noCompression=await handle(new Request('https://example.test/',{headers:{'Accept-Encoding':'br;q=0,gzip;q=0'}}));
 assert.equal(noCompression.headers.get('content-encoding'),null);
});
test('versioned assets cache safely and unchanged requests return 304 without a body',async()=>{
 const html=await readFile(path.join(root,'index.html'),'utf8');
 const asset=html.match(/href="(\/assets\/style\.css\?v=[a-f0-9]+)"/)[1];
 const first=await handle(new Request('https://example.test'+asset));
 assert.match(first.headers.get('cache-control'),/immutable/);
 const cached=await handle(new Request('https://example.test'+asset,{headers:{'If-None-Match':first.headers.get('etag')}}));
 assert.equal(cached.status,304);assert.equal(await cached.text(),'');
 const unversioned=await handle(new Request('https://example.test/assets/style.css'));
 assert.match(unversioned.headers.get('cache-control'),/must-revalidate/);
 const head=await handle(new Request('https://example.test'+asset,{method:'HEAD'}));
 assert.equal(await head.text(),'');assert.ok(Number(head.headers.get('content-length'))>0);
});
test('Melbourne schema uses one real Niddrie address and 404 pages stay non-indexable',async()=>{
 const html=await readFile(path.join(root,'index.html'),'utf8');
 const graph=JSON.parse(html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const business=graph.find(x=>x['@type']==='LocalBusiness');
 assert.equal(business.address.streetAddress,'384 Keilor Road');assert.equal(business.address.addressLocality,'Niddrie');
 assert.equal(business.areaServed.length,1);assert.equal(business.areaServed[0].name,'Melbourne');
 assert.doesNotMatch(html,/western suburbs|Werribee|Point Cook/i);
 const missing=await handle(new Request('https://example.test/not-a-page/'));
 assert.equal(missing.status,404);assert.match(missing.headers.get('x-robots-tag'),/noindex/);
 const alias=await handle(new Request('https://example.test/about-us/index.html?source=test'));
 assert.equal(alias.status,301);assert.equal(alias.headers.get('location'),'/about-us/?source=test');
});
