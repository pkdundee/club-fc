// Club FC campus art (Phase 1): portrait full-screen campus, drawn from the career save. Buildings change a little every level, with bigger stage changes every 6 levels.
// World: x runs down-right, y down-left, z up. Draw back (small x+y) to front.
(function(){
let C1='#1e3a8a',C2='#f97316';const GOLD='#fbbf24';
const sh=(hex,f)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const m=v=>Math.round(f<0?v*(1+f):v+(255-v)*f);return `rgb(${m(r)},${m(g)},${m(b)})`};
const stageOf=l=>l>=30?6:Math.min(5,Math.ceil(l/6)); // 1..5, 6 = gold
const EDGE='stroke="rgba(0,0,0,.2)" stroke-width=".4" stroke-linejoin="round"';

function iso(K,OX,OY){
 const P=(x,y,z=0)=>[OX+(x-y)*K,OY+(x+y)*K/2-z*K];
 const pts=a=>a.map(p=>P(...p).map(n=>n.toFixed(1)).join(',')).join(' ');
 const poly=(a,f,x='')=>`<polygon points="${pts(a)}" fill="${f}" ${x}/>`;
 const line=(a,b,s,w=1,x='')=>{const p=P(...a),q=P(...b);return `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${s}" stroke-width="${w*K}" ${x}/>`};
 const box=(x,y,z,w,d,h,c)=>{const t=z+h,top=c.top||sh(c.base,.2),L=c.L||sh(c.base,-.2),R=c.R||c.base;
  return poly([[x,y,t],[x+w,y,t],[x+w,y+d,t],[x,y+d,t]],top,EDGE)+poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,t],[x,y+d,t]],L,EDGE)+poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,t],[x+w,y,t]],R,EDGE)};
 const shadow=(x,y,w,d,h)=>{const s=h*.5;const m=p=>[p[0]-s,p[1]+s,0];const A=[x,y,0],B=[x+w,y,0],Cc=[x+w,y+d,0],D=[x,y+d,0];return poly([A,B,Cc,m(Cc),m(D),m(A)],'rgba(16,40,20,.28)','filter="url(#blur4)"')};
 const winL=(x0,x1,Y,z0,z1,cols,rows,litN)=>{let s='',k=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++,k++){const u0=x0+(x1-x0)*(i+.22)/cols,u1=x0+(x1-x0)*(i+.78)/cols,v0=z0+(z1-z0)*(j+.25)/rows,v1=z0+(z1-z0)*(j+.75)/rows;
   s+=poly([[u0,Y,v0],[u1,Y,v0],[u1,Y,v1],[u0,Y,v1]],(k*7)%cols+j<litN?'url(#lit4)':'url(#glass4)')}return s};
 const winR=(X,y0,y1,z0,z1,cols,rows,litN)=>{let s='',k=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++,k++){const u0=y0+(y1-y0)*(i+.22)/cols,u1=y0+(y1-y0)*(i+.78)/cols,v0=z0+(z1-z0)*(j+.25)/rows,v1=z0+(z1-z0)*(j+.75)/rows;
   s+=poly([[X,u0,v0],[X,u1,v0],[X,u1,v1],[X,u0,v1]],(k*5)%cols+j<litN-1?'url(#lit4)':'url(#glassR4)')}return s};
 const gable=(x,y,z,w,d,rh,col,wall)=>{const yr=y+d/2,o=1.5;return poly([[x-o,y-o,z],[x+w+o,y-o,z],[x+w+o,yr,z+rh],[x-o,yr,z+rh]],sh(col,.15),EDGE)+poly([[x+w,y,z],[x+w,y+d,z],[x+w,yr,z+rh]],wall,EDGE)+poly([[x-o,y+d+o,z],[x+w+o,y+d+o,z],[x+w+o,yr,z+rh],[x-o,yr,z+rh]],col,EDGE)};
 const pyramid=(x,y,z,w,d,h,col)=>{const a=[x+w/2,y+d/2,z+h];return poly([[x,y+d,z],[x+w,y+d,z],a],sh(col,-.12),EDGE)+poly([[x+w,y,z],[x+w,y+d,z],a],col,EDGE)};
 const tree=(x,y,s,c)=>{const [tx,ty]=P(x,y,0),[fx,fy]=P(x,y,8*s);const r=K*s;
  return `<ellipse cx="${tx-4*r}" cy="${ty+1}" rx="${6*r}" ry="${2.4*r}" fill="rgba(16,40,20,.3)"/><rect x="${tx-.8*r}" y="${fy}" width="${1.6*r}" height="${ty-fy}" fill="#6b3f1d"/>
  <circle cx="${fx-2.2*r}" cy="${fy+1.2*r}" r="${3.8*r}" fill="${sh(c,-.15)}"/><circle cx="${fx+2*r}" cy="${fy+.8*r}" r="${3.6*r}" fill="${c}"/><circle cx="${fx}" cy="${fy-2*r}" r="${4*r}" fill="${c}"/><circle cx="${fx+1.3*r}" cy="${fy-3*r}" r="${2*r}" fill="${sh(c,.35)}" opacity=".85"/>`};
 const person=(x,y,c)=>{const [px,py]=P(x,y,0);const r=K;return `<rect x="${px-1*r}" y="${py-4.6*r}" width="${2*r}" height="${3.8*r}" rx="${.9*r}" fill="${c}"/><circle cx="${px}" cy="${py-5.7*r}" r="${1.1*r}" fill="#e8b796"/>`};
 const flag=(x,y,z,h,c)=>{const [fx,fy]=P(x,y,z);return `<line x1="${fx}" y1="${fy}" x2="${fx}" y2="${fy-h*K}" stroke="#64748b" stroke-width="${.8*K}"/><path d="M${fx} ${fy-h*K} l${8*K} ${2*K} l${-8*K} ${2.5*K}z" fill="${c}"/>`};
 const lamp=(x,y)=>{const [lx,ly]=P(x,y,0);return `<line x1="${lx}" y1="${ly}" x2="${lx}" y2="${ly-9*K}" stroke="#334155" stroke-width="${.6*K}"/><circle cx="${lx}" cy="${ly-9.4*K}" r="${1.2*K}" fill="#fff7c2"/>`};
 const planter=(x,y)=>box(x,y,0,3,3,1.4,{base:'#a8a29e'})+(()=>{const [px,py]=P(x+1.5,y+1.5,2.4);return `<circle cx="${px}" cy="${py}" r="${1.8*K}" fill="#4ade80"/><circle cx="${px+.6*K}" cy="${py-.6*K}" r="${.8*K}" fill="${C2}"/>`})();
 const bench=(x,y)=>box(x,y,0,6,1.6,1.2,{base:'#92400e'})+box(x,y,1.2,6,.5,1.6,{base:'#a16207'});
 return {K,P,poly,line,box,shadow,winL,winR,gable,pyramid,tree,person,flag,lamp,planter,bench};
}

