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
 <filter id="lockg4"><feColorMatrix type="saturate" values=".2"/></filter>
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
 const fl=Math.min(4,1+Math.floor((s-1)/1.4)),h=7.5*fl+lvl*.12;const w=S*.84,d=S*.66;const bx=x+(S-w)/2,by=y+(S-d)/2-2;   // every building fills its tile, at every level (round 6: easy to swap graphics)
 const wall=o.wall||'brick';const top=g?'url(#gold4)':'#e5d9c6';
 const L=wall==='brick'?'url(#brL4)':wall==='white'?'#dfe6ee':'url(#glass4)',R=wall==='brick'?'url(#brR4)':wall==='white'?'#f8fafc':'url(#glassR4)';
 // front path and small per-level details
 out+=I.poly([[bx+w*.4,by+d,0],[bx+w*.6,by+d,0],[bx+w*.6,y+S,0],[bx+w*.4,y+S,0]],'#e7e2d6');
 out+=I.shadow(bx,by,w,d,h);
 if(s>=3){out+=I.box(bx-S*.07,by+d*.25,0,S*.07,d*.6,h*.6,{top:'#e5d9c6',L,R})+I.winL(bx-S*.07,bx,by+d*.85,0,h*.6,1,fl>1?2:1,l6)}
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
function hq(I,x,y,S,lvl){const s=stageOf(lvl),g=s===6,l6=(lvl-1)%6+1;let out='';const w=S*.84,d=S*.62,h=10+2.4*s+lvl*.2;const bx=x+(S-w)/2,by=y+(S-d)/2-3;
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
 const k=I.K;
 out+=`<g transform="translate(${sx.toFixed(1)},${sy.toFixed(1)}) scale(${k})"><circle r="8.5" fill="#16a34a" stroke="#fff" stroke-width="1.4"/><text y="3.4" text-anchor="middle" font-size="9">🔨</text></g>`;
 return out}
function lockedPlot(I,x,y,S,req){// locked land and plots: a barrier pin in the same style as the build pin (round 6)
 const [sx,sy]=I.P(x+S/2,y+S/2,0),k=I.K;
 return I.poly([[x+4,y+4,0],[x+S-4,y+4,0],[x+S-4,y+S-4,0],[x+4,y+S-4,0]],'url(#lockP4)',`stroke="#64748b" stroke-width="${.6*I.K}" opacity=".75"`)+
 `<g transform="translate(${sx.toFixed(1)},${sy.toFixed(1)}) scale(${k})"><circle r="8.5" fill="#475569" stroke="#fff" stroke-width="1.4"/><rect x="-5.6" y="-2.6" width="11.2" height="3.6" rx=".8" fill="#fff"/><path d="M-3.8 1-1.6-2.6H.6L-1.6 1zM1 1 3.2-2.6H5L3.2 1z" fill="#f97316"/><path d="M-4 1v3.4M4 1v3.4" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></g>`}
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

// ---------------- painted art (9p, 9q) ----------------
// Each building render is a 1536 x 1024 image whose tile has its top corner at (768,354) and is 1300 px wide; it is scaled onto the plot.
const ART_MAX={};
const SCEN=()=>window.CFC_SCEN||{};
// Every picture is test-loaded first. One that fails (missing from an upload, say) falls back to render 1, then to the old drawn
// building, so the map never shows a broken-image box (iPhone draws those as a "?").
const SEEN={};
function probe(h){if(SEEN[h])return SEEN[h];SEEN[h]='wait';const im=new Image();im.onload=()=>{SEEN[h]='ok'};im.onerror=()=>{SEEN[h]='bad';window.CFC.redrawMap&&window.CFC.redrawMap()};im.src=h;return 'wait'}
const STAD={};   // the Stadium recolored to the school's main color, cached as a data URL
function stadiumHref(n){const C=window.CFC,key=n+C1,base=`img/campus/b_stadium_${n}.webp`;if(STAD[key])return STAD[key]==='busy'?base:STAD[key];
 if(!window.paintStadium)return base;STAD[key]='busy';const im=new Image();im.onload=()=>{try{const u=window.paintStadium(im,C1).toDataURL('image/png');STAD[key]=u&&u.length>100?u:base;C.redrawMap&&C.redrawMap()}catch(e){STAD[key]=base}};im.onerror=()=>STAD[key]=base;im.src=base;return base}
