(function(){
 const overlay=document.getElementById('authOverlay');
 const tabsWrap=document.getElementById('authTabs');
 const panels={login:document.getElementById('panelLogin'),signup:document.getElementById('panelSignup'),recovery:document.getElementById('panelRecovery')};
 const forms={login:document.getElementById('loginForm'),signup:document.getElementById('signupForm'),recovery:document.getElementById('recoveryForm'),reset:document.getElementById('resetForm')};
 const msg=document.getElementById('authMsg');
 const forgotBtn=document.getElementById('forgotBtn');
 const magicBtn=document.getElementById('magicLinkBtn');

 const setMsg=(text='',kind='')=>{msg.textContent=text;msg.className='auth-msg'+(kind?' '+kind:'')};
 const showOverlay=v=>{
  overlay.hidden=!v;
  document.body.style.overflow=v?'hidden':'';
  document.body.classList.toggle('auth-locked',v);
  document.documentElement.classList.toggle('auth-locked',v);
 };

 function showTab(name){
  Object.entries(panels).forEach(([k,el])=>{if(el)el.hidden=k!==name});
  const resetPanel=document.getElementById('panelReset');
  if(resetPanel)resetPanel.hidden=true;
  if(tabsWrap){tabsWrap.hidden=false;[...tabsWrap.querySelectorAll('.auth-tab')].forEach(t=>t.classList.toggle('active',t.dataset.tab===name))}
  setMsg();
 }

 tabsWrap?.addEventListener('click',e=>{const t=e.target.closest('.auth-tab');if(t)showTab(t.dataset.tab)});
 document.addEventListener('click',e=>{const jump=e.target.closest('[data-tab-jump]');if(jump)showTab(jump.dataset.tabJump)});
 forgotBtn?.addEventListener('click',()=>showTab('recovery'));

 document.addEventListener('click',e=>{
  const btn=e.target.closest('.pw-toggle');
  if(!btn)return;
  const input=document.getElementById(btn.dataset.pwTarget);
  if(!input)return;
  const showing=input.type==='text';
  input.type=showing?'password':'text';
  btn.setAttribute('aria-label',showing?'Mostrar contraseña':'Ocultar contraseña');
  btn.querySelector('.pw-eye').hidden=!showing;
  btn.querySelector('.pw-eye-off').hidden=showing;
 });
 magicBtn?.addEventListener('click',async()=>{const email=document.getElementById('loginEmail').value.trim();if(!email)return setMsg('Escribe tu email arriba para pedir el enlace','err');await withBusy(magicBtn,'Enviando…',async()=>{await window.db.sendMagicLink(email);setMsg('Si existe una cuenta con '+email+', te llegará un enlace para entrar sin contraseña.','ok')})});

 async function withBusy(btn,label,fn){const prev=btn.textContent;btn.disabled=true;btn.textContent=label;try{await fn()}catch(err){setMsg(prettyError(err),'err')}finally{btn.disabled=false;btn.textContent=prev}}

 function prettyError(err){
  const m=String(err?.message||err||'').toLowerCase();
  if(m.includes('invalid login credentials'))return 'Email o contraseña incorrectos';
  if(m.includes('email not confirmed'))return 'Confirma tu email desde el enlace que te enviamos';
  if(m.includes('user already registered'))return 'Ya existe una cuenta con este email. Prueba a entrar o a recuperar la contraseña';
  if(m.includes('rate limit')||m.includes('too many'))return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo';
  if(m.includes('password should be')||m.includes('weak_password')||m.includes('password_too_short'))return 'La contraseña debe tener al menos 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos';
  if(m.includes('invalid'))return 'Datos no válidos: '+err.message;
  return err?.message||'Ha habido un error, prueba de nuevo';
 }

 forms.login?.addEventListener('submit',async e=>{
  e.preventDefault();
  const email=document.getElementById('loginEmail').value.trim();
  const pw=document.getElementById('loginPassword').value;
  await withBusy(document.getElementById('loginSubmit'),'Entrando…',async()=>{
   await window.db.signInPassword(email,pw);
  });
 });

 forms.signup?.addEventListener('submit',async e=>{
  e.preventDefault();
  const email=document.getElementById('signupEmail').value.trim();
  const pw=document.getElementById('signupPassword').value;
  const pw2=document.getElementById('signupPassword2').value;
  if(pw!==pw2)return setMsg('Las contraseñas no coinciden','err');
  if(!validPassword(pw))return setMsg('La contraseña debe tener 12+ caracteres con mayúsculas, minúsculas, números y símbolos','err');
  await withBusy(document.getElementById('signupSubmit'),'Creando cuenta…',async()=>{
   await window.db.signUpPassword(email,pw);
   setMsg('Cuenta creada. Revisa tu email para confirmarla antes de entrar.','ok');
   forms.signup.reset();
  });
 });

 forms.recovery?.addEventListener('submit',async e=>{
  e.preventDefault();
  const email=document.getElementById('recoveryEmail').value.trim();
  await withBusy(document.getElementById('recoverySubmit'),'Enviando…',async()=>{
   await window.db.requestPasswordReset(email);
   setMsg('Si existe una cuenta con '+email+', te enviaremos un enlace para restablecer la contraseña.','ok');
  });
 });

 forms.reset?.addEventListener('submit',async e=>{
  e.preventDefault();
  const pw=document.getElementById('resetPassword').value;
  const pw2=document.getElementById('resetPassword2').value;
  if(pw!==pw2)return setMsg('Las contraseñas no coinciden','err');
  if(!validPassword(pw))return setMsg('La contraseña debe tener 12+ caracteres con mayúsculas, minúsculas, números y símbolos','err');
  await withBusy(document.getElementById('resetSubmit'),'Guardando…',async()=>{
   await window.db.updatePassword(pw);
   setMsg('Contraseña actualizada. Ya estás dentro.','ok');
   const url=new URL(location.href);url.searchParams.delete('flow');history.replaceState({},'',url.pathname+url.search);
  });
 });

 function validPassword(pw){
  if(!pw||pw.length<12)return false;
  return /[a-z]/.test(pw)&&/[A-Z]/.test(pw)&&/\d/.test(pw)&&/[^A-Za-z0-9]/.test(pw);
 }

 // Recovery-flow detection: user clicked reset link
 const isRecoveryFlow=()=>{const u=new URL(location.href);return u.searchParams.get('flow')==='recovery'||u.hash.includes('type=recovery')};

 window.db.onAuthChange((user,event)=>{
  if(event==='PASSWORD_RECOVERY'||isRecoveryFlow()){
   showResetPanel();
   return;
  }
  if(event==='SIGNED_OUT'||!user)showTab('login');
  showOverlay(!user);
  if(window.__onAuthUser)window.__onAuthUser(user);
 });

 function showResetPanel(){
  // Hide tabbed panels, show reset panel
  Object.values(panels).forEach(el=>{if(el)el.hidden=true});
  if(tabsWrap)tabsWrap.hidden=true;
  const resetPanel=document.getElementById('panelReset');
  if(resetPanel)resetPanel.hidden=false;
  showOverlay(true);
 }

 (async()=>{
  const u=await window.db.currentUser();
  if(isRecoveryFlow()){showResetPanel();return}
  showOverlay(!u);
  if(window.__onAuthUser)window.__onAuthUser(u);
 })();
})();
