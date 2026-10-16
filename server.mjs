import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHandler} from './src/http.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const handle=createHandler({root});
const server=http.createServer(async(req,res)=>{
 try{
  const chunks=[];let length=0;
  for await(const chunk of req){length+=chunk.length;if(length>16000&&req.url.startsWith('/api/')){res.writeHead(413,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({message:'Request too large.'}));return}chunks.push(chunk)}
  const scheme=req.headers['x-forwarded-proto']==='https'?'https':'http';
  const request=new Request(scheme+'://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await handle(request,req.socket.remoteAddress||'unknown');
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500,{'Content-Type':'text/plain'});res.end('Something went wrong. Please contact I Care Group Services on 0435 825 566.')}
});
server.requestTimeout=20000;server.headersTimeout=15000;
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('I Care Group Services website is ready.'));