const TOWER={};  // the water tower painted in school colors with the initials, cached as a data URL
function towerHref(n,abbr){const C=window.CFC,key=n+C1+C2+abbr,base=`img/campus/tower_${n}.png`,m=SCEN()['tower_'+n];if(TOWER[key])return TOWER[key]==='busy'?base:TOWER[key];
 if(!window.paintTower||!m)return base;TOWER[key]='busy';const im=new Image();im.onload=()=>{try{TOWER[key]=window.paintTower(im,n,C1,C2,abbr,{k:m.k,ox:m.ox,oy:m.oy}).toDataURL('image/png');C.redrawMap&&C.redrawMap()}catch(e){TOWER[key]=base}};im.onerror=()=>TOWER[key]=base;im.src=base;return base}
function drawn(I,k,x,y,sz,lvl){if(k==='hq')return hq(I,x,y,sz,lvl);if(k==='stadium')return stadium(I,x,y,sz,lvl);if(k==='training')return training(I,x,y,sz,lvl);if(k==='skills')return skills(I,x,y,sz,lvl);
 const o=Object.assign({},ART[k]||{wall:'brick'});if(k==='med')o.extra=medCross(I);return brick(I,x,y,sz,lvl,o)}
// test mode (Settings, 9q): show every building at one render (1-10) to check the art
const testRender=()=>{try{return window.CFC.acct().testRender||0}catch(e){return 0}};
function tileImage(I,x,y,sz,href){const f=2*sz*I.K/1300,[tx,ty]=I.P(x,y,0);return `<image href="${href}" x="${(tx-768*f).toFixed(1)}" y="${(ty-354*f).toFixed(1)}" width="${(1536*f).toFixed(1)}" height="${(1024*f).toFixed(1)}"/>`}
function painted(I,k,x,y,sz,lvl){let n=Math.min(ART_MAX[k]||10,testRender()||window.CFC.renderOf(lvl));
 if(probe(`img/campus/b_${k}_${n}.webp`)==='bad')n=1;
 if(probe(`img/campus/b_${k}_${n}.webp`)==='bad')return drawn(I,k,x,y,sz,lvl);
 return tileImage(I,x,y,sz,k==='stadium'?stadiumHref(n):`img/campus/b_${k}_${n}.webp`)}
function plotTile(I,x,y,sz,name,fallback){return probe(`img/campus/${name}.webp`)==='bad'?fallback():tileImage(I,x,y,sz,`img/campus/${name}.webp`)}
// a painted sprite standing on the ground at world point (wx,wy); f = drawn height / file height of the object
function sprite(I,href,wx,wy,m,f,bxKey='bx',byKey='by',wKey='w',hKey='h'){const [px,py]=I.P(wx,wy,0);return `<image href="${href}" x="${(px-m[bxKey]*f).toFixed(1)}" y="${(py-m[byKey]*f).toFixed(1)}" width="${(m[wKey]*f).toFixed(1)}" height="${(m[hKey]*f).toFixed(1)}"/>`}
function tree(I,wx,wy,i,scale){i=Math.abs(Math.round(i));const n=i%8+1,m=SCEN()['tree_'+n],href=`img/campus/tree_${n}.webp`;
 if(!m||probe(href)==='bad')return I.tree(wx,wy,1.1*scale,['#e8662a','#f59e0b','#c2410c','#65a30d'][i%4]);
 return sprite(I,href,wx,wy,m,30*scale/230)}

// ---------------- environment (9r): paths, edging, campus wall and gate, plot tiles, state surroundings ----------------
const ENV=()=>window.CFC_ENV||{scen:{},looks:{},scale:.13};
const STG={path:[1,1,2,3,4,5,6,7,7,7,7],edge:[1,1,1,1,2,2,3,4,4,4,4],wall:[1,1,1,1,2,2,2,3,4,4,4]};   // by Coaches' Office render 1-10
const EDGECOL=['','#959594','#b6b3af','#934733','#efe0c0'];
function scen(I,look,i,wx,wy,sc){const n=i%6+1,name=`scen_${look}_${n}`,m=ENV().scen[name],href=`img/campus/env/${name}.webp`;
 if(!m||probe(href)==='bad')return tree(I,wx,wy,i,sc);return sprite(I,href,wx,wy,m,ENV().scale*sc)}
