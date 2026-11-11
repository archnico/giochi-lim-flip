/* Illustrated thematic worlds for Pregrafismo Flip — offline, Tizen-safe SVG (ES5). */
(function(w,d){
'use strict';
var ns='http://www.w3.org/2000/svg';
var worlds=['viaggio','monti','arcobaleno','mare','bolle','forme','acqua'];
var palette=[
 {sky:'#eefaff',ground:'#d8f3d8',accent:'#43b0d3'},
 {sky:'#f3f8ff',ground:'#d4edcf',accent:'#6eaeeb'},
 {sky:'#fff6fb',ground:'#e9f8db',accent:'#da8fda'},
 {sky:'#e8faff',ground:'#c6f4f2',accent:'#4fc4df'},
 {sky:'#f4f7ff',ground:'#e9f0ff',accent:'#aa9bdf'},
 {sky:'#fff8ed',ground:'#f3efd3',accent:'#e8bc69'},
 {sky:'#e6faff',ground:'#bceff0',accent:'#2cbbbf'}
];
function node(p,tag,a){
 var e=d.createElementNS(ns,tag),k;
 for(k in a)if(a.hasOwnProperty(k))e.setAttribute(k,a[k]);
 p.appendChild(e);return e;
}
function g(p,x,y,s){return node(p,'g',{transform:'translate('+x+' '+y+') scale('+(s||1)+')'});}
function path(p,v,fill,stroke,width,opacity){var a={d:v,fill:fill||'none'};if(stroke)a.stroke=stroke;if(width)a['stroke-width']=width;if(opacity!==undefined)a.opacity=opacity;return node(p,'path',a)}
function circle(p,x,y,r,c,stroke,wd,opacity){var a={cx:x,cy:y,r:r,fill:c};if(stroke)a.stroke=stroke;if(wd)a['stroke-width']=wd;if(opacity!==undefined)a.opacity=opacity;return node(p,'circle',a)}
function ellipse(p,x,y,rx,ry,c,opacity){return node(p,'ellipse',{cx:x,cy:y,rx:rx,ry:ry,fill:c,opacity:opacity===undefined?1:opacity})}
function rect(p,x,y,wd,ht,rad,c,stroke,sw){var a={x:x,y:y,width:wd,height:ht,rx:rad,fill:c};if(stroke)a.stroke=stroke;if(sw)a['stroke-width']=sw;return node(p,'rect',a)}
function line(p,x1,y1,x2,y2,color,wd){return node(p,'line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:color,'stroke-width':wd,'stroke-linecap':'round'})}
function cloud(p,x,y,s){var a=g(p,x,y,s);ellipse(a,0,17,55,20,'#fff',.84);circle(a,-22,4,27,'#fff');circle(a,7,-5,32,'#fff');circle(a,40,7,26,'#fff');return a}
function sun(p,x,y,s){var a=g(p,x,y,s),i,ang;circle(a,0,0,41,'#fff5ae','#ffd481',5,.9);for(i=0;i<8;i++){ang=Math.PI*i/4;line(a,Math.cos(ang)*51,Math.sin(ang)*51,Math.cos(ang)*67,Math.sin(ang)*67,'#ffdc7b',6)}circle(a,-14,-5,3.8,'#b48a3a');circle(a,14,-5,3.8,'#b48a3a');path(a,'M -12 12 Q 0 25 12 12','none','#b48a3a',3);return a}
function fish(p,x,y,s,color){var a=g(p,x,y,s);path(a,'M -40 0 L -89 -35 Q -70 0 -89 35 Z',color,'#47819f',4);ellipse(a,1,0,52,34,color);path(a,'M -16 -24 Q 0 -54 25 -28','none','#fff',6,.7);circle(a,26,-5,7,'#fff');circle(a,28,-5,3,'#254a67');path(a,'M 32 12 Q 16 23 5 14','none','#38718b',3);path(a,'M -10 22 Q 4 45 21 20',color,'#47819f',3);return a}
function dolphin(p,x,y,s){var a=g(p,x,y,s);path(a,'M -84 8 Q -37 -63 28 -33 Q 54 -17 76 -24 L 95 -32 L 83 -14 Q 70 4 41 13 Q 11 21 -15 38 L -36 58 L -30 25 Q -66 31 -84 8 Z','#50b8d5','#3088b0',5);path(a,'M -18 -30 L -4 -67 L 25 -33','#50b8d5','#3088b0',5);path(a,'M -77 10 L -112 -18 L -111 41 Z','#62c7dd','#3088b0',4);circle(a,55,-14,5.5,'#fff');circle(a,57,-14,2.9,'#195877');path(a,'M 68 -3 Q 80 10 92 -5','none','#196481',3);return a}
function turtle(p,x,y,s){var a=g(p,x,y,s);ellipse(a,-24,37,28,17,'#76cba5');ellipse(a,42,37,28,17,'#76cba5');ellipse(a,-16,-25,24,18,'#76cba5');ellipse(a,41,-25,24,18,'#76cba5');ellipse(a,9,8,67,49,'#7bc89d');ellipse(a,9,8,56,41,'#58aa83');path(a,'M -24 -14 L 9 -32 L 40 -13 L 38 24 L 9 41 L -24 24 Z','none','#9ae1b3',5);circle(a,77,8,29,'#9cdfb1');circle(a,87,2,5,'#fff');circle(a,88,2,2.6,'#27665c');path(a,'M 86 17 Q 75 26 65 16','none','#398879',3);return a}
function octopus(p,x,y,s){var a=g(p,x,y,s);path(a,'M -52 6 Q -73 58 -50 72 Q -31 82 -23 61 Q -30 97 -5 94 Q 14 96 15 67 Q 23 98 45 88 Q 58 81 43 61 Q 62 82 78 66 Q 92 54 67 7 Z','#b39bea','#856bc7',4);ellipse(a,6,-8,62,56,'#baa5ed');ellipse(a,-16,-16,16,20,'#fff');ellipse(a,29,-16,16,20,'#fff');circle(a,-10,-15,6,'#4f5594');circle(a,33,-15,6,'#4f5594');path(a,'M -6 20 Q 10 36 26 20','none','#6660a6',5);return a}
function butterfly(p,x,y,s){var a=g(p,x,y,s);ellipse(a,-36,-20,36,30,'#ffa3d3');ellipse(a,40,-20,36,30,'#ffa3d3');ellipse(a,-31,25,32,32,'#ffd18d');ellipse(a,33,25,32,32,'#ffd18d');ellipse(a,1,0,12,52,'#775b9b');circle(a,0,-48,17,'#775b9b');circle(a,-5,-52,3,'#fff');circle(a,5,-52,3,'#fff');path(a,'M -8 -59 Q -24 -85 -31 -74 M 8 -59 Q 23 -88 30 -77','none','#775b9b',4);circle(a,-42,-20,7,'#ffedfb');circle(a,45,-20,7,'#ffedfb');return a}
function rainbow(p,x,y,s){var a=g(p,x,y,s);path(a,'M -176 96 C -152 -152 152 -152 176 96','none','#f9a6b4',16,.7);path(a,'M -156 96 C -135 -125 134 -125 156 96','none','#ffcf90',16,.7);path(a,'M -135 96 C -110 -98 110 -98 135 96','none','#f9eb92',16,.7);path(a,'M -113 96 C -89 -69 89 -69 113 96','none','#a4e0c4',16,.7);path(a,'M -91 96 C -67 -45 67 -45 91 96','none','#9cdcf3',16,.7);return a}
function flower(p,x,y,s,c){var a=g(p,x,y,s);line(a,0,0,0,55,'#6eaf83',6);for(var i=0;i<5;i++){var t=i*Math.PI*2/5;circle(a,Math.sin(t)*16,Math.cos(t)*16,13,c)}circle(a,0,0,12,'#ffe19b');return a}
function house(p,x,y,s){var a=g(p,x,y,s);rect(a,-64,0,128,105,7,'#ffeac2','#b68b61',5);path(a,'M -78 0 L 0 -70 L 78 0 Z','#f59a9b','#c46c74',5);rect(a,-21,33,42,72,6,'#a4d5dc','#528ba0',4);rect(a,34,17,20,20,3,'#b8edff','#65b4cd',3);rect(a,-51,17,20,20,3,'#b8edff','#65b4cd',3);return a}
function train(p,x,y,s){var a=g(p,x,y,s);rect(a,-74,-12,148,70,16,'#60c1e0','#2c83ad',5);rect(a,-56,-41,56,33,8,'#ffe09c','#dc9b44',4);rect(a,11,-41,47,33,8,'#fff4c4','#d0a34b',4);rect(a,-52,4,40,24,5,'#dbf7ff','#84bcd2',3);rect(a,5,4,40,24,5,'#dbf7ff','#84bcd2',3);circle(a,-42,59,19,'#315d82');circle(a,39,59,19,'#315d82');circle(a,-42,59,7,'#fff');circle(a,39,59,7,'#fff');return a}
function rocket(p,x,y,s){var a=g(p,x,y,s);path(a,'M 0 -88 Q 55 -39 45 38 L -45 38 Q -55 -39 0 -88 Z','#f9faff','#7a9ec2',5);path(a,'M -43 10 L -72 53 L -39 41 M 43 10 L 72 53 L 39 41','#f89a91','#dd6e75',5);circle(a,0,-15,25,'#a7e9f3','#7a9ec2',5);path(a,'M -23 45 L 0 100 L 23 45 Z','#ffd671','#f9a66b',4);return a}
function kite(p,x,y,s){var a=g(p,x,y,s);path(a,'M 0 -70 L 59 -10 L 0 64 L -59 -10 Z','#a7cdf2','#5f91ce',5);path(a,'M 0 -70 L 0 64 L -59 -10 Z','#ffd59d','#d3a66a',4);path(a,'M 0 64 Q 22 102 -10 135 Q -34 160 -7 173','none','#739ebf',4);return a}
function bubble(p,x,y,r){circle(p,x,y,r,'#d8faff','#93dbe6',4,.8);ellipse(p,x-r*.27,y-r*.32,r*.28,r*.15,'#fff',.9)}
function waves(p,y,col,op){var a=path(p,'M 0 '+y+' Q 75 '+(y-24)+' 150 '+y+' T 300 '+y+' T 450 '+y+' T 600 '+y+' T 750 '+y+' T 900 '+y+' T 1050 '+y+' L 1050 610 L 0 610 Z',col);a.setAttribute('opacity',op)}
function base(p,ci,li){
 var pal=palette[ci];rect(p,0,0,1000,600,0,pal.sky);
 // light speckled backgrounds are drawn with plain SVG: no external resources.
 for(var i=0;i<11;i++){
  var x=30+(i*137+li*17)%950,y=35+(i*71+li*23)%520;
  circle(p,x,y,3+(i%4),i%2?'#fff':'#b9dff1',null,null,.45);
 }
 ellipse(p,130,45,230,74,'#fff',.3);ellipse(p,800,38,270,80,'#fff',.25);
}
function finishScene(p,ci,li){
 var a=g(p,0,0,1);
 switch(ci){
 case 0:
   path(a,'M 0 527 Q 180 503 350 531 T 690 527 T 1000 529 L 1000 600 L 0 600 Z','#dff1db');
   train(a,114,505,.68);house(a,893,490,.66);cloud(a,240,77,.62);sun(a,896,91,.65);
   flower(a,358,535,.55,'#fca3c5');flower(a,714,547,.52,'#9bdaf8');break;
 case 1:
   path(a,'M 0 600 L 0 500 L 185 360 L 315 510 L 500 332 L 730 550 L 852 395 L 1000 521 L 1000 600 Z','#d1e9d6',null,null,.7);
   path(a,'M 0 600 L 0 535 L 220 423 L 315 510 L 502 390 L 700 556 L 853 457 L 1000 542 L 1000 600 Z','#bae1d3',null,null,.55);
   kite(a,112,139,.58);rocket(a,900,150,.65);cloud(a,340,85,.52);sun(a,710,91,.52);break;
 case 2:
   rainbow(a,515,165,1.18);cloud(a,260,93,.58);cloud(a,767,101,.66);
   butterfly(a,102,455,.72);flower(a,270,543,.82,'#f99ad0');flower(a,750,540,.9,'#a4b8ff');flower(a,900,520,.8,'#ffd18d');
   path(a,'M 0 576 Q 250 537 500 574 T 1000 577 L 1000 600 L 0 600 Z','#daf6dd',null,null,.65);break;
 case 3:
   waves(a,505,'#c6f1fa',.7);waves(a,544,'#b5e6f6',.62);
   dolphin(a,155,485,.72);fish(a,865,499,.69,'#ffbf84');sun(a,867,80,.54);
   bubble(a,85,135,19);bubble(a,916,170,24);bubble(a,820,210,14);break;
 case 4:
   bubble(a,119,129,55);bubble(a,850,118,65);bubble(a,750,228,26);bubble(a,180,251,23);
   octopus(a,140,510,.69);fish(a,874,504,.69,'#ffcf7c');
   waves(a,548,'#d5e6fb',.6);break;
 case 5:
   house(a,123,484,.65);kite(a,893,169,.57);train(a,870,507,.62);
   flower(a,317,540,.7,'#ffa3b8');flower(a,665,540,.66,'#9ed7f0');sun(a,180,99,.55);
   path(a,'M 0 558 Q 160 548 300 557 T 600 557 T 900 557 L 1000 557 L 1000 600 L 0 600 Z','#eaf4db',null,null,.75);break;
 case 6:
   waves(a,508,'#b8eef4',.67);waves(a,549,'#9adfe9',.56);
   turtle(a,136,483,.68);dolphin(a,862,495,.72);fish(a,589,546,.32,'#ffa985');
   bubble(a,102,161,20);bubble(a,863,123,29);bubble(a,785,217,17);bubble(a,204,94,14);
   path(a,'M 44 598 Q 25 537 51 513 Q 69 563 66 598 M 93 598 Q 74 539 114 500 Q 112 557 106 598','none','#5bb89f',9,.7);
   path(a,'M 942 598 Q 922 540 949 508 Q 965 555 964 598 M 988 598 Q 960 536 996 508','none','#5bb89f',9,.7);break;
 }
}
function render(ci,li,board){
 if(!board||ci<0)return;
 var groupNode=d.getElementById('scene-illustration');
 if(!groupNode){
  groupNode=d.createElementNS(ns,'g');groupNode.setAttribute('id','scene-illustration');
  groupNode.setAttribute('pointer-events','none');
  var tracks=d.getElementById('tracks');
  if(tracks)board.insertBefore(groupNode,tracks);else board.appendChild(groupNode);
 }
 while(groupNode.firstChild)groupNode.removeChild(groupNode.firstChild);
 base(groupNode,ci,li);
 finishScene(groupNode,ci,li);
 var wrap=board.parentNode;if(wrap&&wrap.className){
  wrap.className=String(wrap.className).replace(/\bworld-\w+\b/g,'').replace(/\s+$/,'')+' world-'+worlds[ci];
 }
}
function character(p,ci,x,y,s){
 switch(ci){
  case 0:return train(p,x,y,s);
  case 1:return rocket(p,x,y,s);
  case 2:return butterfly(p,x,y,s);
  case 3:return dolphin(p,x,y,s);
  case 4:return octopus(p,x,y,s);
  case 5:return fish(p,x,y,s,'#ffbd83');
  default:return turtle(p,x,y,s);
 }
}
function sideArt(parent,ci,which){
 if(!parent)return;
 while(parent.firstChild)parent.removeChild(parent.firstChild);
 var pal=palette[ci];
 circle(parent,110,200,96,'#fffefa',pal.accent,7,.87);
 circle(parent,110,200,80,pal.sky,null,null,.9);
 var item=null;
 if(which===0)item=character(parent,ci,110,208,.73);
 else{
  switch(ci){
   case 0:item=house(parent,110,230,.67);break;
   case 1:item=kite(parent,110,225,.72);break;
   case 2:item=butterfly(parent,110,208,.73);break;
   case 3:item=fish(parent,110,208,.73,'#ffb583');break;
   case 4:item=fish(parent,110,208,.73,'#ffca7f');break;
   case 5:item=house(parent,110,230,.67);break;
   case 6:item=dolphin(parent,110,208,.73);break;
  }
 }
 if(item)item.setAttribute('class','scene-mascot');
 for(var i=0;i<5;i++){
  circle(parent,36+(i*41)%145,65+(i*39)%85,7+i%3*3,pal.accent,null,null,.43);
 }
 if(ci===3||ci===4||ci===6){
  bubble(parent,52,357,22);bubble(parent,160,410,32);bubble(parent,95,460,17);
 }else{
  flower(parent,51,358,.6,'#f8aac8');flower(parent,155,404,.55,'#a7caf6');
 }
}
function renderSides(ci){
 sideArt(d.getElementById('scene-side-left'),ci,0);
 sideArt(d.getElementById('scene-side-right'),ci,1);
}
function placeTraveler(ci,markers,pt){
 var layer=node(markers,'g',{id:'traveler','pointer-events':'none'});
 character(layer,ci,0,0,.34);
 moveTraveler(pt);
}
function moveTraveler(pt){
 var a=d.getElementById('traveler');
 if(a&&pt)a.setAttribute('transform','translate('+pt.x+' '+pt.y+')');
}
w.PregrafismoScene={render:render,worlds:worlds,renderSides:renderSides,placeTraveler:placeTraveler,moveTraveler:moveTraveler};
})(window,document);
