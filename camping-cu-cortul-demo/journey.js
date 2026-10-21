/* Narrative choices only. No location tracking, booking service, or network access. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const form=$('#booking-form'),choices=$$('input[name="journey-arrival"]');
  const defaultView={title:$('#ascent-title').innerHTML,description:$('#route-description').textContent,note:$('#route-note').textContent,items:[...$('#route-checklist').children].map(e=>e.textContent)};
  function setRoute(key,updateBooking=true){
    const route=window.CampingJourney.routeFor(key);
    choices.forEach(c=>c.checked=c.value===key);
    if(route){
      $('#ascent-title').textContent=route.title;$('#route-label').textContent=route.label.toUpperCase();$('#route-overline').textContent='URCAREA TA';$('#route-description').textContent=route.description;$('#route-note').textContent=route.note;$('#route-number').textContent=route.number;$('#route-duration').textContent=route.duration;
      $('#route-checklist').replaceChildren(...route.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
      $('#journey-choice-status').textContent=`Ai ales: ${route.label.toLowerCase()}. Varianta este pregătită și în cererea demo.`;
      $('#journey-booking-choice').textContent=`Planul tău de acces: ${route.bookingValue}. Îl poți modifica în formular.`;
      if(updateBooking){const input=[...form.elements.access].find(i=>i.value===route.bookingValue);input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
    }else{
      $('#ascent-title').innerHTML=defaultView.title;$('#route-label').textContent='DRUM FORESTIER';$('#route-overline').textContent='CUM AJUNGI CONTEAZĂ';$('#route-description').textContent=defaultView.description;$('#route-note').textContent=defaultView.note;$('#route-number').textContent='↗';$('#route-duration').textContent='ULTIMA PARTE A DRUMULUI';
      $('#route-checklist').replaceChildren(...defaultView.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
      $('#journey-choice-status').textContent='Alege o variantă pentru a pregăti urcarea.';
      $('#journey-booking-choice').textContent='Poți alege accesul și în formular.';
    }
  }
  choices.forEach(c=>c.addEventListener('change',()=>setRoute(c.value)));
  form.addEventListener('change',e=>{if(e.target.name==='access'){const key={'Transfer 4×4':'car','SUV 4×4':'4x4','Pe jos':'walk'}[e.target.value];setRoute(key,false);}});
  form.addEventListener('reset',()=>setRoute(null,false));

  const routeDialog=document.createElement('dialog');
  routeDialog.id='route-dialog';routeDialog.setAttribute('aria-label','Traseul orientativ către camping');
  const routeClose=document.createElement('button');routeClose.type='button';routeClose.className='icon-button';routeClose.setAttribute('aria-label','Închide harta');routeClose.textContent='×';
  const enlargedMap=$('.j-satellite').cloneNode(true);
  const mapNote=document.createElement('p');mapNote.textContent='Traseu orientativ din referința furnizată. Marcajul se oprește înaintea poienii. Confirmă cu gazda indicațiile complete, starea drumului, parcarea și punctul de preluare.';
  routeDialog.append(routeClose,enlargedMap,mapNote);document.body.append(routeDialog);
  $('.j-map-open').addEventListener('click',()=>routeDialog.showModal());
  routeClose.addEventListener('click',()=>routeDialog.close());
  routeDialog.addEventListener('close',()=>$('.j-map-open').focus());

  const views=[
    {src:'assets/mountain.jpg',photo:1,alt:'Panorama reală a munților văzuți de la camping',credit:'FOTO DIN SITE-UL CAMPINGULUI',eyebrow:'CAMPING LA MUNTE LA DRAGOSLAVELE',title:'Merită să<br><em>rămâi puțin.</em>',description:'Valea în față. Cortul tău, undeva aici. Restul weekendului încă nu are program.',className:''},
    {src:'assets/camping-maps.jpg',photo:0,alt:'Cort în pajiștea campingului, lângă amenajarea unui grup de cercetași',credit:'EUGEN MITRICA / GOOGLE MAPS / AUG. 2025',eyebrow:'CU PROPRIUL CORT',title:'Un loc pentru<br><em>lumea ta.</em>',description:'Așa arată o campare surprinsă de un vizitator. Platforma potrivită și spațiul necesar grupului se confirmă cu gazda.',className:'tent-view'},
    {src:'assets/fire.jpg',photo:2,alt:'Foc într-un grătar de zidărie fotografiat de Denisa Vladau',credit:'DENISA VLADAU / GOOGLE MAPS / MAI 2026',eyebrow:'DUPĂ CE SE LASĂ SEARA',title:'Mai stăm<br><em>la o poveste.</em>',description:'Locuri amenajate pentru grătar și foc. Pentru grupuri, confirmă cu gazda muzica, orele de liniște și folosirea spațiilor comune.',className:'fire-view'}
  ];
  $$('.j-view-switch button').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.view),view=views[index];
    $$('.j-view-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    $('#arrival-image').src=view.src;$('#arrival-image').alt=view.alt;$('#arrival-credit').textContent=view.credit;$('#arrival-eyebrow').textContent=view.eyebrow;$('#arrival-title').innerHTML=view.title;$('#arrival-description').textContent=view.description;$('.j-enlarge').dataset.photo=String(view.photo);
    $('.j-arrival-stage').classList.remove('tent-view','fire-view');if(view.className)$('.j-arrival-stage').classList.add(view.className);
  }));

  const chapters=$$('.j-chapter'),links=$$('.j-rail li a'),fill=$('.trail-fill');
  let scheduled=false,current=-1;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function updateProgress(){
    scheduled=false;const threshold=innerHeight*.45;let active=0;
    chapters.forEach((section,i)=>{if(section.getBoundingClientRect().top<=threshold)active=i;});
    if(active!==current){current=active;links.forEach((link,i)=>{if(i===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});fill.style.strokeDashoffset=String(100-window.CampingJourney.chapterProgress(active));}
    if(!reduced.matches){const top=$('#plecarea').getBoundingClientRect().top;$('.j-photo-window').style.setProperty('--hero-shift',`${Math.max(-15,Math.min(15,-top*.025))}px`);}
  }
  function onScroll(){if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);updateProgress();
  // Anchor destinations receive keyboard focus without capturing wheel/touch scrolling.
  $$('.j-rail a,.j-arrow-link,.j-shortcut').forEach(link=>link.addEventListener('click',()=>{const target=$(link.getAttribute('href'));if(target){target.tabIndex=-1;target.focus({preventScroll:true});}}));
})();
