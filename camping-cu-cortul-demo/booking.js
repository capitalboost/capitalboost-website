(function(root){
  'use strict';
  const parseDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return NaN;const ms=Date.parse(value+'T00:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value?ms:NaN;};
  function validateStay(s,today){
    if(!Number.isFinite(parseDate(s.arrival))||s.arrival<today)return 'Alege o dată de sosire validă, începând de astăzi.';
    if(!Number.isFinite(parseDate(s.departure))||s.departure<=s.arrival)return 'Data de plecare trebuie să fie după sosire.';
    if(!Number.isInteger(Number(s.adults))||Number(s.adults)<1||Number(s.adults)>100)return 'Alege între 1 și 100 de adulți (număr întreg).';
    if(!Number.isInteger(Number(s.children))||Number(s.children)<0||Number(s.children)>100)return 'Numărul de copii trebuie să fie între 0 și 100, întreg.';
    if(!Number.isInteger(Number(s.tents))||Number(s.tents)<1||Number(s.tents)>100)return 'Alege între 1 și 100 de corturi (număr întreg).';
    return '';
  }
  function estimateStay(s){const nights=Math.round((parseDate(s.departure)-parseDate(s.arrival))/86400000);return {nights,camping:nights*Number(s.adults)*100};}
  const api={validateStay,estimateStay};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CampingBooking=api;
})(typeof window!=='undefined'?window:globalThis);
