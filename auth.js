(function(){
 const overlay=document.getElementById('authOverlay');
 const form=document.getElementById('authForm');
 const emailInput=document.getElementById('authEmail');
 const msg=document.getElementById('authMsg');
 const submit=document.getElementById('authSubmit');
 const userChip=document.getElementById('userChip');
 const userEmailEl=document.getElementById('userEmail');
 const signOutBtn=document.getElementById('signOutBtn');

 const showOverlay=v=>{if(!overlay)return;overlay.hidden=!v;document.body.style.overflow=v?'hidden':''};
 const showUser=u=>{if(!userChip)return;if(u){userChip.hidden=false;userEmailEl.textContent=u.email||''}else{userChip.hidden=true;userEmailEl.textContent=''}};

 form?.addEventListener('submit',async e=>{
  e.preventDefault();
  const email=emailInput.value.trim();
  if(!email)return;
  submit.disabled=true;submit.textContent='Enviando…';msg.textContent='';msg.className='auth-msg';
  try{
   await window.db.sendMagicLink(email);
   msg.textContent='Te hemos enviado un enlace a '+email+'. Ábrelo desde este mismo dispositivo.';
   msg.className='auth-msg ok';
  }catch(err){
   msg.textContent='Error: '+(err.message||'no se pudo enviar');
   msg.className='auth-msg err';
  }finally{
   submit.disabled=false;submit.textContent='Enviar enlace';
  }
 });

 signOutBtn?.addEventListener('click',async()=>{await window.db.signOut()});

 window.db.onAuthChange(user=>{
  showUser(user);
  showOverlay(!user);
  if(window.__onAuthUser)window.__onAuthUser(user);
 });

 (async()=>{
  const u=await window.db.currentUser();
  showUser(u);
  showOverlay(!u);
  if(window.__onAuthUser)window.__onAuthUser(u);
 })();
})();
