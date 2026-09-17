const KEY='suscripto-v1';
const LAYOUT_KEY='suscripto-layout';
const $=s=>document.querySelector(s);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const money=(n,c='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency:c}).format(n);
const date=s=>new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(parse(s));
const days=s=>Math.ceil((parse(s)-new Date(new Date().setHours(0,0,0,0)))/86400000);
const monthly=s=>s.frequency==='monthly'?s.price:s.frequency==='quarterly'?s.price/3:s.frequency==='yearly'?s.price/12:0;
const freq=f=>({monthly:'Mensual',quarterly:'Cada 3 meses',yearly:'Anual','one-time':'Pago único'})[f]||f;
const esc=v=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const initials=n=>n.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'S';

const icons={
 image:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
 flag:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 5h10l-1 4 3 3H5"/></svg>`,
 trash:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>`
};

const demo=[
{id:uid(),name:'ChatGPT Plus',price:23,currency:'EUR',renewalDate:addDays(4),frequency:'monthly',category:'Software',cancelBeforeRenewal:false},
{id:uid(),name:'Spotify',price:10.99,currency:'EUR',renewalDate:addDays(9),frequency:'monthly',category:'Entretenimiento',cancelBeforeRenewal:false},
{id:uid(),name:'Adobe Creative Cloud',price:24.19,currency:'EUR',renewalDate:addDays(14),frequency:'monthly',category:'Trabajo',cancelBeforeRenewal:true},
{id:uid(),name:'iCloud+',price:2.99,currency:'EUR',renewalDate:addDays(18),frequency:'monthly',category:'Cloud',cancelBeforeRenewal:false},
{id:uid(),name:'Dominios web',price:18.5,currency:'EUR',renewalDate:addDays(55),frequency:'yearly',category:'Trabajo',cancelBeforeRenewal:false}
];

let items=[];
let pendingIcon='';
let subscriptionLayout=localStorage.getItem(LAYOUT_KEY)==='list'?'list':'grid';
try{items=JSON.parse(localStorage.getItem(KEY))||demo}catch{items=demo}

const save=()=>localStorage.setItem(KEY,JSON.stringify(items));
const empty=t=>`<div class="empty-state">${esc(t)}</div>`;
const relative=s=>{const d=days(s);return d===0?'hoy':d===1?'mañana':d>1?`en ${d} días`:'fecha pasada'};
const safeLogo=logo=>typeof logo==='string'&&/^data:image\/(?:png|jpeg|webp);base64,/i.test(logo)?logo:'';
const logoHtml=x=>{const logo=safeLogo(x.logo);return logo?`<div class="service-logo has-image"><img src="${esc(logo)}" alt="Logo de ${esc(x.name)}"></div>`:`<div class="service-logo"><span>${esc(initials(x.name))}</span></div>`};

function renderDashboard(){
 const recurring=items.filter(x=>x.frequency!=='one-time');
 const m=recurring.reduce((a,x)=>a+monthly(x),0);
 $('#monthlySpend').textContent=money(m);
 $('#yearlySpend').textContent=money(m*12);
 $('#activeCount').textContent=`${items.length} suscripciones activas`;
 const sorted=[...items].sort((a,b)=>parse(a.renewalDate)-parse(b.renewalDate));
 const next=sorted.find(x=>days(x.renewalDate)>=0)||sorted[0];
 $('#nextChargeAmount').textContent=next?money(next.price,next.currency):'—';
 $('#nextChargeName').textContent=next?`${next.name} · ${relative(next.renewalDate)}`:'Sin cobros próximos';
 const soon=sorted.filter(x=>days(x.renewalDate)>=0&&days(x.renewalDate)<=30);
 $('#next30Spend').textContent=money(soon.reduce((a,x)=>a+x.price,0));
 $('#next30Count').textContent=`${soon.length} renovaciones`;
 $('#cancelCount').textContent=items.filter(x=>x.cancelBeforeRenewal).length;
 $('#upcomingList').innerHTML=sorted.filter(x=>days(x.renewalDate)>=0).slice(0,5).map(x=>`<div class="upcoming-item">${logoHtml(x)}<div class="service-meta"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${freq(x.frequency)}</span></div><div class="charge"><strong>${money(x.price,x.currency)}</strong><span class="${x.cancelBeforeRenewal?'danger-text':''}">${x.cancelBeforeRenewal?'Cancelar · ':''}${relative(x.renewalDate)}</span></div></div>`).join('')||empty('Todavía no tienes renovaciones.');
 const cats={};
 recurring.forEach(x=>cats[x.category]=(cats[x.category]||0)+monthly(x));
 const max=Math.max(1,...Object.values(cats));
 $('#categoryChart').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="category-row"><div><span>${esc(n)}</span></div><span>${money(v)}/mes</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/max*100)}%"></div></div></div>`).join('')||empty('Sin datos todavía.');
}

