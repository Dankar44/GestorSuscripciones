(()=>{
  const createBtn=document.querySelector('#mobileCreateBtn');
  const desktopCreate=document.querySelector('#openModalBtn');
  const groupBtn=document.querySelector('[data-view="group"]');
  const groupCreate=document.querySelector('#createGroupBtn');
  const title=document.querySelector('#pageTitle');
  const topbarActions=document.querySelector('.topbar-actions');
  const themeBtn=document.querySelector('#themeBtn');
  const dashboard=document.querySelector('#dashboardView');
  const renewalsPanel=document.querySelector('.timeline-panel');
  const renewalsList=document.querySelector('#upcomingList');
  const lowerGrid=document.querySelector('.lower-grid');

  createBtn?.addEventListener('click',()=>desktopCreate?.click());
  groupBtn?.addEventListener('click',()=>setTimeout(()=>{if(title)title.textContent='Grupo'},0));
  groupCreate?.addEventListener('click',()=>showToast('La gestión de grupos será la siguiente función que añadamos'));

  function showToast(text){
    const toast=document.querySelector('#toast');
    if(!toast)return;
    toast.textContent=text;
    toast.classList.add('show');
    clearTimeout(window.__uiToastTimer);
    window.__uiToastTimer=setTimeout(()=>toast.classList.remove('show'),2300);
  }

  /* Próximas renovaciones: antes de distribución y paginadas de 5 en 5. */
  let renewalPage=0;
  const pageSize=5;

  if(dashboard&&renewalsPanel){
    const firstDashboardGrid=dashboard.querySelector('.dashboard-grid');
    if(firstDashboardGrid)dashboard.insertBefore(renewalsPanel,firstDashboardGrid);
    renewalsPanel.classList.add('renewals-featured');
    lowerGrid?.classList.add('single-panel');

    const header=renewalsPanel.querySelector('.panel-header');
    if(header){
      header.innerHTML=`
        <div>
          <p class="eyebrow">PRÓXIMAMENTE</p>
          <h2>Próximas renovaciones</h2>
        </div>
        <div class="renewal-header-actions">
          <span id="renewalRange" class="renewal-range"></span>
          <button id="renewalPrev" class="mini-arrow" type="button" aria-label="Renovaciones anteriores">
            <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button id="renewalNext" class="mini-arrow" type="button" aria-label="Más renovaciones">
            <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button id="renewalSeeAll" class="text-btn renewal-see-all" type="button">Ver todas →</button>
        </div>`;
    }
  }

  function renderRenewalPage(reset=false){
    if(!renewalsList||typeof upcoming!=='function')return;
    const all=upcoming();
    if(reset)renewalPage=0;
    const pages=Math.max(1,Math.ceil(all.length/pageSize));
    renewalPage=Math.min(Math.max(renewalPage,0),pages-1);
    const start=renewalPage*pageSize;
    const shown=all.slice(start,start+pageSize);

    renewalsList.innerHTML=shown.map(x=>`<div class="upcoming-item renewal-row">
      ${logoHtml(x,false,'small')}
      <div class="service-meta"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${freq(x.frequency)}</span></div>
      <div class="charge"><strong>${money(x.price,x.currency)}</strong><span class="${x.cancelBeforeRenewal?'danger-text':''}">${x.cancelBeforeRenewal?'Cancelar · ':''}${relative(x.occ)}</span></div>
    </div>`).join('')||empty('No hay renovaciones próximas.');

    const range=document.querySelector('#renewalRange');
    if(range)range.textContent=all.length?`${start+1}–${Math.min(start+pageSize,all.length)} de ${all.length}`:'0 de 0';
    const prev=document.querySelector('#renewalPrev'),next=document.querySelector('#renewalNext');
    if(prev)prev.disabled=renewalPage===0;
    if(next)next.disabled=renewalPage>=pages-1;
    if(typeof applyImageFallbacks==='function')applyImageFallbacks();
  }

  document.querySelector('#renewalPrev')?.addEventListener('click',()=>{renewalPage--;renderRenewalPage()});
  document.querySelector('#renewalNext')?.addEventListener('click',()=>{renewalPage++;renderRenewalPage()});
  document.querySelector('#renewalSeeAll')?.addEventListener('click',()=>{
    if(typeof switchView==='function')switchView('subscriptions');
  });

  if(typeof renderDashboard==='function'){
    const originalRenderDashboard=renderDashboard;
    renderDashboard=function(){
      originalRenderDashboard();
      renderRenewalPage(false);
    };
  }
  renderRenewalPage(true);

  /* Menú de usuario / cuenta. */
  if(topbarActions){
    if(themeBtn)themeBtn.hidden=true;
    const accountWrap=document.createElement('div');
    accountWrap.className='account-wrap';
    accountWrap.innerHTML=`
      <button id="accountBtn" class="account-btn" type="button" aria-label="Abrir cuenta" aria-expanded="false">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>
      </button>
      <div id="accountMenu" class="account-menu" hidden>
        <div class="account-menu-head">
          <div class="account-avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg></div>
          <div><strong>Tu cuenta</strong><span id="accountEmail">—</span></div>
        </div>
        <button type="button" class="account-menu-item" data-account-action="theme">
          <svg viewBox="0 0 24 24"><path d="M20.5 14.2A8 8 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/></svg>
          <span><strong>Cambiar tema</strong><small>Claro / oscuro</small></span>
        </button>
        <div class="account-divider"></div>
        <button type="button" class="account-menu-item logout" data-account-action="logout">
          <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/></svg>
          <span><strong>Cerrar sesión</strong><small>Salir de tu cuenta</small></span>
        </button>
      </div>`;
    topbarActions.appendChild(accountWrap);

    const accountBtn=accountWrap.querySelector('#accountBtn');
    const accountMenu=accountWrap.querySelector('#accountMenu');
    const closeAccount=()=>{accountMenu.hidden=true;accountBtn.setAttribute('aria-expanded','false')};
    accountBtn.addEventListener('click',e=>{
      e.stopPropagation();
      accountMenu.hidden=!accountMenu.hidden;
      accountBtn.setAttribute('aria-expanded',String(!accountMenu.hidden));
    });
    document.addEventListener('click',e=>{if(!accountWrap.contains(e.target))closeAccount()});
    accountMenu.addEventListener('click',async e=>{
      const action=e.target.closest('[data-account-action]')?.dataset.accountAction;
      if(!action)return;
      if(action==='theme')themeBtn?.click();
      if(action==='logout'){
        try{await window.db?.signOut();showToast('Sesión cerrada')}
        catch(err){showToast('No se pudo cerrar sesión: '+(err?.message||err))}
      }
      closeAccount();
    });

    const emailEl=accountMenu.querySelector('#accountEmail');
    const setEmail=u=>{if(emailEl)emailEl.textContent=u?.email||'Sin sesión'};
    if(window.db){
      window.db.currentUser().then(setEmail).catch(()=>{});
      window.db.onAuthChange(u=>setEmail(u));
    }
  }
})();
