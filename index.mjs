import fetch from 'node-fetch';
import http from 'http';
import addCorsHeaders from './cors-headers.mjs';
import maintain from './modules/auto-maintain.mjs';
import {availReq,availRes} from './modules/availability.mjs';
import './modules/vercel-caches.mjs';

const hostTarget = 'en.m.wikipedia.org';
let hostList = [];
hostList.push(hostTarget);
let server = http.createServer(availReq(onRequest));

server.listen(3000);
maintain(server);

async function onRequest(req, res) {
  
  req.socket.setNoDelay();
  res.socket.setNoDelay();
  
  res=availRes(res);
  const hostProxy = req.headers['host'];


  if (req.url.indexOf('/ping') == 0) {
    res.statusCode = 200;
    return res.endAvail();
  }

  res = addCorsHeaders(res);
  req.url=removeHache(req.url);
  let path = req.url.replaceAll('*', '');
  let pat = path.split('?')[0].split('#')[0];

  if (pat == '/en-link-resolver.v.js') {

    let resp=await fetch('https://files-servleteer.vercel.app/lenguapedia/en'+req.url);
    let file = Buffer.from(await(resp).arrayBuffer());
    res.setHeader('Content-Type',resp.headers.get('Content-Type'));
    return res.endAvail(file);

  }
  if (pat == '/fetch-redirect.cjs') {

          let resp=await fetch('https://files-servleteer.vercel.app/lenguapedia/en'+req.url);
    let file = Buffer.from(await(resp).arrayBuffer());
    res.setHeader('Content-Type',resp.headers.get('Content-Type'));
    return res.endAvail(file);

  }
  if (pat == '/wiki.css') {


        let resp=await fetch('https://files-servleteer.vercel.app/lenguapedia/en'+req.url);
    if(req.url=='/'||req.url==''){req.url='/index.html';}
    let file = Buffer.from(await(resp).arrayBuffer());
  res.setHeader('Content-Type',resp.headers.get('Content-Type'));
    return res.endAvail(file);

  }


  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;


  /* start reading the body of the request*/
  let bdy = "";
  req.on('readable', function() {
    bdy += req.read();
  });
  req.on('end', async function() {
    /* finish reading the body of the request*/

    /* start copying over the other parts of the request */
    let options = {
      method: req.method,
      headers: req.headers
    };
    /* fetch throws an error if you send a body with a GET request even if it is empty */
    if ((req.method != 'GET') && (req.method != 'HEAD') && (bdy.length > 0)) {
      options = {
        method: req.method,
        headers: req.headers,
        body: bdy
      };
    }
    /* finish copying over the other parts of the request */

    /* fetch from your desired target */
    let response = await fetch('https://' + hostTarget + path, options);

    /* if there is a problem try redirecting to the original */
    if (response.status > 399) {
      res.setHeader('location', 'https://' + hostTarget + path);
      res.statusCode = 302;
      return res.endAvail();
    }


    /* copy over response headers  */

    for (let [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    for (let [key, value] of response.headers.keys()) {
      if (key.length > 1) {
        res.removeHeader(key);
        res.setHeader(key, value);
      }
    }
    res.removeHeader('content-encoding');

    /* for some reasone content-length header is really killing this. Might be because gzip length is too short */
    res.removeHeader('content-length');


    res = addCorsHeaders(res);

    /* check to see if the response is not a text format */
    let ct = response.headers.get('content-type');



  res.setHeader('content-type', ct);
   res.setHeader('Cloudflare-CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('Surrogate-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');

    if ((ct) && (!(ct.includes('image')&&(!ct.includes('svg')))) && (!ct.includes('video')) && (!ct.includes('audio'))) {


      /* Copy over target response and return */
      let resBody = await response.text();
      if (ct.toLowerCase().includes('javascript')) {
        let hostList_length = hostList.length;
        for (let i = 0; i < hostList_length; i++) {
          resBody = resBody.replaceAll('https://' + hostProxy, 'https://' + hostList[i]);
        }
        return res.endAvail(resBody);
      }
      let resNewBody = resBody.replace('<head>',
        `<head>
        <script src="https://`+ hostProxy + `/en-link-resolver.v.js" host-list="` + btoa(JSON.stringify(hostList)) + `"></script>
     <script src="https://`+ hostProxy + `/fetch-redirect.cjs"></script>  <link rel="stylsheet" href="/wiki.css">`);
      return res.endAvail(resNewBody);


    } else {
    let resBody = Buffer.from(await(response).arrayBuffer());
    res.setHeader('Content-Type',ct);
    return res.endAvail(resBody);


    }
  });


}