function renderSubscriptions(){
 const q=$('#searchInput').value.trim().toLowerCase();
 const f=$('#statusFilter').value;
 const list=items.filter(x=>x.name.toLowerCase().includes(q)&&(f==='all'||(f==='cancel'&&x.cancelBeforeRenewal)||(f==='active'&&!x.cancelBeforeRenewal)));
 $('#subscriptionsGrid').innerHTML=list.map(x=>`<article class="subscription-card">
   <div class="subscription-top">${logoHtml(x)}<span class="badge ${x.cancelBeforeRenewal?'badge-danger':''}">${x.cancelBeforeRenewal?'Cancelar antes':'Activa'}</span></div>
   <div class="subscription-copy"><h3>${esc(x.name)}</h3><p>${esc(x.category)} · ${freq(x.frequency)}</p></div>
   <div class="subscription-price">${money(x.price,x.currency)}</div>
   <p class="renewal-copy">Próximo cobro: ${date(x.renewalDate)} · ${relative(x.renewalDate)}</p>
   <div class="card-actions">
     <button class="small-btn" data-icon="${x.id}">${icons.image}Cambiar icono</button>
     <button class="small-btn" data-toggle="${x.id}">${icons.flag}${x.cancelBeforeRenewal?'Mantener':'Marcar para cancelar'}</button>
     <button class="small-btn danger" data-delete="${x.id}">${icons.trash}Eliminar</button>
   </div>
 </article>`).join('')||empty('No hay suscripciones que coincidan.');
 applySubscriptionLayout();
}

function renderCalendar(){
 const out=[];
 const end=new Date();end.setFullYear(end.getFullYear()+1);
 items.forEach(x=>{let d=parse(x.renewalDate),i=0;while(d<=end&&i<14){if(d>=new Date(new Date().setHours(0,0,0,0)))out.push({...x,occ:iso(d)});if(x.frequency==='one-time')break;if(x.frequency==='monthly')d.setMonth(d.getMonth()+1);if(x.frequency==='quarterly')d.setMonth(d.getMonth()+3);if(x.frequency==='yearly')d.setFullYear(d.getFullYear()+1);i++}});
 out.sort((a,b)=>parse(a.occ)-parse(b.occ));
 $('#calendarList').innerHTML=out.map(x=>{const d=parse(x.occ),mo=new Intl.DateTimeFormat('es-ES',{month:'short'}).format(d);return `<div class="calendar-item"><div class="date-chip"><strong>${d.getDate()}</strong><span>${mo}</span></div><div class="service-meta"><strong>${esc(x.name)}</strong><span>${freq(x.frequency)} · ${esc(x.category)}</span></div><div class="charge"><strong>${money(x.price,x.currency)}</strong>${x.cancelBeforeRenewal?'<span class="danger-text">Cancelar antes</span>':''}</div></div>`}).join('')||empty('No hay cobros programados.');
}

function render(){renderDashboard();renderSubscriptions();renderCalendar()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}

function setIconPreview(value=''){
 const preview=$('#iconPreview');
 const logo=safeLogo(value);
 preview.innerHTML=logo?`<img src="${esc(logo)}" alt="Vista previa del icono">`:'<span>+</span>';
 $('#removeIconBtn').hidden=!logo;
}

function modal(open){
 $('#modalBackdrop').hidden=!open;
 document.body.style.overflow=open?'hidden':'';
 if(!open){$('#subscriptionForm').reset();pendingIcon='';setIconPreview('')}
}

function switchView(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));
 $(`#${id}View`)?.classList.add('active-view');
 document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));
 $('#pageTitle').textContent=({dashboard:'Tus suscripciones',subscriptions:'Todas las suscripciones',calendar:'Próximos cobros'})[id];
}

function applySubscriptionLayout(){
 $('#subscriptionsGrid').classList.toggle('list-mode',subscriptionLayout==='list');
 document.querySelectorAll('.view-mode').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===subscriptionLayout));
}