const DEFS=`<defs>
 <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1"/></filter>
 <filter id="glow4"><feGaussianBlur stdDeviation="2.4"/></filter>
 <linearGradient id="glass4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4ecff"/><stop offset=".5" stop-color="#86bde8"/><stop offset="1" stop-color="#3f72a8"/></linearGradient>
 <linearGradient id="glassR4" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f4ff"/><stop offset=".55" stop-color="#a3cff1"/><stop offset="1" stop-color="#5d91c5"/></linearGradient>
 <linearGradient id="lit4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7cc"/><stop offset="1" stop-color="#fcd34d"/></linearGradient>
 <linearGradient id="gold4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b7791f"/></linearGradient>
 <pattern id="brL4" width="5" height="3.4" patternUnits="userSpaceOnUse" patternTransform="skewY(26.565)"><rect width="5" height="3.4" fill="#b5523a"/><path d="M0 .2H5M0 1.9H5M1.2 .2V1.9M3.7 1.9V3.6" stroke="#8f3d2a" stroke-width=".35"/></pattern>
 <pattern id="brR4" width="5" height="3.4" patternUnits="userSpaceOnUse" patternTransform="skewY(-26.565)"><rect width="5" height="3.4" fill="#c9634a"/><path d="M0 .2H5M0 1.9H5M1.2 .2V1.9M3.7 1.9V3.6" stroke="#a04a35" stroke-width=".35"/></pattern>
 <pattern id="grass4" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#62c35a"/><circle cx="2" cy="3" r=".6" fill="#55b24f"/><circle cx="5.5" cy="5.5" r=".5" fill="#72d268"/></pattern>
 <pattern id="dirt4" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#c9a26b"/><circle cx="1.5" cy="2" r=".7" fill="#b48d58"/><circle cx="4.5" cy="4.5" r=".6" fill="#d9b67f"/></pattern>
 <pattern id="lockP4" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#8fa0ad"/><rect width="3" height="6" fill="#97a8b5"/></pattern>
</defs>`;

// ---------------- buildings (x,y = plot origin, S = plot size). Every level adds a detail; every 6 levels a bigger change ----------------
function brick(I,x,y,S,lvl,o){const s=stageOf(lvl),g=s===6,l6=(lvl-1)%6+1;let out='';
 const fl=Math.min(4,1+Math.floor((s-1)/1.4)),h=7.5*fl+lvl*.12;const w=S*Math.min(.78,.5+.01*lvl),d=S*Math.min(.6,.38+.008*lvl);const bx=x+(S-w)/2,by=y+(S-d)/2-2;
 const wall=o.wall||'brick';const top=g?'url(#gold4)':'#e5d9c6';
 const L=wall==='brick'?'url(#brL4)':wall==='white'?'#dfe6ee':'url(#glass4)',R=wall==='brick'?'url(#brR4)':wall==='white'?'#f8fafc':'url(#glassR4)';
 // front path and small per-level details
 out+=I.poly([[bx+w*.4,by+d,0],[bx+w*.6,by+d,0],[bx+w*.6,y+S,0],[bx+w*.4,y+S,0]],'#e7e2d6');
 out+=I.shadow(bx,by,w,d,h);
 if(s>=3){out+=I.box(bx-S*.12,by+d*.25,0,S*.12,d*.6,h*.6,{top:'#e5d9c6',L,R})+I.winL(bx-S*.12,bx,by+d*.85,0,h*.6,2,fl>1?2:1,l6)}
 out+=I.box(bx,by,0,w,d,h,{top,L,R});
 out+=I.winL(bx,bx+w,by+d,0,h,Math.max(2,Math.round(w/6.5)),fl,l6+s)+I.winR(bx+w,by,by+d,0,h,Math.max(2,Math.round(d/6.5)),fl,l6);
 if(s<3)out+=I.gable(bx,by,h,w,d,6+s,o.roof||'#334155',wall==='brick'?'#c9634a':'#eef2f7');
 else{out+=I.box(bx-.6,by-.6,h,w+1.2,d+1.2,1.2,{base:g?'#fbbf24':'#e7e5e4'});for(let k=0;k<Math.min(3,1+Math.floor(l6/2));k++)out+=I.box(bx+w*.12+k*w*.16,by+d*.2,h+1.2,w*.1,d*.3,2.6,{base:'#94a3b8'});
  if(s>=4)out+=I.box(bx+w*.6,by+d*.18,h+1.2,w*.32,d*.62,6,{top:'#dbeafe',L:'url(#glass4)',R:'url(#glassR4)'});}
 if(l6>=4||s>=2)out+=I.flag(bx+w+2,by+d+2,0,h+10,g?GOLD:C2);
 if(l6>=2)out+=I.planter(bx+1,by+d+3);
 if(l6>=3)out+=I.planter(bx+w-4,by+d+3);
 if(l6>=5)out+=I.bench(bx+w*.65,y+S-6);
 if(l6>=6||s>=2)out+=I.lamp(bx-2,y+S-4);
 if(s>=2||l6>=4){const [cx,cy]=I.P(bx+w*.25,by+d,h*.7);out+=`<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) skewY(26.565)"><rect x="${-2.4*I.K}" y="${-3*I.K}" width="${4.8*I.K}" height="${6*I.K}" fill="${C1}"/><rect x="${-2.4*I.K}" y="${1.6*I.K}" width="${4.8*I.K}" height="${1.4*I.K}" fill="${C2}"/></g>`}
 if(o.extra)out+=o.extra(bx,by,w,d,h,s);
 return out}
