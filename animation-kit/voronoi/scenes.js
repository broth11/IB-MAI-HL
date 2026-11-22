const sites = { A: [-4, 0], B: [8, 0], C: [0, 4], D: [0, -4] };
const colors = { A: '@b', B: '@a', C: '@pos', D: '@neg' };
const V = [2, -2], V1 = [0, 0], V2 = [3, 0];
const box = [-8.5, -8.75, 11, 7.35];
const scale = 24.5, ox = 269, oy = 289;
const sx = x => ox + scale*x, sy = y => oy - scale*y;
const mix = (a,b,p) => a.map((x,i) => x + (b[i]-x)*p);
const dist = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
const attrs = points => points.map(([x,y]) => sx(x)+','+sy(y)).join(' ');
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function unicodeTex(value) {
  return String(value).replaceAll('−','-').replaceAll('²','^2').replaceAll('₁','_1').replaceAll('₂','_2')
    .replaceAll('≤','\\le ').replaceAll('≈','\\approx ').replaceAll('·','\\colon ')
    .replace(/√(\d+)/g,'\\sqrt{$1}');
}
function mathRun(x,y,source,opts) {
  const formula=source.split('$').map((piece,i)=>{
    if(i%2) return unicodeTex(piece);
    if(!piece) return '';
    return '\\textsf{'+piece.replaceAll('&','\\&')+'}';
  }).join('');
  const item=getGlyph(formula);
  const k=Math.min(opts.size/1000,(opts.maxWidth||550)/item.vb[2]);
  const align=opts.align==='end'?1:opts.align==='start'?0:.5;
  const x0=x-(item.vb[0]+item.vb[2]*align)*k;
  const transform='translate('+x0+' '+y+') scale('+k+')';
  const inside=item.inner;
  const halo=opts.halo?'<g fill="none" color="@surface" stroke="@surface" stroke-width="'+(4/k)+'" stroke-linejoin="round" paint-order="stroke">'+inside+'</g>':'';
  return '<g role="img" aria-label="'+esc(source.replaceAll('$',''))+'" data-math-label="true" transform="'+transform+'" color="'+opts.color+'">'+halo+inside+'</g>';
}
function text(x,y,s,opts={}) {
  const {size=22, color='@ink', align='middle', weight=650, halo=false, maxWidth} = opts;
  if(String(s).includes('$')) return mathRun(x,y,s,{size,color,align,halo,maxWidth});
  return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" font-weight="'+weight+'" text-anchor="'+align+'" fill="'+color+'"'+(halo?' paint-order="stroke" stroke="@surface" stroke-width="5" stroke-linejoin="round"':'')+'>'+esc(s)+'</text>';
}
function line(a,b,color='@ink',w=3,dash='',opacity=1) {
  return '<line x1="'+sx(a[0])+'" y1="'+sy(a[1])+'" x2="'+sx(b[0])+'" y2="'+sy(b[1])+'" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round" opacity="'+opacity+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
}
function rightSquare(o,along,across,color='@ink',size=.45) {
  const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n*size);};
  const add=(a,b)=>a.map((x,i)=>x+b[i]);
  const a=unit(along), b=unit(across);
  return '<g data-right-angle="true">'+line(add(o,a),add(add(o,a),b),color,1.8)+
    line(add(add(o,a),b),add(o,b),color,1.8)+'</g>';
}
function bisectorSquare(pair,color='@ink') {
  const [a,b]=[...pair].map(k=>sites[k]), m=mix(a,b,.5);
  const along=[b[0]-a[0],b[1]-a[1]];
  return rightSquare(m,along,[-along[1],along[0]],color);
}
function circle(a,r,color='@ink',w=2,fill='none',opacity=1) {
  return '<circle cx="'+sx(a[0])+'" cy="'+sy(a[1])+'" r="'+r+'" stroke="'+color+'" stroke-width="'+w+'" fill="'+fill+'" opacity="'+opacity+'"/>';
}
function polygon(points,color,alpha) {
  return '<polygon points="'+attrs(points)+'" fill="'+color+'" opacity="'+alpha+'"/>';
}
function label(p,s,dx,dy,color='@ink',align='middle',size=21) {
  const readable={'@a':'@at','@b':'@bt','@pos':'@pt','@neg':'@nt'};
  return text(sx(p[0])+dx,sy(p[1])+dy,String(s).includes('$')?s:'$'+s+'$',{color:readable[color]||color,align,size,halo:true});
}
function point(p,s,dx,dy,color='@ink',align='middle') {
  return circle(p,5.5,'@surface',2,color)+label(p,s,dx,dy,color,align);
}
function siteDots(names,full=false, values={}) {
  return [...names].map(k=> {
    const offsets = {A:[-11,-12,'end'],B:[12,25,'start'],C:[0,-14,'middle'],D:[0,25,'middle']};
    const [x,dy,align] = offsets[k];
    const y=values[k]&&k==='B'?35:dy;
    const s = values[k] ? k+' · '+values[k] : full ? k+'('+sites[k].join(', ')+')' : k;
    return point(sites[k],s,full&&k==='B'?-8:x,y,colors[k],full&&k==='B'?'end':align);
  }).join('');
}
function grid() {
  let g='';
  for(let x=-8;x<=10;x++) g+=line([x,box[1]],[x,box[3]],'@line',0.65);
  for(let y=-8;y<=7;y++) g+=line([box[0],y],[box[2],y],'@line',0.65);
  g+=line([box[0],0],[box[2],0],'@dot',1.4)+line([0,box[1]],[0,box[3]],'@dot',1.4);
  for(const x of [-6,-4,-2,2,4,6,8,10]) g+=label([x,0],x,0,15,'@muted','middle',12);
  for(const y of [-6,-4,-2,2,4,6]) g+=label([0,y],y,-6,4,'@muted','end',12);
  return g;
}
const bounds = [[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]];
function clip(poly,a,b) {
  const f = p => (b[0]-a[0])*(2*p[0]-a[0]-b[0])+(b[1]-a[1])*(2*p[1]-a[1]-b[1]);
  const out=[];
  for(let i=0;i<poly.length;i++) {
    const p=poly[i], q=poly[(i+1)%poly.length], fp=f(p), fq=f(q);
    if(fp<=1e-8) out.push(p);
    if((fp < -1e-8 && fq > 1e-8)||(fp > 1e-8 && fq < -1e-8)) out.push(mix(p,q,fp/(fp-fq)));
  }
  return out;
}
function cell(site,names) {
  return [...names].filter(k=>k!==site).reduce((poly,k)=>clip(poly,sites[site],sites[k]),bounds);
}
function cells(names,alpha=.11) {
  return [...names].map(k=>polygon(cell(k,names),colors[k],alpha)).join('');
}
function lineRange(origin,direction) {
  let lo=-Infinity,hi=Infinity;
  for(let i=0;i<2;i++) {
    if(!direction[i]) continue;
    const a=(box[i]-origin[i])/direction[i], b=(box[i+2]-origin[i])/direction[i];
    lo=Math.max(lo,Math.min(a,b));
    hi=Math.min(hi,Math.max(a,b));
  }
  return [lo,hi].map(t=>origin.map((x,i)=>x+t*direction[i]));
}
const fullLines={AB:lineRange([2,0],[0,1]),AC:lineRange(V1,[1,-1]),BC:lineRange(V2,[1,2]),
  AD:lineRange(V1,[1,1]),BD:lineRange(V2,[1,-2]),CD:lineRange(V1,[1,0])};
