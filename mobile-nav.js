(()=>{
  const createBtn=document.querySelector('#mobileCreateBtn');
  const desktopCreate=document.querySelector('#openModalBtn');
  const groupBtn=document.querySelector('[data-view="group"]');
  const groupCreate=document.querySelector('#createGroupBtn');
  const title=document.querySelector('#pageTitle');

  createBtn?.addEventListener('click',()=>desktopCreate?.click());
  groupBtn?.addEventListener('click',()=>setTimeout(()=>{if(title)title.textContent='Grupo'},0));
  groupCreate?.addEventListener('click',()=>{
    const toast=document.querySelector('#toast');
    if(!toast)return;
    toast.textContent='La gestión de grupos será la siguiente función que añadamos';
    toast.classList.add('show');
    clearTimeout(window.__groupToastTimer);
    window.__groupToastTimer=setTimeout(()=>toast.classList.remove('show'),2200);
  });
})();
