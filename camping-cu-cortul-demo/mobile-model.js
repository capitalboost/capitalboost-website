(function(root){
  const clamp=n=>Math.max(0,Math.min(1,n));
  const api={travelProgress:(scroll,top,height,viewport)=>clamp((scroll-top)/Math.max(1,height-viewport)),travelPhase:p=>Math.min(2,Math.floor(clamp(p)*3))};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CampingMobile=api;
})(typeof window!=='undefined'?window:globalThis);
