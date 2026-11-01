// Club FC portraits v4: head-and-shoulders, shaded. Players in kit; coaches older (mid-30s to 50s) in staff wear.
// Stand-in for a commissioned layered avatar kit / facesjs.
(function(){
let uid=0;
const sh=(hex,f)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const m=v=>Math.round(f<0?v*(1+f):v+(255-v)*f);return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('')};
const mix=(a,b,t)=>{const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};

function face(o){
 const id='f'+(uid++);const f=o.female;const skin=o.skin,hair=o.hair,coach=o.role==='coach';
 const hairG=coach&&o.grey?mix(hair,'#a8a29e',o.grey):hair;
 const k1=o.k1||'#1e3a8a',k2=o.k2||'#f97316';
 const lip=mix(skin,f?'#b4505e':'#9a5a52',f?.45:.3);
 const iris=o.eyes||'#4b3621';
 const s=[];
 s.push(`<defs>
  <radialGradient id="${id}sk" cx=".38" cy=".34" r=".78"><stop offset="0" stop-color="${sh(skin,.14)}"/><stop offset=".62" stop-color="${skin}"/><stop offset="1" stop-color="${sh(skin,-.2)}"/></radialGradient>
  <linearGradient id="${id}nk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(skin,-.28)}"/><stop offset=".5" stop-color="${sh(skin,-.1)}"/><stop offset="1" stop-color="${skin}"/></linearGradient>
  <linearGradient id="${id}hr" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${sh(hairG,.22)}"/><stop offset=".5" stop-color="${hairG}"/><stop offset="1" stop-color="${sh(hairG,-.25)}"/></linearGradient>
  <radialGradient id="${id}jr" cx=".45" cy=".25" r=".9"><stop offset="0" stop-color="${sh(o.top||k1,.22)}"/><stop offset=".7" stop-color="${o.top||k1}"/><stop offset="1" stop-color="${sh(o.top||k1,-.3)}"/></radialGradient>
  <radialGradient id="${id}bl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e86a6a" stop-opacity=".22"/><stop offset="1" stop-color="#e86a6a" stop-opacity="0"/></radialGradient>
 </defs>`);
 // ---- back hair (behind head) ----
 const back={
  pony:`<path d="M76 38 C92 40 96 62 90 80 C88 90 82 96 78 92 C84 80 86 62 78 50Z" fill="url(#${id}hr)"/>`,
  long:`<path d="M34 60 C30 30 46 15 60 15 C75 15 91 30 86 60 L90 98 C84 102 78 100 76 96 L78 52 L42 52 L44 96 C42 100 36 102 30 98Z" fill="url(#${id}hr)"/>`,
  bob:`<path d="M33 64 C29 30 45 15 60 15 C75 15 91 30 87 64 C86 72 81 75 78 72 L78 46 L42 46 L42 72 C39 75 34 72 33 64Z" fill="url(#${id}hr)"/>`,
  braids:`<g fill="url(#${id}hr)">${[0,1,2,3,4,5].map(i=>`<ellipse cx="${35-i*.4}" cy="${60+i*7}" rx="3.6" ry="4.4"/><ellipse cx="${85+i*.4}" cy="${60+i*7}" rx="3.6" ry="4.4"/>`).join('')}</g>`,
  afro:`<g fill="url(#${id}hr)">${[[60,26,22],[42,32,14],[78,32,14],[36,46,11],[84,46,11],[50,20,12],[70,20,12]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`,
  bun:`<circle cx="60" cy="13" r="9.5" fill="url(#${id}hr)"/><circle cx="57" cy="10" r="3" fill="${sh(hairG,.3)}" opacity=".5"/>`};
 if(back[o.style])s.push(back[o.style]);
 // ---- torso ----
 const T=o.top||k1;
 s.push(`<path d="M8 120 C10 100 27 90 49 87.5 L60 95 L71 87.5 C93 90 110 100 112 120Z" fill="url(#${id}jr)"/>`);
 s.push(`<path d="M27 95 C31 104 32 112 31 120 M93 95 C89 104 88 112 89 120" stroke="rgba(0,0,0,.16)" stroke-width="1.2" fill="none"/>`);
 // neck
 s.push(`<path d="M51.5 68 L51.5 89 Q60 95 68.5 89 L68.5 68Z" fill="url(#${id}nk)"/>`);
 if(!coach){ // player kit: V collar, sleeve trim, crest, chest number
  s.push(`<path d="M47 87.5 L60 100 L73 87.5" fill="none" stroke="${k2}" stroke-width="4" stroke-linejoin="round"/><path d="M47 87.5 L60 100 L73 87.5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`);
  s.push(`<path d="M14 112 Q22 106 30 104 M106 112 Q98 106 90 104" stroke="${k2}" stroke-width="3" fill="none"/>`);
  s.push(`<path d="M78 101 l5 1.6 v4 c0 3 -2.5 4.8 -5 5.6 c-2.5 -.8 -5 -2.6 -5 -5.6 v-4z" fill="${k2}" stroke="#fff" stroke-width=".7"/>`);
  if(o.num)s.push(`<text x="44" y="113" text-anchor="middle" font-family="Graduate,serif" font-size="10" fill="${k2}" opacity=".95">${o.num}</text>`);
 }else if(o.wear==='polo'){
  s.push(`<path d="M47 86 L60 97 L50 99 L42 91Z M73 86 L60 97 L70 99 L78 91Z" fill="${sh(T,.12)}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/>`);
  s.push(`<path d="M60 97 V112" stroke="rgba(0,0,0,.2)" stroke-width=".8"/><circle cx="60" cy="102" r=".9" fill="#e5e7eb"/><circle cx="60" cy="107" r=".9" fill="#e5e7eb"/>`);
  s.push(`<path d="M80 100 l4 1.3 v3 c0 2.4 -2 3.8 -4 4.5 c-2 -.7 -4 -2.1 -4 -4.5 v-3z" fill="${k2}"/>`);
 }else{ // quarter-zip with lanyard + whistle
  s.push(`<path d="M47 84 L47 91 Q60 96 73 91 L73 84 Q60 89 47 84Z" fill="${sh(T,.1)}" stroke="rgba(0,0,0,.2)" stroke-width=".6"/>`);
  s.push(`<path d="M60 93 V120" stroke="#cbd5e1" stroke-width="1.1"/><rect x="58.6" y="94" width="2.8" height="5" rx="1" fill="#e5e7eb"/>`);
  s.push(`<path d="M18 104 Q30 98 40 96" stroke="${k2}" stroke-width="2.4" fill="none"/><path d="M102 104 Q90 98 80 96" stroke="${k2}" stroke-width="2.4" fill="none"/>`);
  s.push(`<path d="M80 101 l4 1.3 v3 c0 2.4 -2 3.8 -4 4.5 c-2 -.7 -4 -2.1 -4 -4.5 v-3z" fill="${k2}"/>`);
  if(o.whistle)s.push(`<path d="M50 90 Q52 104 57 110 M70 90 Q68 104 63 110" stroke="${k2}" stroke-width="1.2" fill="none"/><rect x="55" y="109" width="10" height="5" rx="2.4" fill="#d1d5db" stroke="#6b7280" stroke-width=".6"/>`);
 }
 // jaw shadow onto neck
 s.push(`<ellipse cx="60" cy="74" rx="11" ry="4" fill="${sh(skin,-.35)}" opacity=".45"/>`);
 // ---- ears + head ----
 s.push(`<ellipse cx="37.6" cy="54" rx="4.2" ry="6.6" fill="${sh(skin,-.06)}"/><ellipse cx="38.4" cy="54" rx="2" ry="3.8" fill="${sh(skin,-.25)}" opacity=".5"/>
  <ellipse cx="82.4" cy="54" rx="4.2" ry="6.6" fill="${sh(skin,-.1)}"/><ellipse cx="81.6" cy="54" rx="2" ry="3.8" fill="${sh(skin,-.3)}" opacity=".5"/>`);
 const head=f?'M39.5 46 C39.5 30 48.5 22 60 22 C71.5 22 80.5 30 80.5 46 L80.5 55 C80.5 66.5 72 77 63.2 80.6 Q60 81.8 56.8 80.6 C48 77 39.5 66.5 39.5 55Z'
  :'M38.5 46 C38.5 30 48 22 60 22 C72 22 81.5 30 81.5 46 L81.5 56 C81.5 67.5 74 77 64.6 80.6 Q60 82 55.4 80.6 C46 77 38.5 67.5 38.5 56Z';
 s.push(`<path d="${head}" fill="url(#${id}sk)"/>`);
 if(!coach&&!o.noBlush)s.push(`<ellipse cx="47" cy="62" rx="6" ry="4" fill="url(#${id}bl)"/><ellipse cx="73" cy="62" rx="6" ry="4" fill="url(#${id}bl)"/>`);
 // age detail (coaches): faint lines, a touch heavier lids
 const age=o.age||(coach?45:20),ag=Math.max(0,Math.min(1,(age-28)/24));
 if(coach){s.push(`<path d="M45 57.2 Q49.5 59 54 57.6 M66 57.6 Q70.5 59 75 57.2" stroke="${sh(skin,-.35)}" stroke-width=".55" fill="none" opacity="${(.2+.5*ag).toFixed(2)}"/>`);
  if(age>=34)s.push(`<path d="M53.5 64 Q51.8 68.5 53.6 72 M66.5 64 Q68.2 68.5 66.4 72" stroke="${sh(skin,-.3)}" stroke-width=".7" fill="none" opacity="${(.15+.45*ag).toFixed(2)}"/>`);
  if(age>=42)s.push(`<path d="M50 38 Q60 36.4 70 38 M52 35 Q60 33.8 68 35" stroke="${sh(skin,-.25)}" stroke-width=".5" fill="none" opacity="${(.5*ag).toFixed(2)}"/>`)}
 // ---- eyes ----
 for(const [cx,dir] of [[50,-1],[70,1]]){
  s.push(`<path d="M${cx-6} 52 Q${cx} 47.4 ${cx+6} 52 Q${cx} 55.6 ${cx-6} 52Z" fill="#fbfbf8"/>`);
  s.push(`<circle cx="${cx+.3}" cy="52.1" r="2.75" fill="${iris}"/><circle cx="${cx+.3}" cy="52.1" r="2.75" fill="none" stroke="${sh(iris,-.4)}" stroke-width=".5"/><circle cx="${cx+.3}" cy="52.1" r="1.25" fill="#0b0b0b"/><circle cx="${cx+1.2}" cy="51.1" r=".75" fill="#fff"/>`);
  s.push(`<path d="M${cx-6.4} 52 Q${cx} 46.6 ${cx+6.4} 51.6" fill="none" stroke="#2a1d17" stroke-width="${f?1.5:1.15}" stroke-linecap="round"/>`);
  if(f)s.push(`<path d="M${cx+dir*6.2} ${dir>0?51.4:51.8} l${dir*1.8} -1.4" stroke="#2a1d17" stroke-width="1" stroke-linecap="round"/>`);
  s.push(`<path d="M${cx-5} 53.6 Q${cx} 55.8 ${cx+5} 53.6" fill="none" stroke="${sh(skin,-.3)}" stroke-width=".45" opacity=".7"/>`);
  if(coach&&age>=38)s.push(`<path d="M${cx-6} 50.4 Q${cx} 46 ${cx+6} 50" fill="none" stroke="${sh(skin,-.22)}" stroke-width=".7" opacity=".6"/>`);
 }
 // brows
 const bw=f?1.7:2.5,bc=sh(hairG,-.15);
 s.push(`<path d="M43.5 ${f?45:45.6} Q49 ${f?41.8:42.8} 56 ${f?44:44.4}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/><path d="M64 ${f?44:44.4} Q71 ${f?41.8:42.8} 76.5 ${f?45:45.6}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`);
 // nose
 s.push(`<path d="M61 53 Q61.6 59.5 63.4 62.6" stroke="${sh(skin,-.28)}" stroke-width=".9" fill="none" opacity=".75"/>
  <path d="M56.4 63.4 Q58 65.4 60 64.6 Q62 65.4 63.6 63.4" stroke="${sh(skin,-.38)}" stroke-width="1" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="61.4" rx="2.2" ry="1.4" fill="${sh(skin,.2)}" opacity=".55"/>`);
 // mouth
 s.push(`<path d="M53.6 70 Q57 68.2 60 69.2 Q63 68.2 66.4 70 Q60 71.2 53.6 70Z" fill="${sh(lip,-.12)}"/>
  <path d="M54 70.2 Q60 75.2 66 70.2 Q60 71.6 54 70.2Z" fill="${lip}"/><path d="M57 72.2 Q60 73.2 63 72.2" stroke="${sh(lip,.3)}" stroke-width=".7" fill="none" opacity=".7"/>
  <path d="M53.4 70 Q60 71.4 66.6 70" stroke="${sh(lip,-.4)}" stroke-width=".55" fill="none"/>`);
 // facial hair
 if(o.beard==='stubble')s.push(`<path d="M41 60 C42 72 50 79.5 60 80.5 C70 79.5 78 72 79 60 C76 68 70 71 66 71 Q60 69.4 54 71 C50 71 44 68 41 60Z" fill="${hairG}" opacity=".28"/><path d="M53 68 Q60 66 67 68 Q60 69 53 68Z" fill="${hairG}" opacity=".35"/>`);
 if(o.beard==='beard')s.push(`<path d="M40 58 C40 72 49 82 60 83 C71 82 80 72 80 58 C77 66 72 69.5 66.6 70.4 Q66 75 60 75.6 Q54 75 53.4 70.4 C48 69.5 43 66 40 58Z" fill="url(#${id}hr)" opacity=".95"/><path d="M52.6 68.6 Q60 65.6 67.4 68.6 Q60 69.4 52.6 68.6Z" fill="${hairG}"/>`);
 // ---- front hair ----
 const H=`fill="url(#${id}hr)"`;
 const front={
  fade:`<path d="M37.6 48 C35.4 26 47 17.4 60 17.4 C73.6 17.4 84.6 26 82.4 48 C80.6 40 77.4 34 71 32 C63 30 52 30.4 47 33.4 C41.6 36.4 39.4 42 37.6 48Z" ${H}/><path d="M38.4 46 L38.6 56 M81.6 46 L81.4 56" stroke="${hairG}" stroke-width="2.4" opacity=".35"/>`,
  buzz:`<path d="M38.6 45 C38.6 27 48.4 20.4 60 20.4 C71.6 20.4 81.4 27 81.4 45 C79.6 36.6 73 31 60 31 C47 31 40.4 36.6 38.6 45Z" ${H} opacity=".92"/>`,
  sidepart:`<path d="M37.4 50 C34.6 26 48 16.4 62 17 C76 17.6 86 28 82.6 50 C81.6 41 79.4 35.6 75.6 33.4 C69.6 30.4 60 33.4 51.6 31.4 C44.6 33.4 39.6 40 37.4 50Z" ${H}/><path d="M50 19.6 Q47 25 46 31" stroke="${sh(hairG,-.35)}" stroke-width=".8" fill="none"/><path d="M58 18 Q70 20 76 28" stroke="${sh(hairG,.35)}" stroke-width="1" fill="none" opacity=".6"/>`,
  receding:`<path d="M38.4 50 C37 34 44 24 52 22.6 C50 27 49.6 30 48 33 C43.6 36.6 40.4 42 38.4 50Z" ${H}/><path d="M81.6 50 C83 34 76 24 68 22.6 C70 27 70.4 30 72 33 C76.4 36.6 79.6 42 81.6 50Z" ${H}/><path d="M52 22.6 Q60 20 68 22.6 Q60 23.6 52 22.6Z" ${H} opacity=".7"/>`,
  curly:`<g ${H}>${[[42,34,7.5],[48,26,8],[58,22,8.5],[68,23,8],[76,29,7.5],[80,38,6.5],[40,42,6],[54,30,6],[66,30,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>${[[46,24],[60,18],[72,22],[52,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="${sh(hairG,.35)}" opacity=".45"/>`).join('')}`,
  afro:`<path d="M39 44 C42 34 50 30 60 30 C70 30 78 34 81 44 C79 36 70 28 60 28 C50 28 41 36 39 44Z" fill="${hairG}"/>`,
  pony:`<path d="M36.4 52 C33.4 26 47 16 61 16 C76 16 87.4 27 84.4 52 C82.4 40 77.4 32 66 31 C56 30 46 35 40.4 44 C38.4 47 37.4 50 36.4 52Z" ${H}/><path d="M48 21 Q56 28 62 30 M66 19 Q74 25 78 34" stroke="${sh(hairG,.35)}" stroke-width=".9" fill="none" opacity=".6"/><rect x="77" y="36" width="4" height="5" rx="1.4" fill="${k2}" transform="rotate(25 79 38)"/>`,
  bun:`<path d="M37 50 C35 27 48 18 60 18 C73 18 86 27 83 50 C81 40 76 32 60 31 C45 32 39 40 37 50Z" ${H}/><path d="M60 18 V31" stroke="${sh(hairG,-.3)}" stroke-width=".6" opacity=".6"/>`,
  braids:`<path d="M37 52 C35 27 48 17 60 17 C73 17 86 27 83 52 C81 41 76 32 60 31 C45 32 39 41 37 52Z" ${H}/>${[44,50,56,62,68,74].map(x=>`<path d="M${x} ${x<60?22:21} Q${x-2} 30 ${x-4} 38" stroke="${sh(hairG,-.35)}" stroke-width=".7" fill="none" opacity=".7"/>`).join('')}`,
  bob:`<path d="M37 50 C35 27 48 17 61 17 C75 17 86 28 83 50 C80 38 72 33 64 32 C60 36 52 38 44 38 C40 42 38 46 37 50Z" ${H}/>`,
  long:`<path d="M36.6 54 C34 27 47 16 60 16 C74 16 86 27 83.4 54 C81 40 74 32 62 31 C60 31 59 33 58 31 C48 32 40 40 36.6 54Z" ${H}/><path d="M60 17 Q59 24 59 31" stroke="${sh(hairG,-.35)}" stroke-width=".8" fill="none"/>`};
 s.push(front[o.style]||'');
 if(coach&&o.grey)s.push(`<path d="M38.4 46 L38.6 56" stroke="#d6d3d1" stroke-width="2.6" opacity=".7"/><path d="M81.6 46 L81.4 56" stroke="#d6d3d1" stroke-width="2.6" opacity=".7"/>`);
 if(o.cap){s.push(`<path d="M36 44 C36 25 47 18 60 18 C73 18 84 25 84 44 Q60 38 36 44Z" fill="${o.cap}"/><path d="M36 44 Q60 37 84 44 Q86 48 80 48 Q60 42 40 48 Q34 48 36 44Z" fill="${sh(o.cap,-.25)}"/><path d="M60 18 V40" stroke="rgba(0,0,0,.2)" stroke-width=".6"/><text x="60" y="34" text-anchor="middle" font-family="Graduate,serif" font-size="8" fill="${k2}">CF</text>`)}
 if(o.glasses)s.push(`<g fill="none" stroke="#1f2937" stroke-width="1.15"><rect x="42.6" y="47.4" width="14.6" height="10" rx="3.6"/><rect x="62.8" y="47.4" width="14.6" height="10" rx="3.6"/><path d="M57.2 51 Q60 49.4 62.8 51 M42.6 50.4 L38.6 49 M77.4 50.4 L81.4 49"/></g><path d="M44 49 l4 -1" stroke="#fff" stroke-width=".8" opacity=".6"/>`);
 return s.join('')}
window.faceV4=face;
})();