function hq(I,x,y,S,lvl){const s=stageOf(lvl),g=s===6,l6=(lvl-1)%6+1;let out='';const w=S*Math.min(.8,.6+.008*lvl),d=S*.5,h=10+2.4*s+lvl*.2;const bx=x+(S-w)/2,by=y+(S-d)/2-3;
 out+=I.poly([[bx+w*.42,by+d,0],[bx+w*.58,by+d,0],[bx+w*.58,y+S,0],[bx+w*.42,y+S,0]],'#e7e2d6');
 out+=I.shadow(bx,by,w,d,h+20);
 out+=I.box(bx,by,0,w,d,h,{top:'#e5d9c6',L:'url(#brL4)',R:'url(#brR4)'})+I.winL(bx,bx+w,by+d,0,h,6,s>=2?2:1,l6+2)+I.winR(bx+w,by,by+d,0,h,3,s>=2?2:1,l6);
 out+=I.gable(bx,by,h,w,d,9,g?'#b7791f':'#1e3a5f','#c9634a');
 if(l6>=3||s>=2){const cx=bx+w/2-6;out+=I.box(cx,by+d,0,12,4,1,{base:'#e7e5e4'});for(let i=0;i<4;i++)out+=I.box(cx+1+i*3.2,by+d+2.2,1,1.1,1.1,h-1,{base:'#f5f5f4'});
  out+=I.poly([[cx,by+d+4,h],[cx+12,by+d+4,h],[cx+6,by+d+4,h+6]],'#fafaf9',EDGE)}
 if(s>=2||l6>=5){const tx=bx+w/2-5,ty=by+d/2-5,th=h+6+2*s+(l6>=5?2:0);out+=I.box(tx,ty,h,10,10,th-h,{top:'#d6c7b0',L:'url(#brL4)',R:'url(#brR4)'})+I.pyramid(tx-.5,ty-.5,th,11,11,10,g?'#fbbf24':'#1e3a5f');
  const [cx,cy]=I.P(tx+5,ty+10,th-5);out+=`<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) skewY(26.565)"><circle r="${2.6*I.K}" fill="#fff" stroke="#334155" stroke-width=".6"/></g>`}
 out+=I.flag(bx+w+3,by+d+3,0,h+16,C1);
 if(l6>=2)out+=I.planter(bx+2,by+d+3);if(l6>=4)out+=I.planter(bx+w-5,by+d+3);if(l6>=6)out+=I.bench(bx+3,y+S-5);out+=I.lamp(bx+w+1,y+S-3);
 return out}
