/* Diego / Splash e pesca: animazioni episodiche ES5 per Samsung Flip Tizen.
   Niente timer permanenti: il loop e' attivo solo durante schizzi o sorprese. */
(function (w, d) {
  'use strict';
  function min(a,b){return Math.min(a,b);}
  function max(a,b){return Math.max(a,b);}
  function clamp(x,a,b){return max(a,min(b,x));}
  function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}
  var PI=Math.PI;
  var catches=[
    {name:'PESCE',src:'assets/diegoland/pesce-canonico.webp'},
    {name:'POLPO',src:'assets/diegoland/polpo-canonico.webp'},
    {name:'CONCHIGLIA',src:'assets/diegoland/vettori/conchiglia.svg'},
    {name:'SOTTOMARINO',src:'assets/diegoland/acqua-sottomarino-canonico.webp'},
    {name:'CUFFIA',src:'assets/diegoland/vettori/cuffia.svg'},
    {name:'CHITARRA',src:'assets/diegoland/chitarra-canonica.webp'},
    {name:'GRANCHIO',src:'assets/diegoland/vettori/granchio.svg'},
    {name:'CAVALLUCCIO',src:'assets/diegoland/vettori/cavalluccio.svg'}
  ];
  function create(opts){
    var button=d.getElementById('fishBtn');
    var hint=d.getElementById('splashInstruction');
    var notice=d.getElementById('fishNotice');
    var mode='water', phase='trace', engaged=false, progress=0;
    var active=false, wdt=0, hgt=0, reelAt=0, lastCatch=-1, current=null;
    var taps=0, nextBite=5+Math.floor(Math.random()*4), lastBite=-20000;
    var bite=null, images={}, loaded=false, caughtCount=0, biteCount=0;
    function wake(){if(active&&opts.wake)opts.wake();}
    function img(src){
      if(!images[src]){var v=new Image();v.src=src;images[src]=v;}
      return images[src];
    }
    function load(){
      if(loaded)return;loaded=true;
      img('assets/diegoland/squalo-giaguaro-nuoto.webp');
      for(var i=0;i<catches.length;i++)img(catches[i].src);
    }
    function setNotice(value){if(notice)notice.textContent=value;}
    function setMode(next){
      mode=next==='fish'?'fish':'water';
      phase='trace';engaged=false;progress=0;reelAt=0;current=null;
      if(button){
        button.setAttribute('aria-pressed',String(mode==='fish'));
        button.querySelector('span').textContent=mode==='fish'?'ACQUA':'PESCA';
        button.querySelector('img').src=mode==='fish'?'assets/diegoland/onde.svg':'assets/diegoland/vettori/pesce.svg';
        button.setAttribute('aria-label',mode==='fish'?'Torna agli schizzi':'Gioca a pescare');
      }
      if(hint)hint.textContent=mode==='fish'?'SEGUI LA LINEA':'FAI SPLASH!';
      setNotice(mode==='fish'?'PARTI DAL CERCHIO':'');
      wake();
    }
    function enter(){
      active=true;load();setMode('water');
    }
    function leave(){
      active=false;engaged=false;bite=null;phase='trace';progress=0;
      if(notice)notice.textContent='';
    }
    function resize(w,h){wdt=w;hgt=h;wake();}
    function point(t){
      // Curva ampia, sempre dentro lo schermo anche su telefono.
      var x1=wdt*.17,y1=hgt*.30,x2=wdt*.77,y2=hgt*.68;
      return {x:x1+(x2-x1)*t,y:y1+(y2-y1)*t+Math.sin(PI*t)*min(95,hgt*.16)};
    }
    function biteAt(x,y,now){
      bite={x:x,y:y,at:now,side:x<wdt*.5?-1:1};
      lastBite=now;biteCount++;
      if(opts.onBite)opts.onBite();
      wake();
    }
    function choose(){
      var delta=1+Math.floor(Math.random()*(catches.length-1));
      lastCatch=(lastCatch+delta)%catches.length;
      current=catches[lastCatch];caughtCount++;
      if(opts.onCatch)opts.onCatch(current.name);
      setNotice('');
    }
    function advance(x,y,now){
      var tolerance=max(54,min(88,wdt*.078)),best=progress,d=1e8;
      var begin=Math.floor(progress*60),stop=min(60,begin+25);
      for(var i=begin;i<=stop;i++){
        var t=i/60,p=point(t),dd=(x-p.x)*(x-p.x)+(y-p.y)*(y-p.y);
        if(dd<d){d=dd;best=t;}
      }
      if(d>tolerance*tolerance)return;
      progress=max(progress,best);
      if(progress>.96){
        progress=1;engaged=false;phase='reel';reelAt=now;
        choose();wake();
      }
    }
    function pointer(x,y,now,kind){
      if(!active)return false;
      if(mode!=='fish'){
        if(kind==='start'){
          taps++;
          if(taps>=nextBite && now-lastBite>9000 && !bite){
            taps=0;nextBite=5+Math.floor(Math.random()*5);
            biteAt(x,y,now);
          }
        }
        return false;
      }
      if(phase!=='trace')return true;
      if(kind==='end'){engaged=false;return true;}
      if(kind==='start'){
        var p=point(progress),dx=x-p.x,dy=y-p.y;
        // Il bambino puo' continuare da dove aveva lasciato la linea.
        engaged=dx*dx+dy*dy<max(76,wdt*.11)*max(76,wdt*.11);
        if(engaged)setNotice('');
      }
      if(engaged)advance(x,y,now);
      wake();
      return true;
    }
    function stroke(ctx,pts,color,width,dash){
      ctx.beginPath();
      for(var i=0;i<=pts;i++){
        var p=point(i/pts);
        if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
      }
      ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineCap='round';
      if(ctx.setLineDash)ctx.setLineDash(dash||[]);
      ctx.stroke();if(ctx.setLineDash)ctx.setLineDash([]);
    }
    function drawFishing(ctx,now){
      var a=point(0),b=point(1);
      // Cannetta minimale in legno, tratto guida contrastato e punto di partenza grande.
      ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(wdt*.07,hgt*.12);ctx.lineTo(a.x,a.y);
      ctx.strokeStyle='#f7c948';ctx.lineWidth=9;ctx.stroke();
      ctx.beginPath();ctx.moveTo(wdt*.07,hgt*.12);ctx.lineTo(a.x,a.y);
      ctx.strokeStyle='#704b37';ctx.lineWidth=2;ctx.stroke();
      if(phase==='trace'){
        stroke(ctx,45,'rgba(4,47,70,.45)',14,[]);
        stroke(ctx,45,'rgba(255,250,228,.96)',7,[7,17]);
        if(progress>0){
          var last=min(45,Math.floor(progress*45));
          ctx.beginPath();
          for(var i=0;i<=last;i++){var p=point(i/45);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
          ctx.lineWidth=10;ctx.strokeStyle='#f7c948';ctx.stroke();
        }
        var cur=point(progress);
        ctx.beginPath();ctx.arc(cur.x,cur.y,max(22,min(33,wdt*.032)),0,2*PI);
        ctx.fillStyle='#ffe9ae';ctx.fill();
        ctx.lineWidth=6;ctx.strokeStyle='#12354e';ctx.stroke();
        ctx.beginPath();ctx.arc(cur.x,cur.y,9,0,2*PI);
        ctx.fillStyle='#d94c4c';ctx.fill();
        // Piccola boa all'arrivo; non introduce una seconda area da toccare.
        ctx.beginPath();ctx.arc(b.x,b.y,18,0,2*PI);
        ctx.fillStyle='#d94c4c';ctx.fill();
        ctx.lineWidth=5;ctx.strokeStyle='#fff8e7';ctx.stroke();
      }else{
        var elapsed=now-reelAt, rise=ease(elapsed/1050);
        var hx=b.x+(wdt*.51-b.x)*rise, hy=b.y+(hgt*.34-b.y)*rise;
        ctx.beginPath();ctx.moveTo(wdt*.07,hgt*.12);ctx.lineTo(hx,hy);
        ctx.strokeStyle='#fff4cf';ctx.lineWidth=4;ctx.stroke();
        var icon=current&&images[current.src],sz=max(100,min(210,wdt*.21));
        var swing=Math.sin(elapsed*.008)*min(13,(elapsed/160));
        if(icon&&icon.complete&&icon.naturalWidth>0){
          var iw=icon.naturalWidth,ih=icon.naturalHeight,aspect=iw/ih;
          var dw=aspect>1?sz:sz*aspect,dh=aspect>1?sz/aspect:sz;
          ctx.save();ctx.translate(hx,hy+dh*.47);
          ctx.rotate(swing*.007);
          ctx.drawImage(icon,-dw*.5,-dh*.48,dw,dh);ctx.restore();
        }else{
          ctx.beginPath();ctx.arc(hx,hy+35,32,0,2*PI);
          ctx.fillStyle='#f7c948';ctx.fill();
        }
        for(var j=0;j<5;j++){
          var angle=j*PI*.4+elapsed*.001;
          var rx=hx+Math.cos(angle)*max(60,sz*.55),ry=hy+Math.sin(angle)*max(60,sz*.55);
          ctx.beginPath();ctx.arc(rx,ry,4+(j%2)*2,0,2*PI);
          ctx.fillStyle='#ffedb7';ctx.fill();
        }
        if(elapsed>2400){
          phase='trace';progress=0;engaged=false;current=null;reelAt=0;
          setNotice('PARTI DAL CERCHIO');
          // Il frame corrente disegna gia' il nuovo percorso: nessun timer.
          drawFishing(ctx,now);
        }
      }
    }
    function drawBite(ctx,now){
      if(!bite)return;
      var t=(now-bite.at)/880;
      if(t>=1){bite=null;return;}
      var fly=ease(min(1,t/.55)),fade=t>.72?(1-t)/.28:1;
      var side=bite.side,shift=(1-fly)*(max(110,min(235,wdt*.17)));
      var x=bite.x+side*shift,y=bite.y+Math.sin((1-fly)*PI)*30-35*(1-fly);
      var sz=max(130,min(230,wdt*.23)),shark=images['assets/diegoland/squalo-giaguaro-nuoto.webp'];
      ctx.save();ctx.globalAlpha=clamp(fade,0,1);
      ctx.translate(x,y);ctx.rotate(side*(1-fly)*.17);
      // Non esistono denti, ferite o vibrazioni: e' un semplice morsetto a sorpresa.
      if(shark&&shark.complete&&shark.naturalWidth>0){
        var aspect=shark.naturalWidth/shark.naturalHeight;
        var dw=sz,dh=sz/max(.7,aspect);
        ctx.drawImage(shark,-dw*.5,-dh*.5,dw,dh);
      }else{
        ctx.beginPath();ctx.ellipse(0,0,sz*.36,sz*.2,0,0,2*PI);
        ctx.fillStyle='#db9c52';ctx.fill();
        ctx.beginPath();ctx.moveTo(0,-sz*.15);ctx.lineTo(sz*.12,-sz*.35);
        ctx.lineTo(sz*.2,-sz*.12);ctx.fill();
      }
      ctx.restore();
      if(t>.35){
        ctx.beginPath();ctx.ellipse(bite.x,bite.y,16+(t-.35)*80,8+(t-.35)*33,0,0,2*PI);
        ctx.strokeStyle='rgba(255,249,232,'+clamp((1-t)*1.6,0,1)+')';
        ctx.lineWidth=4;ctx.stroke();
      }
    }
    function draw(ctx,now){
      if(!active||!wdt||!hgt)return;
      if(mode==='fish')drawFishing(ctx,now);
      if(bite)drawBite(ctx,now);
    }
    function animating(){return active&&(!!bite||(mode==='fish'&&phase==='reel'));}
    if(button)button.addEventListener('click',function(){if(active)setMode(mode==='fish'?'water':'fish');});
    return {
      enter:enter,leave:leave,resize:resize,pointer:pointer,draw:draw,animating:animating,
      switchMode:setMode,
      state:function(){return {mode:mode,phase:phase,progress:progress,catchName:current?current.name:null,
        catches:caughtCount,bites:biteCount,active:active,nextBite:nextBite};},
      point:point
    };
  }
  w.DiegoAcquaSorprese={create:create};
}(window,document));
