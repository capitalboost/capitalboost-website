/* Browser-only demonstration. No network calls, storage, cookies or real booking. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const menu=$('.menu-toggle'),nav=$('#navigation');
  const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));});
  nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});

  const photos=window.CampingPhotos||[
    {src:'assets/camping-maps.jpg',alt:'Cort montat în camping, lângă amenajarea unui grup de cercetași',caption:'Zona de corturi · Eugen Mitrica · Google Maps · fotografie afișată ca aug. 2025'},
    {src:'assets/mountain.jpg',alt:'Panoramă spre valea și munții Dragoslavelelor',caption:'Priveliștea campingului · fotografia originală din site-ul oficial'},
    {src:'assets/fire.jpg',alt:'Foc într-un grătar din zidărie',caption:'O seară în camping · Denisa Vladau · Google Maps · fotografie afișată ca mai 2026'}
  ];
  const dialog=$('#photo-dialog');let photoIndex=0,photoTrigger=null;
  function renderPhoto(){const p=photos[photoIndex];$('#dialog-image').src=p.src;$('#dialog-image').alt=p.alt;$('#photo-caption').textContent=p.caption;$('#photo-counter').textContent=`${photoIndex+1} / ${photos.length}`;}
  $$('.photo-button').forEach(b=>b.addEventListener('click',()=>{photoTrigger=b;photoIndex=Number(b.dataset.photo);renderPhoto();dialog.showModal();}));
  $('#close-photo').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>photoTrigger?.focus());
  function movePhoto(delta){photoIndex=(photoIndex+delta+photos.length)%photos.length;renderPhoto();}
  $('#previous-photo').addEventListener('click',()=>movePhoto(-1));$('#next-photo').addEventListener('click',()=>movePhoto(1));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();movePhoto(1);}if(e.key==='ArrowLeft'){e.preventDefault();movePhoto(-1);}});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

  const form=$('#booking-form'),fieldsets=$$('fieldset[data-step]'),error=$('#form-error'),steps=$$('.steps li');let step=0;
  const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function setMinDates(){form.elements.arrival.min=localToday();form.elements.departure.min=form.elements.arrival.value||localToday();}
  setMinDates();
  const values=()=>Object.fromEntries(new FormData(form));
  const money=n=>`${new Intl.NumberFormat('ro-RO').format(n)} lei`;
  const count=(n,singular,plural)=>`${n} ${Number(n)===1?singular:plural}`;
  function clearError(){error.hidden=true;error.textContent='';$$('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));}
  function showError(message){error.textContent=message;error.hidden=false;error.focus();}
  function stayError(){return window.CampingBooking.validateStay(values(),localToday());}
  function showStep(index,focus=true){step=index;fieldsets.forEach((f,i)=>f.hidden=i!==index);steps.forEach((li,i)=>{if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});clearError();if(index===2)renderSummary($('#summary'));if(focus){const legend=fieldsets[index].querySelector('legend');legend.tabIndex=-1;legend.focus();}}
  function updateEstimate(){setMinDates();const s=values();$('#estimate-value').textContent=stayError()?'Alege o perioadă și un grup valid':`${money(window.CampingBooking.estimateStay(s).camping)} · ${count(window.CampingBooking.estimateStay(s).nights,'noapte','nopți')}`;}
  function renderSummary(target){
    const v=values(),estimate=window.CampingBooking.estimateStay(v);target.replaceChildren();
    const date=s=>new Intl.DateTimeFormat('ro-RO',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T00:00:00Z'));
    const rows=[['Perioadă',`${date(v.arrival)} – ${date(v.departure)} · ${count(estimate.nights,'noapte','nopți')}`],['Grup',`${count(v.adults,'adult','adulți')} · ${count(v.children,'copil','copii')} · ${count(v.tents,'cort','corturi')}`],['Acces',v.access||'De stabilit'],['Observații',v.notes?.trim()||'Fără observații'],['Campare adulți',`${money(estimate.camping)} orientativ. Copiii stau gratuit; transferul e separat (50 lei pe cursă). Nu este o ofertă fermă.`]];
    rows.forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;target.append(dt,dd);});
  }
  fieldsets[0].addEventListener('input',updateEstimate);
  form.addEventListener('change',()=>{
    if(!stayError()){
      if(step===2)renderSummary($('#summary'));
      if(!$('#success').hidden)renderSummary($('#success-summary'));
    }
  });
  $$('.next').forEach(b=>b.addEventListener('click',()=>{
    if(step===0){const message=stayError();if(message){showError(message);return;}}
    if(step===1&&!form.elements.access.value){showError('Alege o variantă de acces sau opțiunea de îndrumare.');return;}
    showStep(step+1);
  }));
  $$('.back').forEach(b=>b.addEventListener('click',()=>showStep(step-1)));
  $('.edit').addEventListener('click',()=>showStep(0));
  $$('.access-choice').forEach(b=>b.addEventListener('click',()=>{const choice=Array.from(form.elements.access).find(input=>input.value===b.dataset.access);choice.checked=true;showStep(0,false);$('#disponibilitate').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});form.elements.arrival.focus({preventScroll:true});}));
  form.addEventListener('submit',e=>{
    e.preventDefault();clearError();
    if(step!==2){if(step===0){const message=stayError();if(message){showError(message);return;}}if(step===1&&!form.elements.access.value){showError('Alege o variantă de acces.');return;}showStep(step+1);return;}
    const message=stayError();if(message){showStep(0);showError(message);return;}
    const name=form.elements.name,email=form.elements.email,ack=form.elements.acknowledge;
    if(!name.value.trim()){name.setAttribute('aria-invalid','true');showError('Completează un nume fictiv.');return;}
    if(!email.validity.valid||!email.value.trim()){email.setAttribute('aria-invalid','true');showError('Completează un email fictiv valid, de exemplu alex@example.com.');return;}
    if(!ack.checked){showError('Confirmă că ai înțeles caracterul demonstrativ al cererii.');return;}
    renderSummary($('#success-summary'));form.hidden=true;$('.steps').hidden=true;$('#success').hidden=false;$('#success').focus();
  });
  $('#edit-success').addEventListener('click',()=>{$('#success').hidden=true;form.hidden=false;$('.steps').hidden=false;showStep(2);});
  $('#restart').addEventListener('click',()=>{form.reset();$('#success-summary').replaceChildren();$('#summary').replaceChildren();$('#success').hidden=true;form.hidden=false;$('.steps').hidden=false;setMinDates();$('#estimate-value').textContent='Alege perioada';showStep(0);});
})();