function stadium(I,x,y,S,lvl){const s=stageOf(lvl),g=s===6;let out='';const m=S*.14;const X0=x+m,X1=x+S-m,Y0=y+m+4,Y1=y+S-m;
 if(lvl>=13){out+=I.poly([[X0-4,Y0-4,0],[X1+4,Y0-4,0],[X1+4,Y1+4,0],[X0-4,Y1+4,0]],'#c2553a')}
 for(let i=0;i<8;i++){const a=X0+(X1-X0)*i/8,b=X0+(X1-X0)*(i+1)/8;out+=I.poly([[a,Y0,0],[b,Y0,0],[b,Y1,0],[a,Y1,0]],lvl<4?(i%2?'#5aa84f':'#64b257'):(i%2?'#3fa34d':'#4cb85a'))}
 const W=`stroke="#fff" stroke-width="${.7*I.K}" fill="none" ${lvl<3?'stroke-opacity=".55"':''}`;const mx=(X0+X1)/2,my=(Y0+Y1)/2;
 out+=I.poly([[X0+1.5,Y0+1.5,0],[X1-1.5,Y0+1.5,0],[X1-1.5,Y1-1.5,0],[X0+1.5,Y1-1.5,0]],'none',W)+I.line([mx,Y0+1.5,0],[mx,Y1-1.5,0],'#fff',.7);
 const circ=[];for(let a=0;a<360;a+=20)circ.push([mx+7*Math.cos(a*Math.PI/180),my+7*Math.sin(a*Math.PI/180),0]);out+=I.poly(circ,'none',W);
 for(const e of [0,1]){const xa=e?X1-1.5:X0+1.5,xb=e?X1-13:X0+13;out+=I.poly([[xa,my-12,0],[xb,my-12,0],[xb,my+12,0],[xa,my+12,0]],'none',W)}
 out+=I.box(X0-1.5,my-3,0,1.5,6,3,{top:'#fff',L:'rgba(255,255,255,.4)',R:'rgba(255,255,255,.8)'})+I.box(X1,my-3,0,1.5,6,3,{top:'#fff',L:'rgba(255,255,255,.4)',R:'rgba(255,255,255,.8)'});
 // benches/dugouts from Lv 2
 if(lvl>=2)for(const k of [-1,1])out+=I.box(mx+k*8-3,Y1+1,0,6,2,2.4,{base:k<0?C1:'#64748b'});
 const seat=k=>k%2?sh(C1,.35):sh(C1,.18);
 // back stand: grows in length every level, adds a row every 3 levels
 const len=Math.min(1,.32+.06*lvl)*(X1-X0-8),sx0=mx-len/2,rows=Math.min(6,1+Math.floor(lvl/3));
 for(let k=rows-1;k>=0;k--)out+=I.box(sx0,Y0-6-4*k,0,len,4,2.5+3*k,{top:lvl<6?(k%2?'#cbd5e1':'#e2e8f0'):seat(k),L:'#94a3b8',R:'#cbd5e1'});
 if(lvl>=9){const ry=Y0-6-4*rows-2,rh=3+3*rows+4;const n=Math.min(5,2+Math.floor((lvl-9)/4));for(let i=0;i<=n;i++)out+=I.box(sx0+1+i*(len-2)/n,ry+1,0,1,1,rh,{base:'#64748b'});out+=I.box(sx0-1,ry,rh,len+2,4*rows+6,1.6,{top:g?'url(#gold4)':C1,L:sh(C1,-.25),R:sh(C1,-.05)})}
 {let f='';const dens=Math.min(.92,.15+lvl*.04);for(let k=0;k<rows;k++)for(let i=0;i<14;i++){if(((i*37+k*17)%100)/100>dens)continue;const [px,py]=I.P(sx0+2+i*(len-4)/13,Y0-4-4*k,3+3*k+.6);f+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${.75*I.K}" fill="${['#fff',C2,'#fde68a',C1][(i+k)%4]}"/>`}out+=f}
 // end stand from Lv 7, rows grow
 if(lvl>=7){const r2=Math.min(4,1+Math.floor((lvl-7)/4)),el=Math.min(1,.5+.05*(lvl-7))*(Y1-Y0-16),ey=my-el/2;for(let k=r2-1;k>=0;k--)out+=I.box(X0-8-4*k,ey,0,4,el,2+2.6*k,{top:k%2?'#e2e8f0':'#cbd5e1',L:'#94a3b8',R:'#cbd5e1'});
  if(lvl>=20)out+=I.box(X0-8-4*r2,ey-1,2+2.6*r2+5,4*r2+2,el+2,1.4,{top:g?'url(#gold4)':C1,L:sh(C1,-.25),R:sh(C1,-.05)})}
 // floodlights: one more every 2 levels from Lv 3, up to 4
 const all=[[X0-5,Y0-5],[X1+3,Y1+3],[X1+3,Y0-5],[X0-5,Y1+3]];const nl=Math.min(4,Math.max(0,Math.floor((lvl-1)/2)));
 for(const [lx,ly] of all.slice(0,nl)){const H=22+lvl*.8;out+=I.box(lx,ly,0,1.1,1.1,H,{base:'#64748b'})+I.box(lx-2,ly-.6,H,5,2,4,{top:'#e2e8f0',L:'#fff7cc',R:'#94a3b8'});const [gx,gy]=I.P(lx,ly,H+2);out+=`<circle cx="${gx}" cy="${gy}" r="${5*I.K}" fill="#fff7c2" opacity=".5" filter="url(#glow4)" class="flood"/>`}
 if(lvl>=5){const sbw=Math.min(22,10+lvl*.6);out+=I.box(X1+6,my-sbw/2,14,2.5,sbw,6+lvl*.12,{top:'#334155',L:'#1f2937',R:'#111827'})+I.box(X1+6.5,my-sbw/2+2,0,1,1,14,{base:'#475569'})+I.box(X1+6.5,my+sbw/2-3,0,1,1,14,{base:'#475569'})}
 if(lvl>=4)out+=I.flag(X1+2,Y0-8,0,20,C2);
 [[mx-14,my-6],[mx-6,my+8],[mx+4,my-4],[mx+12,my+6],[mx-20,my+10]].forEach(([px,py],i)=>out+=I.person(px,py,i%2?'#16a34a':C1));
 return out}
function training(I,x,y,S,lvl){const l6=(lvl-1)%6+1,s=stageOf(lvl);let out='';const X0=x+5,X1=x+S-5,Y0=y+8,Y1=y+S-6;
 for(let i=0;i<6;i++){const a=X0+(X1-X0)*i/6,b=X0+(X1-X0)*(i+1)/6;out+=I.poly([[a,Y0,0],[b,Y0,0],[b,Y1,0],[a,Y1,0]],i%2?'#46a84f':'#55b85c')}
 out+=I.poly([[X0+1,Y0+1,0],[X1-1,Y0+1,0],[X1-1,Y1-1,0],[X0+1,Y1-1,0]],'none',`stroke="#fff" stroke-width="${.6*I.K}" fill="none"`);
 out+=I.box(X1-2,(Y0+Y1)/2-3,0,1.2,6,3,{top:'#fff',L:'rgba(255,255,255,.4)',R:'rgba(255,255,255,.8)'});
 if(lvl>=3)out+=I.box(X0+1,(Y0+Y1)/2-3,0,1.2,6,3,{top:'#fff',L:'rgba(255,255,255,.4)',R:'rgba(255,255,255,.8)'});
 for(let i=0;i<Math.min(8,2+lvl);i++){const [cx,cy]=I.P(X0+6+i*4,Y0+10+(i%2)*5,0);out+=`<path d="M${cx-1.4} ${cy} L${cx} ${cy-3.2} L${cx+1.4} ${cy}Z" fill="${C2}"/>`}
 out+=I.box(X0-1,Y0-5,0,10+lvl*.4,6,6+s,{top:'#e2e8f0',L:'#cbd5e1',R:'#f1f5f9'})+I.box(X0-1.5,Y0-5.5,6+s,11+lvl*.4,7,1,{base:C1});
 const nl=Math.min(4,Math.floor(lvl/3));[[X0-2,Y1+1],[X1+1,Y0-2],[X1+1,Y1+1],[X0-2,Y0+12]].slice(0,nl).forEach(([lx,ly])=>out+=I.box(lx,ly,0,1,1,22,{base:'#64748b'})+I.box(lx-1.5,ly-.5,22,4,1.6,3,{top:'#e2e8f0',L:'#fff7cc',R:'#94a3b8'}));
 if(l6>=4)out+=I.bench(X0+10,Y1+1);
 [[X0+18,Y0+20],[X0+28,Y0+14],[X0+24,Y0+28]].forEach(([px,py],i)=>out+=I.person(px,py,i%2?C2:C1));
 return out}
function skills(I,x,y,S,lvl){let out='';const X0=x+8,X1=x+S-8,Y0=y+8,Y1=y+S-8;
 out+=I.poly([[X0,Y0,0],[X1,Y0,0],[X1,Y1,0],[X0,Y1,0]],'#5fbf63')+I.poly([[X0+1,Y0+1,0],[X1-1,Y0+1,0],[X1-1,Y1-1,0],[X0+1,Y1-1,0]],'none',`stroke="#fff" stroke-width="${.5*I.K}" fill="none"`);
 for(let i=0;i<6;i++){const [cx,cy]=I.P(X0+5+i*4.5,Y0+12+(i%2)*4,0);out+=`<path d="M${cx-1.3} ${cy} L${cx} ${cy-3} L${cx+1.3} ${cy}Z" fill="${C2}"/>`}
 out+=I.box(X1-3,Y0+6,0,1.5,9,4,{top:'#fff',L:'rgba(255,255,255,.4)',R:'rgba(255,255,255,.8)'});
 const [bx,by]=I.P(X0+14,Y1-8,1);out+=`<circle cx="${bx}" cy="${by}" r="${1.4*I.K}" fill="#fff" stroke="#111" stroke-width=".4"/>`+I.person(X0+10,Y1-6,C1);
 return out}
function emptyPlot(I,x,y,S,name){const [sx,sy]=I.P(x+S/2,y+S/2,0);let out=I.poly([[x+4,y+4,0],[x+S-4,y+4,0],[x+S-4,y+S-4,0],[x+4,y+S-4,0]],'url(#dirt4)',`stroke="#fff" stroke-width="${.8*I.K}" stroke-dasharray="${3*I.K} ${2*I.K}"`);
 out+=I.box(x+S/2-1,y+S/2+4,0,1,1,10,{base:'#92400e'});const [px,py]=I.P(x+S/2,y+S/2+4,10);const k=I.K;
 out+=`<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${k})"><rect x="-13" y="-8" width="26" height="9" rx="1.5" fill="#fef3c7" stroke="#92400e" stroke-width=".6"/><text y="-1.5" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="5.4" fill="#92400e">FOR ${name.toUpperCase()}</text></g>`;
 out+=`<g transform="translate(${sx.toFixed(1)},${(sy-22*k).toFixed(1)}) scale(${k})"><g class="hammer"><circle r="7.5" fill="#16a34a" stroke="#fff" stroke-width="1.4"/><text y="3.2" text-anchor="middle" font-size="8.5">🔨</text></g></g>`;
 return out}
function lockedPlot(I,x,y,S,req){const [sx,sy]=I.P(x+S/2,y+S/2,0);let out=I.poly([[x+4,y+4,0],[x+S-4,y+4,0],[x+S-4,y+S-4,0],[x+4,y+S-4,0]],'url(#lockP4)',`stroke="#64748b" stroke-width="${.6*I.K}"`);
 out+=`<g transform="translate(${sx.toFixed(1)},${(sy-4).toFixed(1)}) scale(${I.K})"><rect x="-20" y="-8" width="40" height="16" rx="8" fill="rgba(15,23,42,.8)"/><text x="-14" y="3.2" font-size="7.5">🔒</text><text x="-4" y="2.8" font-family="Nunito" font-weight="900" font-size="5.8" fill="#fff">${req}</text></g>`;
 return out}
function construction(I,x,y,S,h){let s='';const x0=x+S*.2,x1=x+S*.8,Y=y+S*.72;for(let i=0;i<=6;i++)s+=I.line([x0+i*(x1-x0)/6,Y,0],[x0+i*(x1-x0)/6,Y,h+4],'#f59e0b',.7);for(let j=0;j<=3;j++)s+=I.line([x0,Y,j*(h+4)/3],[x1,Y,j*(h+4)/3],'#d97706',.7);
 s+=I.box(x+S-6,y+6,0,2,2,h+30,{base:'#f59e0b'});const [ax,ay]=I.P(x+S-5,y+7,h+31);const k=I.K;s+=`<g class="jib" style="transform-origin:${ax}px ${ay}px"><line x1="${ax-36*k}" y1="${ay+9*k}" x2="${ax+12*k}" y2="${ay-3*k}" stroke="#f59e0b" stroke-width="${1.6*k}"/><rect x="${ax+7*k}" y="${ay-5*k}" width="${6*k}" height="${4*k}" fill="#475569"/><line x1="${ax-26*k}" y1="${ay+6.5*k}" x2="${ax-26*k}" y2="${ay+24*k}" stroke="#334155" stroke-width=".5"/></g>`;
 return s}
function decor(I,x,y,S,kind){let out='';
 if(kind==='water'){const k=I.K;for(const [a,b] of [[18,18],[28,18],[18,28],[28,28]])out+=I.box(x+a,y+b,0,1.4,1.4,40,{base:'#94a3b8'});const [tx,ty]=I.P(x+24,y+24,40);const r=11*k;
  out+=`<rect x="${tx-r}" y="${ty-r*1.1}" width="${2*r}" height="${r*1.1}" fill="${C1}"/><ellipse cx="${tx}" cy="${ty}" rx="${r}" ry="${r*.42}" fill="${sh(C1,-.2)}"/><ellipse cx="${tx}" cy="${ty-r*1.1}" rx="${r}" ry="${r*.42}" fill="${sh(C1,.2)}"/><path d="M${tx-r} ${ty-r*1.1} Q${tx} ${ty-r*2.3} ${tx+r} ${ty-r*1.1}" fill="${sh(C1,.05)}"/><text x="${tx}" y="${ty-r*.3}" text-anchor="middle" font-family="Graduate,serif" font-size="${6*k}" fill="#fff">CFC</text>`;
  out+=I.tree(x+8,y+40,1.1,'#e8662a')+I.tree(x+40,y+8,1.1,'#f59e0b');}
 if(kind==='quad'){out+=I.poly([[x+6,y+6,0],[x+S-6,y+6,0],[x+S-6,y+S-6,0],[x+6,y+S-6,0]],'#7dd17a');out+=I.poly([[x+S/2-2,y+4,0],[x+S/2+2,y+4,0],[x+S/2+2,y+S-4,0],[x+S/2-2,y+S-4,0]],'#e7e2d6')+I.poly([[x+4,y+S/2-2,0],[x+S-4,y+S/2-2,0],[x+S-4,y+S/2+2,0],[x+4,y+S/2+2,0]],'#e7e2d6');
  out+=I.box(x+S/2-5,y+S/2-5,0,10,10,1.6,{base:'#cbd5e1'})+I.box(x+S/2-3.5,y+S/2-3.5,1.6,7,7,.3,{top:'#60a5fa',L:'#3b82f6',R:'#60a5fa'})+I.box(x+S/2-.8,y+S/2-.8,1.6,1.6,1.6,5,{base:'#e2e8f0'});
  out+=I.tree(x+10,y+10,1,'#f59e0b')+I.tree(x+S-10,y+10,1,'#c2410c')+I.tree(x+10,y+S-10,1,'#65a30d')+I.tree(x+S-10,y+S-10,1,'#e8662a')+I.bench(x+S/2+5,y+S/2+7)+I.person(x+S/2-8,y+S/2+10,C2)+I.person(x+S/2+9,y+S/2-9,C1);}
 if(kind==='lake'){const c=[];for(let a=0;a<360;a+=20)c.push([x+S/2+17*Math.cos(a*Math.PI/180)*(1+.15*Math.sin(a*3*Math.PI/180)),y+S/2+15*Math.sin(a*Math.PI/180),0]);out+=I.poly(c,'#60a5fa','stroke="#93c5fd" stroke-width="1.5"');
  out+=I.tree(x+6,y+8,1.1,'#65a30d')+I.tree(x+S-6,y+S-8,1.1,'#f59e0b')+I.tree(x+S-8,y+8,1,'#c2410c');}
 if(kind==='trees'){[[10,12],[26,8],[38,20],[14,30],[30,34],[42,40],[8,42]].forEach(([a,b],i)=>out+=I.tree(x+a,y+b,1.1,['#e8662a','#f59e0b','#c2410c','#65a30d'][i%4]))}
 if(kind==='parking'){out+=I.poly([[x+4,y+4,0],[x+S-4,y+4,0],[x+S-4,y+S-4,0],[x+4,y+S-4,0]],'#4b5563');
  const cols=['#ef4444','#f8fafc','#0ea5e9','#facc15','#10b981'];[[8,8],[8,18],[8,28],[30,10],[30,32]].forEach(([a,b],k)=>out+=I.box(x+a,y+b,0,7,4,2.4,{base:cols[k]})+I.box(x+a+1.5,y+b+.6,2.4,4,2.8,1.6,{top:sh(cols[k],.25),L:'#1e293b',R:'#334155'}));
  out+=I.box(x+18,y+20,0,7,18,6,{base:C1})+I.winR(x+25,y+21,y+37,2.6,5,5,1,0)+I.box(x+18,y+20,6,7,18,.6,{base:'#e2e8f0'});}
 return out}

// ---------------- live campus ----------------
const STEP=58,S=46,K4=1.7,W4=600,H4=900;
const cell=(s,d)=>{const i=(s+d)/2,j=(s-d)/2;return [i*STEP,j*STEP]};
const ART={film:{wall:'brick',roof:'#3f3f46'},med:{wall:'white'},recruit:{wall:'brick',roof:'#7c2d12'},dorms:{wall:'brick',roof:'#334155'},gym:{wall:'glass'},booster:{wall:'white',roof:'#7c2d12'},academic:{wall:'brick',roof:'#1e3a5f'}};
const TOP={hq:46,stadium:30,training:14,skills:10};
function medCross(I){return (bx,by,w,d,h)=>{const [cx,cy]=I.P(bx+w,by+d/2,h*.55);const k=I.K;return `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) skewY(-26.565)"><rect x="${-3.5*k}" y="${-1.2*k}" width="${7*k}" height="${2.4*k}" fill="#ef4444"/><rect x="${-1.2*k}" y="${-3.5*k}" width="${2.4*k}" height="${7*k}" fill="#ef4444"/></g>`}}
function drawBuilding(I,k,x,y,sz,lvl){
 if(k==='hq')return hq(I,x,y,sz,lvl);
 if(k==='stadium')return stadium(I,x,y,sz,lvl);
 if(k==='training')return training(I,x,y,sz,lvl);
 if(k==='skills')return skills(I,x,y,sz,lvl);
 const o=Object.assign({},ART[k]||{wall:'brick'});if(k==='med')o.extra=medCross(I);
 return brick(I,x,y,sz,lvl,o)}

function render(I,car,opts={}){const C=window.CFC;const col=C.college(car);C1=col.c1;C2=col.c2;
 const parts=[DEFS];const add=s=>parts.push(s);
 add(`<rect width="${W4}" height="${H4}" fill="url(#grass4)"/>`);
 for(let s=-3;s<=13;s++)for(const d of [-6,-5,-4,-3,3,4,5,6]){if((s+d)%2)continue;const [x,y]=cell(s,d);[[12,14],[32,10],[22,32],[40,38]].forEach(([a,b],i)=>add(I.tree(x+a,y+b,1.1,['#e8662a','#f59e0b','#c2410c','#65a30d'][(i+s+d+20)%4])))}
 for(const d of [-2,0,2,-1,1])for(const s of [-2,-1,11,12]){if((s+d)%2)continue;const [x,y]=cell(s,d);[[12,14],[32,10],[22,32],[40,38]].forEach(([a,b],i)=>add(I.tree(x+a,y+b,1.1,['#c2410c','#65a30d','#f59e0b','#e8662a'][(i+s+d+20)%4])))}
 const occ=[];for(const p of C.PLOTS){occ.push([p.s,p.d]);if(p.span)occ.push([p.s+1,p.d-1],[p.s+1,p.d+1],[p.s+2,p.d])}
 for(const [s,d] of occ){const [x,y]=cell(s,d);add(I.poly([[x-6,y-6,0],[x+S+6,y-6,0],[x+S+6,y+S+6,0],[x-6,y+S+6,0]],'#7b8494'))}
 for(const [s,d] of occ){const [x,y]=cell(s,d);for(let t=0;t<S+12;t+=8){add(I.poly([[x+S+5.6,y-6+t,0],[x+S+6.4,y-6+t,0],[x+S+6.4,y-2+t,0],[x+S+5.6,y-2+t,0]],'#fde68a'));add(I.poly([[x-6+t,y+S+5.6,0],[x-2+t,y+S+5.6,0],[x-2+t,y+S+6.4,0],[x-6+t,y+S+6.4,0]],'#fde68a'))}}
 const overlays=[];
 const order=[...C.PLOTS].sort((a,b)=>(a.s+(a.span?1:0))-(b.s+(b.span?1:0))||a.d-b.d);
 for(const p of order){const [x,y]=cell(p.s,p.d);const sz=p.span?STEP+S:S;
  const hit=I.poly([[x,y,0],[x+sz,y,0],[x+sz,y+sz,0],[x,y+sz,0]],'#74cc6b');
  if(!p.b){
   if(p.k==='land'){add(`<g data-act="land" data-v="${p.tier}">${hit}${lockedPlot(I,x,y,S,'Tier '+p.tier+' land')}</g>`);continue}
   add(hit+decor(I,x,y,S,p.k));continue}
  const k=p.b,def=C.BUILDINGS[k],lvl=car.b[k],q=car.queue.find(z=>z.key===k);
  let g='';
  if(lvl===0&&def.needHQ&&car.b.hq<def.needHQ)g=lockedPlot(I,x,y,S,'HQ Lv '+def.needHQ);
  else if(lvl===0&&!q)g=emptyPlot(I,x,y,S,def.name.split(' ')[0]);
  else{g=lvl>0?drawBuilding(I,k,x,y,sz,lvl):I.poly([[x+4,y+4,0],[x+S-4,y+4,0],[x+S-4,y+S-4,0],[x+4,y+S-4,0]],'url(#dirt4)');if(q)g+=construction(I,x,y,S,lvl?16:4)}
  add(`<g data-act="bld" data-v="${k}">${hit.replace('fill="#74cc6b"','fill="#74cc6b"')}${g}</g>`);
  const [bx,by]=I.P(x+sz/2,y+sz/2,lvl?(TOP[k]||22):4);overlays.push({k,bx,by,lvl,q,def});
 }
 [[-3,40],[STEP-3,90],[150,STEP-3],[2*STEP-3,170],[90,2*STEP-3]].forEach(([a,b],i)=>add(I.person(a,b,i%2?C1:C2)));
 add(`<g class="clouds4" opacity=".8" filter="url(#blur4)" pointer-events="none"><ellipse cx="120" cy="120" rx="34" ry="9" fill="#fff"/><ellipse cx="142" cy="113" rx="20" ry="8" fill="#fff"/><ellipse cx="470" cy="420" rx="28" ry="8" fill="#fff"/><ellipse cx="160" cy="640" rx="30" ry="8" fill="#fff"/></g>`);
 // badges, timers and collect bubbles
 const sc=1.35;
 for(const o of overlays){const {k,bx,by,lvl,q,def}=o;
  if(q){add(`<g data-act="bld" data-v="${k}" transform="translate(${bx.toFixed(1)},${(by-8).toFixed(1)}) scale(${sc})"><rect x="-32" y="-9" width="64" height="18" rx="9" fill="${C2}" stroke="#fff" stroke-width="1"/><text x="-27" y="3.4" font-size="8">🔨</text><text x="-17" y="-1" font-family="Nunito" font-weight="900" font-size="6.2" fill="#fff">${C.esc(def.name.split(' ')[0])} → ${q.to}</text><text x="28" y="6" text-anchor="end" font-family="Nunito" font-weight="900" font-size="5.6" fill="#fff" data-timer="${k}">${C.dur(C.remaining(q))}</text><rect x="-17" y="2.4" width="28" height="2.8" rx="1.4" fill="rgba(255,255,255,.35)"/><rect x="-17" y="2.4" width="${(28*C.clamp(1-C.remaining(q)/((q.end-q.start)/1000),0,1)).toFixed(1)}" height="2.8" rx="1.4" fill="#fff" data-bar="${k}"/></g>`);continue}
  if(!lvl)continue;
  const amt=!opts.preview&&C.PRODUCERS[k]?C.bubble(k):0;
  add(`<g data-act="bld" data-v="${k}" transform="translate(${bx.toFixed(1)},${(by-4).toFixed(1)}) scale(${sc})" class="bdg">
   <g class="bname"><rect x="-2" y="-6.5" width="${def.name.length*4.1+14}" height="13" rx="6.5" fill="rgba(15,27,61,.82)"/><text x="9" y="2.6" font-family="Nunito" font-weight="900" font-size="7" fill="#fff">${C.esc(def.name)}</text></g>
   <path d="M0 -8 L7 -5 V1.5 C7 5.5 3.5 8 0 9 C-3.5 8 -7 5.5 -7 1.5 V-5Z" fill="${C1}" stroke="${GOLD}" stroke-width="1.3"/><text y="3" text-anchor="middle" font-family="Graduate,serif" font-size="${lvl>9?6.6:8}" fill="#fff">${lvl}</text>
   ${!opts.preview&&C.readyArrow(k)?`<g transform="translate(7,-9)"><g class="upar"><circle r="4.6" fill="#22c55e" stroke="#fff" stroke-width=".9"/><path d="M0 -2.6 L2.4 .4 H1 V2.6 H-1 V.4 H-2.4Z" fill="#fff"/></g></g>`:''}</g>`);
  if(amt)add(`<g data-act="collect" data-v="${k}" transform="translate(${(bx+22).toFixed(1)},${(by-30).toFixed(1)}) scale(${sc})"><g class="hammer"><path d="M-12 -10 h24 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-9 l-3 4 l-3 -4 h-9 a4 4 0 0 1 -4 -4 v-8 a4 4 0 0 1 4 -4z" fill="#fff" stroke="${C.PRODUCERS[k]==='cp'?'#38bdf8':'#16a34a'}" stroke-width="1.4"/><text x="-9" y="0" font-size="8">${C.PRODUCERS[k]==='cp'?'📘':'💵'}</text><text x="12" y="-.4" text-anchor="end" font-family="Teko,sans-serif" font-weight="600" font-size="9" fill="#14532d">${C.short(amt)}</text></g></g>`);
 }
 return parts.join('')}

window.CFC.campusSVG=(car,opts={})=>opts.preview
 ?`<svg viewBox="40 60 520 560" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%">${render(iso(K4,W4/2,150),car,opts)}</svg>`
 :`<svg viewBox="0 0 ${W4} ${H4}" width="${W4}" height="${H4}" xmlns="http://www.w3.org/2000/svg" style="display:block">${render(iso(K4,W4/2,150),car,opts)}</svg>`;
window.CFC.campusSize=[W4,H4];
// A single building at a given level, for the upgrade card
window.CFC.buildingThumb=function(k,lvl,car,w=200,h=150){const col=window.CFC.college(car);C1=col.c1;C2=col.c2;const sz=k==='stadium'?STEP+S:S;const tall=k==='stadium'?44:k==='hq'?78:62;
 const Kk=Math.min(w*.96/(2*sz),h/(sz+tall));const I=iso(Kk,w/2,(h-sz*Kk+tall*Kk)/2);
 const body=lvl>0?drawBuilding(I,k,0,0,sz,lvl):emptyPlot(I,0,0,S,window.CFC.BUILDINGS[k].name.split(' ')[0]);
 return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%">${DEFS}${I.poly([[-30,-30,0],[sz+30,-30,0],[sz+30,sz+30,0],[-30,sz+30,0]],'url(#grass4)')}${body}</svg>`};
})();