const edges3={AB:[V,fullLines.AB[0]],AC:[V,fullLines.AC[0]],BC:[V,fullLines.BC[1]]};
const edges4={AC:[V1,fullLines.AC[0]],AD:[V1,fullLines.AD[0]],BC:[V2,fullLines.BC[1]],
  BD:[V2,fullLines.BD[1]],CD:[V1,V2]};
function edge(pair,color='@b',w=3,dash='',p=1,opacity=1) {
  return line(pair[0],mix(pair[0],pair[1],p),color,w,dash,opacity);
}
function edges(set, color='@b',p=1) {
  return Object.values(set).map(pair=>edge(pair,color,3.2,'',p)).join('');
}
function vertices() { return point(V1,'V₁',-14,-13,'@ink','end')+point(V2,'V₂',13,24,'@ink','start'); }
function graph(body) {
  return '<clipPath id="plot"><rect x="'+sx(box[0])+'" y="'+sy(box[3])+'" width="'+((box[2]-box[0])*scale)+'" height="'+((box[3]-box[1])*scale)+'"/></clipPath>'+
  '<g clip-path="url(#plot)">'+grid()+body+'</g><rect x="'+sx(box[0])+'" y="'+sy(box[3])+'" width="'+((box[2]-box[0])*scale)+'" height="'+((box[3]-box[1])*scale)+'" fill="none" stroke="@line"/>';
}
function pulse(pt,color,f) {      // one expanding ring; f runs 0 to 1 per pulse, nothing drawn outside it
  if(!(f>0&&f<1)) return '';
  return circle(pt,8+18*f,color,3.2,'none',1-f)+circle(pt,8,color,0,color,.28*(1-f));
}
function pulses(pt,color,u,n=2) { return u>0&&u<1?pulse(pt,color,(u*n)%1):''; }
const clamp01=x=>Math.max(0,Math.min(1,x)), ease=x=>{x=clamp01(x);return x*x*(3-2*x);};
function visuallyHiddenAtStart(p,s) {return '<g opacity="'+Math.min(1,p*2.4)+'">'+s+'</g>';}
function callout(a,b='',color='@ink') {
  return text(300,537,a,{size:24,color,weight:800})+(b?text(300,568,b,{size:20,color:'@muted',weight:600}):'');
}
function screen(data, keys, hint, p) {
  const frame='<rect x="43" y="142" width="514" height="294" rx="7" fill="#fff" stroke="@ink" stroke-width="3"/>';
  const img=data?'<image x="48" y="147" width="504" height="284" href="'+data+'" />':'';
  return visuallyHiddenAtStart(p,frame+img+text(300,484,keys,{size:25,weight:800,color:'@bt'})+
    text(300,523,hint,{size:20,color:'@muted'}));
}
function bisector(i,p) {
  if(i>=4) return bisectorTilted(i,p);
  const P=i<2?[2,4]:i===2?[2,mix([0,1],[0,5],p)[1]]:i===3?[2+2.3*p,5]:[2,4];
  const M=[2,0], A=sites.A,B=sites.B;
  let g=edge([A,B],'@dot',2.8);
  if(i>=1) g+=edge(fullLines.AB,'@b',3.4,'',i===1?p:1)+point(M,'M',0,26)+
    rightSquare(M,[1,0],[0,1]);
  if(i>=2) {
    const foot=i===3?[P[0],0]:M;
    g+=polygon([A,foot,P],'@b',.09)+polygon([B,foot,P],'@a',.13);
    g+=line(A,P,'@b',3)+line(B,P,'@a',3)+point(P,'P',0,-13);
    if(i!==3) g+=line([-.9,-.17],[-1.1,.17],'@ink',2)+line([5.1,-.17],[4.9,.17],'@ink',2);
    if(i===3) g+=line(P,foot,'@dot',2.2,'6 5')+rightSquare(foot,[1,0],[0,1]);
  }
  g+=siteDots('AB',true);
  const copy=[['Start with $A$ and $B$','Draw the segment joining them.'],['$M=(2,0),\\quad x=2$','Bisect $[AB]$ at a right angle.'],
    ['$PA=PB$','Same horizontal leg, same height.'],[p>0?'$PB<PA$':'$PA=PB$','Off the line, one distance is shorter.'],
    ['$PA=PB$ exactly when $x=2$','The perpendicular bisector is the line of ties.']];
  return graph(g)+callout(...copy[i]);
}
function bisectorTilted(i,p) {
  const A=sites.A, B1=[8,-4], M1=[2,-2], P1=[3,1];
  const th=Math.atan2(B1[1]-A[1],B1[0]-A[0]), r1=dist(A,B1);
  const k=i===4?p:1, r=12+(r1-12)*k;
  const B=[A[0]+r*Math.cos(th*k),A[1]+r*Math.sin(th*k)];
  let g=edge([A,B],'@dot',2.8);
  if(i===4) g+='<g opacity="'+(1-p)+'">'+edge(fullLines.AB,'@b',3.4)+point([2,0],'M',0,26)+'</g>';
  if(i>=5) {
    const q=i===5?ease(p/.55):1;
    g+=edge(lineRange(M1,[1,3]),'@b',3.4,'',q)+point(M1,'M',-14,8,'@ink','end');
    if(q>.64) g+=rightSquare(M1,[B1[0]-A[0],B1[1]-A[1]],[-(B1[1]-A[1]),B1[0]-A[0]]);
    const s2=i===5?ease((p-.55)/.45):1;
    if(s2>0) g+='<g opacity="'+s2+'">'+line(A,P1,'@b',3)+line(B1,P1,'@a',3)+point(P1,'P',-12,-10,'@ink','end')+'</g>';
  }
  g+=point(A,'A(-4, 0)',-11,-12,colors.A,'end')+point(B,i===4&&p<.9?'B':'B(8, -4)',-8,25,colors.B,'end');
  const copy={4:['Rotate $B$ to $(8,-4)$','Now $[AB]$ is neither horizontal nor vertical.'],
    5:['$PA=PB=\\sqrt{50}$','The bisector $y=3x-8$ still gives equal distances.'],
    6:['$PA=PB$ exactly on the bisector','It works for any positions of $A$ and $B$.']};
  return graph(g)+callout(...copy[i]);
}
function bisectorThree(i,p,_c,tm=1) {
  let g='';
  const triangle=line(sites.A,sites.B,'@dot',2,'6 7')+line(sites.A,sites.C,'@dot',2,'6 7')+line(sites.B,sites.C,'@dot',2,'6 7');
  if(i===6) {
    g+=cells('ABC')+edges(edges3)+circle(V,dist(V,sites.A)*scale,'@a',2.6,'none',.84);
  } else {
    g+=triangle;
    ['AB','AC','BC'].forEach((pair,j)=>{
      if(i<j+1) return;
      const midpoint=mix(sites[pair[0]],sites[pair[1]],.5), now=i===j+1;
      const draw=now?ease((tm-.55)/.45):1;           // now: pulse the sites (0-.32), then the midpoint (.32-.55), then draw
      if(now) g+=line(sites[pair[0]],sites[pair[1]],'@ink',2.6,'6 7')+pulses(sites[pair[0]],colors[pair[0]],tm/.32)+pulses(sites[pair[1]],colors[pair[1]],tm/.32);
      if(draw>0) g+=edge(fullLines[pair],now?'@b':'@dot',now?3.5:2.5,now?'':'7 6',draw);
      if(!now||tm>=.32) g+=circle(midpoint,3.1,'@surface',1.5,'@ink');
      if(now) g+=pulses(midpoint,'@ink',(tm-.32)/.23);
      if(!now||draw>.64) g+=bisectorSquare(pair);
    });
  }
  if(i>=4) g+=point(V,'V (2, −2)',14,24,'@ink','start');
  if(i===5) {
    const r=dist(V,sites.A)*scale;
    const a=Math.atan2(sy(sites.A[1])-sy(V[1]),sx(sites.A[0])-sx(V[0]));
    const q=a+p*Math.PI*2;
    g+=p>=.999?circle(V,r,'@a',3):'<path d="M '+(sx(V[0])+r*Math.cos(a))+' '+(sy(V[1])+r*Math.sin(a))+' A '+r+' '+r+' 0 '+(p>.5?1:0)+' 1 '+(sx(V[0])+r*Math.cos(q))+' '+(sy(V[1])+r*Math.sin(q))+'" fill="none" stroke="@a" stroke-width="3"/>';
    g+=line(V,[2,0],'@a',2,'5 4')+line([2,0],sites.A,'@a',2,'5 4')+line(V,sites.A,'@a',3);
    g+=rightSquare([2,0],[-1,0],[0,-1],'@at')+label([-1,0],'6',0,-10,'@at','middle',18)+label([2,-1],'2',10,3,'@at','start',18);
  }
  g+=siteDots('ABC',i<4);
  const copy=[['Start with three sites','Join each pair to see its midpoint.'],['$\\mathrm{PB}(A,B): x=2$','$[AB]$ is horizontal, so its bisector is vertical.'],
    ['$\\mathrm{PB}(A,C): y=-x$','Through the midpoint, with gradient $-1$.'],['$\\mathrm{PB}(B,C): y=2x-6$','Through $(4,2)$, with gradient $2$.'],
    ['$V=(2,-2)$','All three bisectors meet at the circumcentre.'],
    ['$VA=\\sqrt{6^2+2^2}=2\\sqrt{10}$','That radius reaches $A$, $B$ and $C$.'],
    ['One vertex, three cells','The circle reaches all three sites.']];
  return graph(g)+callout(...copy[i]);
}
function cutoff(i,p,_c,tm=1) {
  let g='';
  if(i===0||i===1) g+=line(sites.C,sites.D,'@dot',2,'6 5')+
    edge(fullLines.CD,'@dot',3,'7 6',i===0?p:1)+(i>0||p>.62?bisectorSquare('CD'):'');
  if(i===1) {
    const q=[-2+6*p,0], nearest=q[0]<0?'A':q[0]>3?'B':null;
    for(const k of nearest?'CD'+nearest:'CD') g+=line(q,sites[k],k===nearest?'@a':'@pos',k===nearest?3.7:2.7)+(tm<1?pulse(sites[k],colors[k],(tm*7)%1):'');
    g+=point(q,'P',0,27);
    g+=label(q,nearest?'$'+nearest+'$ is nearer':'$C$ and $D$ tie for nearest',0,-47,'@ink','middle',18);
  }
  if(i>=2) {
    g+=edge(fullLines.CD,'@dot',2,'6 6');
    g+=edge(edges4.CD,'@b',4,'',i===2?p:1)+vertices();
  }
  if(i>=3) {
    const outer=['AC','AD','BC','BD'];
    if(i===4) g=cells('ABCD')+outer.concat('CD').map(k=>edge(fullLines[k],'@dot',2,'6 6',1,.45)).join('')+edges(edges4)+vertices();
    else {                                          // dashed bisectors first, then the rays on top
      const d=ease(p/.45), r=ease((p-.45)/.55);
      g+=outer.map(k=>edge(fullLines[k],'@dot',2.2,'7 6',d)).join('');
      if(r>0) g+=outer.map(k=>edge(edges4[k],'@b',3.2,'',r)).join('');
    }
  }
  g+=siteDots('ABCD');
  const copy=[['Draw $\\mathrm{PB}(C,D)$','Every point on $y=0$ ties $C$ and $D$.'],['Slide a test point','$A$ or $B$ can be closer than both $C$ and $D$.'],
    ['Keep the segment $0\\le x\\le3$','$x^2+16=(x+4)^2$ or $(x-8)^2$'],
    ['Dash the four bisectors, then keep the rays','Each ray keeps the same nearest pair.'],
    ['Keep only ties for nearest','Four rays and one segment bound the four cells.']];
  return graph(g)+callout(...copy[i]);
}
function addSite(i,p) {
  if(i===11) {
    function miniature(g,x) {return '<g transform="translate('+x+' 175) scale(.46)">'+graph(g).replaceAll('id="plot"','id="mini'+x+'"').replaceAll('#plot','#mini'+x)+' </g>'; }
    const earlier=cells('ABC')+edges(edges3)+point(V,'V',13,16,'@ink','start')+siteDots('ABC');
    const after=cells('ABCD')+edges(edges4)+vertices()+siteDots('ABCD');
    return text(153,203,'Before',{size:25})+text(447,203,'After',{size:25})+
      miniature(earlier,15)+miniature(after,309)+callout('$D$ takes part of each old cell','The old vertex gives way to $V_1$ and $V_2$.');
  }
  let g=cells('ABC',i>=2?.055:.12)+edges(edges3,i>=3?'@dot':'@b');
  if(i<2) g+=point(V,'V',14,24,'@ink','start');
  if(i===1) g+=line(V,sites.D,'@neg',4)+line(V,sites.A,'@dot',2,'7 6');
  if(i===3) {
    g+=edge(fullLines.AD,'@nt',2.3,'7 6',1,1-.78*p)+edge(fullLines.AC,'@bt',2.3,'7 6',1,1-.78*p);
    g+=line(sites.A,sites.D,'@dot',1.6,'5 5')+line(sites.A,sites.C,'@dot',1.6,'5 5')+
      bisectorSquare('AD','@nt')+bisectorSquare('AC','@bt');
    g+=edge(edges4.AD,'@nt',3.8,'',p)+edge(edges4.AC,'@bt',3.8,'',p);
    g+=rightSquare(V1,[-1,-1],[-1,1],'@ink',.4)+point(V1,'V_1(0,0)',12,-13,'@ink','start');
    g+=label([-5.7,5.7],'\\mathrm{PB}(A,C)',22,16,'@bt','start',19);
    g+=label([-5.7,-5.7],'\\mathrm{PB}(D,A)',20,-9,'@nt','start',19);
  }
  if([2,4,5].includes(i)) {
    const seq=['AD','BD','CD'];
    const j= i===2?0:i-3;
    const prev=seq.slice(0,j).reduce((poly,k)=>clip(poly,sites.D,sites[k[0]]),bounds);
    const dpoly=clip(prev,sites.D,sites[seq[j][0]]);
    g+=polygon(dpoly,'@neg',.14*p);
    for(let a=0;a<=j;a++) {
      const k=seq[a];
      g+=edge(fullLines[k],a===j?'@nt':'@dot',a===j?3:2,'7 6',a===j?p:1);
    }
    const opponent=seq[j][0];
    g+=line(sites.D,sites[opponent],'@dot',1.5,'5 5');
    if(p>.65) g+=bisectorSquare(seq[j],'@nt');
  }
  if(i>=6) {                                       // go round the outside, then join the vertices
    g=i===10?cells('ABCD',.12*p):'';
    g+=['AC','AD','BD','BC','CD'].map(k=>edge(fullLines[k],'@dot',2,'7 6')).join('');
    const order=['AC','AD','BD','BC'];
    order.forEach((k,j)=>{
      if(i<6+j) return;
      const [v,far]=edges4[k], q=i===6+j?ease(p):1;
      g+=line(far,mix(far,v,q),'@b',3.6);
    });
    if(i===10) g+=edge(edges4.CD,'@b',4,'',ease(p));
    const v1=i>6||(i===6&&p>.95), v2=i>8||(i===8&&p>.95);
    if(v1) g+=point(V1,'V_1(0,0)',12,-13,'@ink','start');
    if(v2) g+=point(V2,'V_2(3,0)',13,24,'@ink','start');
  }
  g+=siteDots(i===0?'ABC':'ABCD');
  const copy=[['The original three cells','$A$, $B$ and $C$ meet at $V$.'],
    ['Insert $D$ below the $x$-axis','At $V$, $VD = \\sqrt{8}$ and $VA = \\sqrt{40}$.'],
    ['Draw $\\mathrm{PB}(D,A)$','Keep the side of $y=x$ containing $D$.'],
    ['Both edges end at $V_1(0,0)$','$\\mathrm{PB}(D,A)$ meets $\\mathrm{PB}(A,C)$.'],
    ['Compare $D$ with $B$','Trim again at $y=-2x+6$.'],
    ['Compare $D$ with $C$','The upper edge of cell $D$ lies on $y=0$.'],
    ['Edge on $\\mathrm{PB}(A,C)$','Draw in until it meets $\\mathrm{PB}(D,A)$ at $V_1$.'],
    ['Edge on $\\mathrm{PB}(D,A)$','Draw in until it meets $\\mathrm{PB}(A,C)$ at $V_1$.'],
    ['Edge on $\\mathrm{PB}(B,D)$','Draw in until it meets $\\mathrm{PB}(B,C)$ at $V_2$.'],
    ['Edge on $\\mathrm{PB}(B,C)$','Draw in until it meets $\\mathrm{PB}(B,D)$ at $V_2$.'],
    ['Join $V_1$ to $V_2$','The centre edge lies on $\\mathrm{PB}(C,D)$.']];
  return graph(g)+callout(...copy[i]);
}
function emptyCircle(i,p) {
  const hull=[sites.A,sites.D,sites.B,sites.C,sites.A];
  let g=cells('ABCD',.07)+edges(edges4,'@dot');
  for(let j=0;j<4;j++) g+=line(hull[j],hull[j+1],'@ink',2.2,'6 6');
  function candidate(v,names,color,progress,weight=3) {
    return circle(v,dist(v,sites[names[0]])*scale*progress,color,weight,'none')+
      [...names].map(k=>line(v,mix(v,sites[k],progress),color,1.9,'5 6')).join('');
  }
  if(i===1) g+=candidate(V1,'ACD','@b',p);
  if(i===2) g+=candidate(V2,'BCD','@a',p);
  if(i===3) for(let j=0;j<4;j++) {
    const m=mix(hull[j],hull[j+1],.5);
    g+=bisectorSquare(['AD','BD','BC','AC'][j],'@ink')+circle(m,4,'@surface',2,'@b')+label(m,j===0||j===3?'√8':'√20',j===0||j===3?-25:24,j<2?22:-14,'@bt','middle',18);
  }
  if(i>=4) g+=candidate(V1,'ACD','@b',1,i===5?4.5:2)+candidate(V2,'BCD','@a',1,i===4?4.5:2);
  g+=vertices()+siteDots('ABCD');
  const copy=[['Choose a centre in the site region','Distance to the nearest site sets the radius.'],
    ['At $V_1$, the radius is $4$','The circle touches $A$, $C$ and $D$.'],['At $V_2$, the radius is $5$','$\\sqrt{3^2+4^2}=5$. It touches $B$, $C$ and $D$.'],
    ['Check the boundary','Its best clearance is $\\sqrt{20}\\approx4.47$.'],
    ['Waste dump: choose $V_2$','$5\\,\\mathrm{km}$ gives the greatest clearance.'],
    ['Depot: choose $V_1$','$4\\,\\mathrm{km}$ is within the $4.5\\,\\mathrm{km}$ limit.']];
  return graph(g)+callout(...copy[i]);
}
function nearest(i,p) {
  const Q=i===2?[1,2-4*p]:i===3?[1,0]:i===4?V1:[1,2];
  let g=cells('ABCD')+edges(edges4);
  if(i>0) {
    if(Q[1]>=0) g+=line(Q,sites.C,'@pos',3.3,'5 6');
    if(Q[1]<=0) g+=line(Q,sites.D,'@neg',3.3,'5 6');
    if(i===4) g+=line(Q,sites.A,'@b',3.3,'5 6');
    g+=point(Q,i===4?'V_1':'Q',13,Q[1]>0?6:33,'@ink','start');
  }
  g+=siteDots('ABCD',false,{A:'24',B:'18',C:'32',D:'28'});
  return graph(g)+callout(...([
    ['Four rain gauges','Rainfall measurements are in millimetres.'],
    ['Estimate at $Q$: $32\\,\\mathrm{mm}$','$Q$ lies in cell $C$.'],
    [Q[1]>=0?'Cell $C$: $32\\,\\mathrm{mm}$':'Cell $D$: $28\\,\\mathrm{mm}$','The estimate changes across the edge.'],
    ['On an edge, average two values','$\\frac{32+28}{2}=30\\,\\mathrm{mm}$'],
    ['At this vertex, average three values','$\\frac{24+32+28}{3}=28\\,\\mathrm{mm}$'],
    ['Nearest neighbour interpolation','In a cell, use one value. On a tie, average.']][i]));
}
function calculator(i,p,captures) {
  const keys=['MENU → GRAPH','F6 (DRAW)','SHIFT + F5 (G-Solv)','F5 (INTSECT)','The lines meet at $(2,-2)$.'];
  const hints=['Enter $Y_1=-X$ and $Y_2=2X-6$.','Both lines and their crossing are in view.',
    'Open the graph-solving tools.','Read $X=2$ and $Y=-2$.','Both lines give $y=-2$ when $x=2$.'];
  return screen(captures[[0,1,2,3,3][i]],keys[i],hints[i],p);
}
const scenes=[bisector,calculator,bisectorThree,cutoff,addSite,emptyCircle,nearest];
function render(index,config,t,captures) {
  const chapter=config.chapters.findLastIndex(s=>s.t<=t);
  const i=Math.max(0,chapter), s=config.chapters[i];
  const time=Math.max(0,Math.min(1,(t-s.t)/s.reveal)), p=time*time*(3-2*time);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" style="display:block;width:100%;height:100%;font-family:system-ui,sans-serif">'+
    '<rect width="600" height="600" fill="@surface"/>'+
    text(300,49,config.stage,{size:34,weight:850})+
    text(300,80,config.subtitle,{size:20,weight:600,color:'@muted'})+
    scenes[index](i,p,captures,time)+
    text(578,589,'MAI HL · Unit 4B',{size:13,color:'@muted',align:'end',weight:650})+'</svg>';
}