function fileToLogo(file){
 return new Promise((resolve,reject)=>{
   if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))return reject(new Error('Usa una imagen PNG, JPG o WebP'));
   if(file.size>4*1024*1024)return reject(new Error('La imagen es demasiado grande. Máximo 4 MB'));
   const reader=new FileReader();
   reader.onerror=()=>reject(new Error('No se pudo leer la imagen'));
   reader.onload=()=>{
     const img=new Image();
     img.onerror=()=>reject(new Error('No se pudo procesar la imagen'));
     img.onload=()=>{
       const canvas=document.createElement('canvas');
       canvas.width=128;canvas.height=128;
       const ctx=canvas.getContext('2d');
       const side=Math.min(img.naturalWidth,img.naturalHeight);
       const sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;
       ctx.clearRect(0,0,128,128);
       ctx.drawImage(img,sx,sy,side,side,0,0,128,128);
       resolve(canvas.toDataURL('image/webp',.86));
     };
     img.src=reader.result;
   };
   reader.readAsDataURL(file);
 });
}

function chooseExistingIcon(id){
 const input=document.createElement('input');
 input.type='file';input.accept='image/png,image/jpeg,image/webp';
 input.addEventListener('change',async()=>{
   if(!input.files?.[0])return;
   try{
     const logo=await fileToLogo(input.files[0]);
     const item=items.find(x=>x.id===id);
     if(!item)return;
     item.logo=logo;save();render();toast('Icono actualizado');
   }catch(err){toast(err.message||'No se pudo cargar el icono')}
 });
 input.click();
}

$('#openModalBtn').onclick=()=>{modal(true);$('#renewalDate').value=addDays(30)};
$('#closeModalBtn').onclick=()=>modal(false);
$('#cancelModalBtn').onclick=()=>modal(false);
$('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')modal(false)};
$('#searchInput').oninput=renderSubscriptions;
$('#statusFilter').onchange=renderSubscriptions;

$('#iconFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];
 if(!file)return;
 try{pendingIcon=await fileToLogo(file);setIconPreview(pendingIcon)}
 catch(err){pendingIcon='';e.target.value='';setIconPreview('');toast(err.message||'No se pudo cargar el icono')}
});

$('#removeIconBtn').onclick=()=>{pendingIcon='';$('#iconFile').value='';setIconPreview('')};

$('#name').addEventListener('input',()=>{
 if(pendingIcon)return;
 const value=$('#name').value.trim();
 $('#iconPreview').innerHTML=`<span>${esc(value?initials(value):'+')}</span>`;
});

document.querySelectorAll('.view-mode').forEach(btn=>btn.addEventListener('click',()=>{
 subscriptionLayout=btn.dataset.mode==='list'?'list':'grid';
 localStorage.setItem(LAYOUT_KEY,subscriptionLayout);
 applySubscriptionLayout();
}));

$('#subscriptionForm').onsubmit=e=>{
 e.preventDefault();
 const d=new FormData(e.target);
 const entry={id:uid(),name:d.get('name').trim(),price:Number(d.get('price')),currency:d.get('currency'),renewalDate:d.get('renewalDate'),frequency:d.get('frequency'),category:d.get('category'),cancelBeforeRenewal:d.get('cancelBeforeRenewal')==='on'};
 if(pendingIcon)entry.logo=pendingIcon;
 items.push(entry);save();render();modal(false);toast('Suscripción guardada');
};

document.addEventListener('click',e=>{
 const v=e.target.closest('[data-view]')?.dataset.view||e.target.closest('[data-view-target]')?.dataset.viewTarget;
 if(v)switchView(v);
 const icon=e.target.closest('[data-icon]');
 if(icon){chooseExistingIcon(icon.dataset.icon);return}
 const del=e.target.closest('[data-delete]');
 if(del){items=items.filter(x=>x.id!==del.dataset.delete);save();render();toast('Suscripción eliminada');return}
 const tog=e.target.closest('[data-toggle]');
 if(tog){const x=items.find(i=>i.id===tog.dataset.toggle);if(x){x.cancelBeforeRenewal=!x.cancelBeforeRenewal;save();render();toast('Estado actualizado')}}
});

$('#notificationBtn').onclick=()=>toast('Los avisos reales se conectarán en la siguiente fase');
render();
