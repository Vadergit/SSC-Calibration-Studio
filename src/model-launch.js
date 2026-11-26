// Direct, user-initiated launch of the selected native SSC model.
(()=>{'use strict';
 const select=document.getElementById('studio-model'),link=document.getElementById('studio-model-open'),root=document.getElementById('model-launch');
 if(!select||!link||!root)return;
 const sync=()=>{link.href=select.value};
 select.addEventListener('change',sync);sync();root.hidden=false;
})();