const envTile=(I,x,y,sz,name,fb)=>probe(`img/campus/env/${name}.webp`)==='bad'?fb():tileImage(I,x,y,sz,`img/campus/env/${name}.webp`);

// ---------------- live campus ----------------
// The map is drawn as two layers: the ground and buildings (rebuilt only when something on the campus changes, so taps never
// make the pictures blink) and the markers on top (selection, buttons, timers, collect tokens), redrawn on every tap (FEEDBACK 73).
const STEP=58,S=46,K4=1.7,W4=720,H4=900;   // 9q: wider, so buildings at the edges can scroll clear of the side buttons
const cell=(s,d)=>{const i=(s+d)/2,j=(s-d)/2;return [i*STEP,j*STEP]};
const ART={kitroom:{wall:'white',roof:'#be123c'},lab:{wall:'glass',roof:'#0f766e'},transport:{wall:'white',roof:'#ca8a04'},nutrition:{wall:'glass',roof:'#15803d'},video:{wall:'brick',roof:'#111827'},media:{wall:'white',roof:'#0369a1'},med:{wall:'white'},recruit:{wall:'brick',roof:'#7c2d12'},dorms:{wall:'brick',roof:'#334155'},gym:{wall:'glass'},booster:{wall:'white',roof:'#7c2d12'},academic:{wall:'white',roof:'#1e3a8a'}};
function medCross(I){return (bx,by,w,d,h)=>{const [cx,cy]=I.P(bx+w,by+d/2,h*.55);const k=I.K;return `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) skewY(-26.565)"><rect x="${-3.5*k}" y="${-1.2*k}" width="${7*k}" height="${2.4*k}" fill="#ef4444"/><rect x="${-1.2*k}" y="${-3.5*k}" width="${2.4*k}" height="${7*k}" fill="#ef4444"/></g>`}}
function drawBuilding(I,k,x,y,sz,lvl){return painted(I,k,x,y,sz,lvl)}
const GDEFS=(look,pn,I)=>{const g=look==='park'||look==='city'?'img/campus/grass.webp':`img/campus/env/ground_${look}.webp`;
 return `<defs><pattern id="pgrass" patternUnits="userSpaceOnUse" width="72" height="72"><rect width="72" height="72" fill="#9fb36c"/><image href="${g}" width="72" height="72"/></pattern>
 <pattern id="pcity" patternUnits="userSpaceOnUse" width="72" height="72"><rect width="72" height="72" fill="#c8c8c4"/><image href="img/campus/env/ground_city_paving.webp" width="72" height="72"/></pattern>
 <pattern id="ppath" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="matrix(${I.K},${I.K/2},${-I.K},${I.K/2},${I.P(0,0,0)[0]},${I.P(0,0,0)[1]})"><rect width="40" height="40" fill="#7b8494"/><image href="img/campus/env/path_${pn}.webp" width="40" height="40"/></pattern></defs>`};

// everything about the plots, shared by both layers
function plotsOf(I,car){const C=window.CFC,tr=testRender(),out=[];
 for(const p of C.PLOTS){const [x,y]=cell(p.s,p.d),sz=p.span?STEP+S:S;
  const o={p,x,y,sz,corners:[I.P(x,y,0),I.P(x+sz,y,0),I.P(x+sz,y+sz,0),I.P(x,y+sz,0)],depth:I.P(x+sz/2,y+sz/2,0)[1]};
  if(p.b){const k=p.b;Object.assign(o,{k,def:C.BUILDINGS[k],lvl:tr?Math.max(1,car.b[k]||0):car.b[k]||0,q:car.queue.find(z=>z.key===k),locked:!tr&&!!(C.BUILDINGS[k].needHQ&&car.b.hq<C.BUILDINGS[k].needHQ)})}
  out.push(o)}
 return out}

