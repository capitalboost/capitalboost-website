(function(root){
  'use strict';
  const routes={
    car:{label:'Vin cu o mașină obișnuită',bookingValue:'Transfer 4×4',title:'Tu lași mașina. Planul merge mai departe.',duration:'Transfer de stabilit',number:'4×4',description:'Stabilești cu gazda locul de parcare și preluare. Pentru ultima parte poți solicita transferul campingului.',items:['Confirmă punctul de întâlnire și ora.','Spune câte persoane și câte bagaje aveți.','Stabilește și coborârea, înainte de sosire.'],note:'Tarif publicat: 50 lei / urcare sau coborâre. Curse pentru 4 persoane plus bagaje, conform operatorului; organizarea se confirmă.'},
    '4x4':{label:'Vin cu un SUV 4×4',bookingValue:'SUV 4×4',title:'Ultima bucată de drum e a ta.',duration:'≈ 5 minute de la asfalt',number:'05′',description:'Drumul forestier este descris de operator pentru SUV 4×4. Înainte de plecare, confirmă că vehiculul și starea drumului permit urcarea.',items:['Verifică starea drumului cu gazda.','Ia în calcul vremea din ziua sosirii.','Cere indicațiile pentru ultimul segment.'],note:'Timp orientativ publicat de operator. Nu reprezintă o garanție pentru orice vehicul sau condiție meteo.'},
    walk:{label:'Urc pe jos',bookingValue:'Pe jos',title:'Pui rucsacul în spate. Schimbi ritmul.',duration:'≈ 30 de minute de la asfalt',number:'30′',description:'Poți urca pe jos, conform prezentării campingului. Pregătește ultima parte în funcție de bagaje, vreme și oamenii cu care vii.',items:['Confirmă unde poți lăsa mașina.','Gândește bagajele pentru o urcare pe jos.','Cere indicațiile și verifică vremea.'],note:'Durată orientativă indicată de operator. Dificultatea traseului și punctul de plecare trebuie confirmate.'}
  };
  const api={routeFor:key=>routes[key]||null,chapterProgress:index=>Math.max(0,Math.min(4,index))*25};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CampingJourney=api;
})(typeof window!=='undefined'?window:globalThis);
