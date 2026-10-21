(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const section=$('#drum'),stage=$('.p-travel-stage'),range=$('#travel-range'),line=$('.p-route-svg .j-user-track'),traveller=$('#route-traveller');
  const pathLength=line.getTotalLength();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=[
    {overline:'01 / DE LA DN73',title:'De aici începe<br><em>urcarea.</em>',description:'La baza drumului forestier te preia transferul campingului, cu tot cu bagajele. În cerere spui doar la ce oră ajungi.'},
    {overline:'02 / PRIN PĂDURE',title:'Ultima bucată<br><em>e pe drum forestier.</em>',description:'Poți urca cu un SUV 4×4, cu transferul campingului sau pe jos. Mai jos alegi varianta potrivită pentru tine.'},
    {overline:'03 / ÎN POIANĂ',title:'Aici ajungi.<br><em>Cu cortul tău.</em>',description:'Patru platforme amenajate, cu munții în față. Alegi locul și îți montezi cortul.'}
  ];let phase=-1,scheduled=false;
  function render(p){
    const progress=Math.max(0,Math.min(1,p)),next=window.CampingMobile.travelPhase(progress);
    stage.style.setProperty('--travel-progress',String(progress));stage.style.setProperty('--map-shift',String(78-progress*44));stage.style.setProperty('--arrival-opacity',String(Math.max(0,(progress-.79)/.21)));
    const point=line.getPointAtLength(pathLength*progress);traveller.setAttribute('cx',point.x);traveller.setAttribute('cy',point.y);range.value=String(Math.round(progress*100));
    if(next!==phase){phase=next;const scene=scenes[phase];$('#travel-overline').textContent=scene.overline;$('#travel-title').innerHTML=scene.title;$('#travel-description').textContent=scene.description;$('#travel-position').textContent=`${phase+1} / 3`;range.setAttribute('aria-valuetext',['Șosea — începutul urcării','Drumul prin pădure','Sosirea în poiană'][phase]);$$('[data-travel-phase]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.travelPhase)===phase)));}
  }
  const headerHeight=()=>$('.p-header').offsetHeight;
  function sync(){scheduled=false;if(reduced.matches)return;const top=section.getBoundingClientRect().top+scrollY;render(window.CampingMobile.travelProgress(scrollY+headerHeight(),top,section.offsetHeight,stage.offsetHeight));}
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(sync);}}
  function go(progress){if(reduced.matches){render(progress);return;}const top=section.getBoundingClientRect().top+scrollY;scrollTo({top:top-headerHeight()+progress*Math.max(1,section.offsetHeight-stage.offsetHeight),behavior:'instant'});render(progress);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',()=>{render(0);schedule();});
  range.addEventListener('input',()=>go(Number(range.value)/100));$$('[data-travel-phase]').forEach(b=>b.addEventListener('click',()=>go([0,.47,.98][Number(b.dataset.travelPhase)])));
  render(0);sync();
  const form=$('#booking-form');
  const transport={car:{value:'Transfer 4×4',title:'Cu mașina obișnuită? O lași jos.',description:'De la baza drumului forestier te preia transferul campingului, cu tot cu bagajele, și te urcă în circa 5 minute. La plecare te coboară la fel.',meta:'Transfer 4×4: 50 lei pe cursă, nu de persoană.'},'4x4':{value:'SUV 4×4',title:'Cu un SUV 4×4, verifici drumul înainte.',description:'Urci singur în circa 5 minute de la asfalt. Indicațiile pentru ultimul segment le primești de la gazdă.',meta:'Timp orientativ. Accesul depinde de vehicul, vreme și starea drumului.'},walk:{value:'Pe jos',title:'Pe jos, pregătește bagajele pentru urcare.',description:'Cam 30 de minute de la asfalt, prin pădure. Ia un rucsac comod pentru echipament.',meta:'Durată orientativă publicată de camping.'}};
  function selectTransport(key,update=true){const data=transport[key]||transport.car;$$('[data-transport]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.transport===key)));$('#transport-title').textContent=data.title;$('#transport-description').textContent=data.description;$('#transport-meta').textContent=data.meta;if(update&&transport[key]){const input=[...form.elements.access].find(i=>i.value===data.value);input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}}
  $$('[data-transport]').forEach(b=>b.addEventListener('click',()=>selectTransport(b.dataset.transport)));
  form.addEventListener('change',e=>{if(e.target.name==='access')selectTransport({'Transfer 4×4':'car','SUV 4×4':'4x4','Pe jos':'walk'}[e.target.value],false);});
  form.addEventListener('reset',()=>selectTransport(null,false));
  const dock=$('#booking-dock');
  new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;dock.classList.toggle('is-hidden',visible);dock.inert=visible;},{threshold:.08}).observe($('#disponibilitate'));
})();