function renderBase(I,car,opts){const C=window.CFC;const col=C.college(car);C1=col.c1;C2=col.c2;
 const look=ENV().looks[col.state]||'park',hqR0=Math.min(10,testRender()||C.renderOf(car.b.hq||1)),pn=STG.path[hqR0],en=STG.edge[hqR0],wn=STG.wall[hqR0];
 const parts=[DEFS,GDEFS(look,pn,I)],add=s=>parts.push(s),items=[];
 add(`<rect width="${W4}" height="${H4}" fill="url(#pgrass)"/>`);
 const plots=plotsOf(I,car);
 // roads round every plot
 const occ=[];for(const p of C.PLOTS){occ.push([p.s,p.d]);if(p.span)occ.push([p.s+1,p.d-1],[p.s+1,p.d+1],[p.s+2,p.d])}
 const pathFill=probe(`img/campus/env/path_${pn}.webp`)==='bad'?'#7b8494':'url(#ppath)';
 for(const [s,d] of occ){const [x,y]=cell(s,d);add(I.poly([[x-6,y-6,0],[x+S+6,y-6,0],[x+S+6,y+S+6,0],[x-6,y+S+6,0]],pathFill))}
 for(const [s,d] of occ){const [x,y]=cell(s,d),e=1.3;add(I.poly([[x-e,y-e,0],[x+S+e,y-e,0],[x+S+e,y+S+e,0],[x-e,y+S+e,0]],EDGECOL[en]))}
 // parkland round the campus: painted trees, fewer than before so the grass shows
 const TP=[[12,14],[34,10],[22,32],[40,38]];let n=0;
 for(let s=-3;s<=14;s++)for(let d=-8;d<=8;d++){if((s+d+40)%2)continue;if(occ.some(([a,b])=>a===s&&b===d))continue;
  const [x,y]=cell(s,d);if(look==='city'&&Math.abs(d)>=4)add(I.poly([[x-6,y-6,0],[x+STEP-6,y-6,0],[x+STEP-6,y+STEP-6,0],[x-6,y+STEP-6,0]],'url(#pcity)'));
  const cnt=look==='park'?((Math.abs(d)>=3||s<0||s>10)?2:1):3;for(let i=0;i<cnt;i++){const [a,b]=TP[(i*2+n)%4],sc=.9+((n*7+i*3)%5)*.06;items.push([I.P(x+a,y+b,0)[1],look==='park'?tree(I,x+a,y+b,n*3+i*5,sc):scen(I,look,n*5+i*7,x+a,y+b,sc)])}n++}
 // plots: buildings, blank ground, pond, tower, spare land
 const hqR=Math.min(10,testRender()||C.renderOf(car.b.hq||1));
 for(const o of plots){const {p,x,y,sz}=o;
  if(!p.b){
   if(p.k==='land')items.push([o.depth-999,envTile(I,x,y,S,'plot_locked',()=>plotTile(I,x,y,S,'plot_locked',()=>lockedPlot(I,x,y,S,'')))]);
   else if(p.k==='lake')items.push([o.depth-999,plotTile(I,x,y,S,'plot_pond_4',()=>decor(I,x,y,S,'lake'))]);
   else if(p.k==='water'){const tn=hqR<=2?5:hqR<=4?4:hqR<=6?3:hqR<=8?2:1,m=SCEN()['tower_'+tn];
    items.push([o.depth-999,envTile(I,x,y,S,'plot_empty',()=>plotTile(I,x,y,S,'plot_empty',()=>''))]);
    if(m&&probe(`img/campus/tower_${tn}.png`)!=='bad'){const f=110/m.h,cx=x+S/2,cy=y+S/2;
     items.push([o.depth-998,sprite(I,`img/campus/tower_${tn}_shadow.webp`,cx,cy,m,f,'sbx','sby','sw','sh')]);
     items.push([o.depth,sprite(I,towerHref(tn,col.abbr),cx,cy,m,f)])}
    else items.push([o.depth,decor(I,x,y,S,'water')])}
   else{[[10,12],[30,8],[38,26],[14,32],[28,38]].forEach(([a,b],i)=>items.push([I.P(x+a,y+b,0)[1],tree(I,x+a,y+b,o.depth+i*5,1)]))}
   continue}
  let g;
  if(o.lvl>0)g=drawBuilding(I,o.k,x,y,sz,o.lvl);
  else g=envTile(I,x,y,sz,'plot_build',()=>plotTile(I,x,y,sz,'plot_empty',()=>emptyPlot(I,x,y,sz,'')));   // blank prepared ground until it's built (FEEDBACK 84, 88)
  if(o.q)g+=construction(I,x,y,S,o.lvl?16:4);
  items.push([o.depth,g])}
  // the campus edge (FEEDBACK 84): a wall round the outside of the road grid, with the gate at the front
 if(probe(`img/campus/env/wall_${wn}_l.webp`)!=='bad'){const occS=new Set(occ.map(([s,d])=>((s+d)/2)+','+((s-d)/2)));const has=(i,j)=>occS.has(i+','+j);
  const front=occ.map(([s,d])=>[(s+d)/2,(s-d)/2]).sort((a,b)=>(b[0]+b[1])-(a[0]+a[1])||Math.abs(a[0]-a[1])-Math.abs(b[0]-b[1]))[0],gi=front[0],gj=front[1];   // the gate goes on the front-most square
  occ.forEach(([s,d])=>{const i=(s+d)/2,j=(s-d)/2,X=i*STEP-6,Y=j*STEP-6,z=STEP;
   const piece=(nm,tx,ty,dx,dy)=>items.push([I.P(tx+dx,ty+dy,0)[1]+.1,tileImage(I,tx,ty,z,`img/campus/env/${nm}.webp`)]);
   const post=(px,py)=>items.push([I.P(px,py,0)[1]+.2,tileImage(I,px,py,z,`img/campus/env/wall_${wn}_c.webp`)]);
   if(!has(i,j-1)){piece(`wall_${wn}_r`,X,Y,z/2,0);post(X,Y);post(X+z,Y)}
   if(!has(i-1,j)){piece(`wall_${wn}_l`,X,Y,0,z/2);post(X,Y);post(X,Y+z)}
   if(!has(i+1,j)){piece(`wall_${wn}_l`,X+z,Y,0,z/2);post(X+z,Y);post(X+z,Y+z)}
   if(!has(i,j+1)){if(i===gi&&j===gj)items.push([I.P(X+z/2,Y+z,0)[1]+.1,tileImage(I,X,Y+z/2,z,`img/campus/env/gate_${wn}.webp`)]);else piece(`wall_${wn}_r`,X,Y+z,z/2,0);post(X,Y+z);post(X+z,Y+z)}})}
 items.sort((a,b)=>a[0]-b[0]).forEach(a=>add(a[1]));
 // tap areas, on top of everything: the plot plus the space its building rises into. Smaller plots go last so they win
 // over the Stadium, whose own area is trimmed to its pitch and stands (FEEDBACK 73).
 const hits=plots.filter(o=>o.p.b&&!o.locked).sort((a,b)=>(b.p.span?1:0)-(a.p.span?1:0)||a.depth-b.depth);
 add('<g class="hits">'+hits.map(o=>{const {x,y,sz}=o,m=o.p.span?sz*.1:0,H=o.p.span?10:(o.lvl?Math.min(60,20+o.lvl*1.6):6);
  const c=[I.P(x+m,y+m,0),I.P(x+sz-m,y+m,0),I.P(x+sz-m,y+sz-m,0),I.P(x+m,y+sz-m,0)];const up=H*I.K;
  const pts=[c[3],[c[3][0],c[3][1]-up],[c[0][0],c[0][1]-up],[c[1][0],c[1][1]-up],c[1],c[2]].map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  return `<polygon data-act="bld" data-v="${o.k}" points="${pts}" fill="#000" fill-opacity="0"/>`}).join('')+'</g>');
 return parts.join('')}

