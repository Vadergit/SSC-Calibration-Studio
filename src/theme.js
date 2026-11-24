// Optional enhancement only. Navigation is native HTML and does not depend on this script.
(function(){
 'use strict';
 var button=document.getElementById('theme');
 if(!button)return;
 function apply(mode){
  document.documentElement.dataset.theme=mode;
  button.textContent=mode==='dark'?'Light Mode':'Dark Mode';
  button.setAttribute('aria-pressed',String(mode==='dark'));
  try{localStorage.setItem('ssc-studio-theme-v1',mode)}catch(e){}
 }
 var saved='light';
 try{if(localStorage.getItem('ssc-studio-theme-v1')==='dark')saved='dark'}catch(e){}
 apply(saved);
 button.addEventListener('click',function(){apply(document.documentElement.dataset.theme==='dark'?'light':'dark')});
 button.hidden=false;
})();