// markers: only where there's something to do (FEEDBACK 82, 88). Small and icon-led.
function renderOver(I,car,opts){const C=window.CFC;if(opts.preview)return '';const parts=[],add=s=>parts.push(s);
 const plots=plotsOf(I,car).filter(o=>o.p.b&&!o.locked);
 const out=(t)=>`stroke="#0f172a" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round"`;
 for(const o of plots){const {k,lvl,q,def,corners}=o,top=corners[0],left=corners[3],front=corners[2];
  const tcx=(corners[0][0]+corners[2][0])/2,tcy=(corners[0][1]+corners[2][1])/2;
  const sel=C.selB===k;
  if(sel){
   const pts=corners.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
   add(`<polygon points="${pts}" fill="#7dd3fc" fill-opacity=".14" stroke="#7dd3fc" stroke-width="2" class="selring" pointer-events="none"/>`);
   add(`<g pointer-events="none" transform="translate(${tcx.toFixed(1)},${(top[1]-4).toFixed(1)})" font-family="Nunito" font-weight="900" text-anchor="middle" ${out()}>
    <text y="0" font-size="10" fill="#fff">${C.esc(def.name)}</text><text y="11" font-size="9" fill="#fde047">${lvl?'Lv.'+lvl:'Ready to build'}</text></g>`);
   const acts=C.buildingActions(k),nn=acts.length,R=19,G=48;
   const LAY={1:[[0,0]],2:[[-G/2,0],[G/2,0]],3:[[-G,-22],[0,0],[G,-22]],4:[[-G*1.5,-22],[-G/2,0],[G/2,0],[G*1.5,-22]]}[nn]||[[0,0]];
   add(`<g class="fixz" data-x="${front[0].toFixed(1)}" data-y="${front[1].toFixed(1)}" transform="translate(${front[0].toFixed(1)},${front[1].toFixed(1)})">`+acts.map((a,i)=>{const [dx,dy]=LAY[i];
    return `<g data-act="${a.act}" data-v="${a.v}" transform="translate(${dx},${dy+6})"><circle r="${R}" fill="${a.col||'#2563eb'}" stroke="#0f172a" stroke-width="2.5"/><circle r="${R-2.5}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>${a.icon==='up'?`<path d="M0 ${-R*.6} L${R*.55} 0 H${R*.2} V${R*.55} H${-R*.2} V0 H${-R*.55}Z" fill="#fff" stroke="#0f172a" stroke-width="1.2"/>`:a.icon==='i'?`<text y="${R*.35}" text-anchor="middle" font-size="${R}" font-weight="900" fill="#fff" font-family="Nunito">i</text>`:`<text y="${R*.32}" text-anchor="middle" font-size="${R*.9}">${a.icon}</text>`}<text y="${R+12}" text-anchor="middle" font-size="10" font-weight="900" fill="#fff" font-family="Nunito" ${out()}>${C.esc(a.label)}</text></g>`}).join('')+`</g>`);
  }
  if(k==='lab'&&!sel){const rq=(car.pbq||[]).filter(z=>z.end<=C.now()).length; // 1.01 (FEEDBACK 140): finished research waits here for a tap
   if(rq)add(`<g data-act="pbready" transform="translate(${(tcx-(q?16:0)).toFixed(1)},${(tcy-(q?20:8)).toFixed(1)})"><g class="bnc"><circle r="11" fill="#0d9488" stroke="#0f172a" stroke-width="2"/><path d="M-5.5 -4 h4.5 a1.5 1.5 0 0 1 1 .5 a1.5 1.5 0 0 1 1 -.5 h4.5 v8.5 h-4.5 a1.5 1.5 0 0 0 -1 .5 a1.5 1.5 0 0 0 -1 -.5 h-4.5z" fill="#fff"/>${rq>1?`<circle cx="9" cy="-8" r="5.5" fill="#ef4444" stroke="#0f172a" stroke-width="1.5"/><text x="9" y="-5.2" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="7.5" fill="#fff">${rq}</text>`:''}</g><text y="22" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="9" fill="#fff" ${out()}>Research done</text></g>`)}
  if(q&&!sel&&(q.ready||q.end<=C.now())){ // finished: waiting for the player to tap and complete it (FEEDBACK 92)
   add(`<g data-act="bdone" data-v="${k}" transform="translate(${tcx.toFixed(1)},${(tcy-8).toFixed(1)})"><g class="bnc"><circle r="11" fill="#16a34a" stroke="#0f172a" stroke-width="2"/><path d="M-5 0.5 L-1.5 4 L5.5 -3.5" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><text y="22" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="9" fill="#fff" ${out()}>Complete</text></g>`);continue}
  if(q&&!sel){ // compact build timer over the plot's back corner
   add(`<g data-act="bld" data-v="${k}" transform="translate(${top[0].toFixed(1)},${(top[1]-2).toFixed(1)})"><rect x="-25" y="-8" width="50" height="13" rx="6.5" fill="#0f172a" fill-opacity=".78"/><circle cx="-18" cy="-1.5" r="5" fill="#f59e0b"/><path d="M-18 -4.5 V-1.5 L-16 0" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/><text x="22" y="2.3" text-anchor="end" font-family="Teko,sans-serif" font-weight="600" font-size="9.5" fill="#fff" data-timer="${k}">${C.dur(C.remaining(q))}</text></g>`);continue}
  if(!lvl&&C.buildable(k)&&!sel){ // a newly unlocked building, ready for its free one-tap build (FEEDBACK 85)
   add(`<g data-act="bld" data-v="${k}" class="bounce" transform="translate(${tcx.toFixed(1)},${(tcy-6).toFixed(1)})"><g class="bnc"><circle r="10" fill="#16a34a" stroke="#0f172a" stroke-width="2"/><path d="M-4.5 4.5 L2 -2 M0 -4.5 L4.5 0 L2 2.5 L-2.5 -2Z" stroke="#fff" stroke-width="2" fill="#fff" stroke-linejoin="round"/></g></g>`);continue}
  if(C.readyArrow(k)&&!sel){ // upgrade available: a small green arrow badge on the plot's left corner (1.01: shown even when another building is selected)
   const ax=left[0]+(tcx-left[0])*.3,ay=left[1]+(tcy-left[1])*.3-3;
   add(`<g data-act="bld" data-v="${k}" transform="translate(${ax.toFixed(1)},${ay.toFixed(1)})"><path d="M0 -6.5 L5.5 0 H2.3 V5.5 H-2.3 V0 H-5.5Z" fill="#22c55e" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round"/></g>`)}
  const amt=lvl&&C.PRODUCERS[k]?C.bubble(k):0;
  if(amt){const cp=C.PRODUCERS[k]==='cp',cx=tcx,cy=top[1]+(tcy-top[1])*.35-(sel?26:0);   // collect token: round, icon-led, amount underneath
   add(`<g data-act="collect" data-v="${k}" transform="translate(${cx.toFixed(1)},${cy.toFixed(1)})"><g class="bnc"><circle r="9.5" fill="${cp?'#0d9488':'#16a34a'}" stroke="#0f172a" stroke-width="2"/><circle r="7" fill="${cp?'#14b8a6':'#22c55e'}"/>${cp?'<path d="M-3.4 -2h5a1.1 1.1 0 0 1 1.1 1.1v.7h-4.6a2.5 2.5 0 1 1-1.5-1.8z" fill="#fff"/>':'<text y="3.6" text-anchor="middle" font-size="10" font-weight="900" fill="#fff" font-family="Nunito">$</text>'}</g><text y="19" text-anchor="middle" font-family="Teko,sans-serif" font-weight="600" font-size="9.5" fill="#fff" ${out()}>${cp?'':'$'}${C.short(amt)}</text></g>`)}
 }
 return parts.join('')}

const view4=()=>iso(K4,W4/2,150);
window.CFC.campusLayers=(car)=>{const I=view4(),C=window.CFC;
 const key=JSON.stringify([car.college,car.b,car.queue.map(q=>q.key+q.to),testRender(),Object.keys(SEEN).filter(h=>SEEN[h]==='bad'),Object.keys(STAD).filter(k=>STAD[k]!=='busy'),Object.keys(TOWER).filter(k=>TOWER[k]!=='busy')]);
 return {key,svg:`<svg viewBox="0 0 ${W4} ${H4}" width="${W4}" height="${H4}" xmlns="http://www.w3.org/2000/svg" style="display:block">${renderBase(I,car,{})}<g id="camOver"></g></svg>`,over:()=>renderOver(I,car,{})}};
window.CFC.campusSVG=(car,opts={})=>opts.preview
 ?`<svg viewBox="100 60 520 560" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%">${renderBase(view4(),car,opts)}</svg>`
 :`<svg viewBox="0 0 ${W4} ${H4}" width="${W4}" height="${H4}" xmlns="http://www.w3.org/2000/svg" style="display:block">${renderBase(view4(),car,opts)}<g id="camOver">${renderOver(view4(),car,opts)}</g></svg>`;
window.CFC.campusSize=[W4,H4];
// where a building sits on the map (svg units), so the map can pan to it
window.CFC.plotPoint=k=>{const p=window.CFC.PLOTS.find(x=>x.b===k);if(!p)return null;const [x,y]=cell(p.s,p.d),sz=p.span?STEP+S:S;return view4().P(x+sz/2,y+sz/2,0)};
// A single building at a given level, for cards and lists: cropped to the building and its own ground, no green backdrop (FEEDBACK 77)
window.CFC.buildingThumb=function(k,lvl,car,w=200,h=150){const C=window.CFC,col=C.college(car);C1=col.c1;C2=col.c2;const sz=k==='stadium'?STEP+S:S;
 const Kk=w/(2*sz)*.98,I=iso(Kk,w/2,h-sz*Kk-2);
 const body=lvl>0?drawBuilding(I,k,0,0,sz,lvl):plotTile(I,0,0,sz,'plot_empty',()=>emptyPlot(I,0,0,sz,''));
 return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;overflow:visible">${DEFS}${body}</svg>`};
})();
