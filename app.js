const KEY='suscripto-v1';
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
const initials=n=>n.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();

const demo=[
{id:uid(),name:'ChatGPT Plus',price:23,currency:'EUR',renewalDate:addDays(4),frequency:'monthly',category:'Software',cancelBeforeRenewal:false},
{id:uid(),name:'Spotify',price:10.99,currency:'EUR',renewalDate:addDays(9),frequency:'monthly',category:'Entretenimiento',cancelBeforeRenewal:false},
{id:uid(),name:'Adobe Creative Cloud',price:24.19,currency:'EUR',renewalDate:addDays(14),frequency:'monthly',category:'Trabajo',cancelBeforeRenewal:true},
{id:uid(),name:'iCloud+',price:2.99,currency:'EUR',renewalDate:addDays(18),frequency:'monthly',category:'Cloud',cancelBeforeRenewal:false},
{id:uid(),name:'Dominios web',price:18.5,currency:'EUR',renewalDate:addDays(55),frequency:'yearly',category:'Trabajo',cancelBeforeRenewal:false}
];
let items=[];
try{items=JSON.parse(localStorage.getItem(KEY))||demo}catch{items=demo}
const save=()=>localStorage.setItem(KEY,JSON.stringify(items));
const empty=t=>`<div class="empty-state">${esc(t)}</div>`;
const relative=s=>{const d=days(s);return d===0?'hoy':d===1?'mañana':d>1?`en ${d} días`:'fecha pasada'};

function renderDashboard(){
 const recurring=items.filter(x=>x.frequency!=='one-time');
 const m=recurring.reduce((a,x)=>a+monthly(x),0);
 $('#monthlySpend').textContent=money(m);$('#yearlySpend').textContent=money(m*12);$('#activeCount').textContent=`${items.length} suscripciones activas`;
 const sorted=[...items].sort((a,b)=>parse(a.renewalDate)-parse(b.renewalDate)); const next=sorted[0];
 $('#nextChargeAmount').textContent=next?money(next.price,next.currency):'—';$('#nextChargeName').textContent=next?`${next.name} · ${relative(next.renewalDate)}`:'Sin cobros próximos';
 const soon=sorted.filter(x=>days(x.renewalDate)>=0&&days(x.renewalDate)<=30);$('#next30Spend').textContent=money(soon.reduce((a,x)=>a+x.price,0));$('#next30Count').textContent=`${soon.length} renovaciones`;$('#cancelCount').textContent=items.filter(x=>x.cancelBeforeRenewal).length;
 $('#upcomingList').innerHTML=sorted.slice(0,5).map(x=>`<div class="upcoming-item"><div class="service-logo">${esc(initials(x.name))}</div><div class="service-meta"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${freq(x.frequency)}</span></div><div class="charge"><strong>${money(x.price,x.currency)}</strong><span class="${x.cancelBeforeRenewal?'danger-text':''}">${x.cancelBeforeRenewal?'Cancelar · ':''}${relative(x.renewalDate)}</span></div></div>`).join('')||empty('Todavía no tienes renovaciones.');
 const cats={}; recurring.forEach(x=>cats[x.category]=(cats[x.category]||0)+monthly(x)); const max=Math.max(1,...Object.values(cats));
 $('#categoryChart').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="category-row"><div><span>${esc(n)}</span></div><span>${money(v)}/mes</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/max*100)}%"></div></div></div>`).join('')||empty('Sin datos todavía.');
}

function renderSubscriptions(){
 const q=$('#searchInput').value.trim().toLowerCase(), f=$('#statusFilter').value;
 const list=items.filter(x=>x.name.toLowerCase().includes(q)&&(f==='all'||(f==='cancel'&&x.cancelBeforeRenewal)||(f==='active'&&!x.cancelBeforeRenewal)));
 $('#subscriptionsGrid').innerHTML=list.map(x=>`<article class="subscription-card"><div class="subscription-top"><div class="service-logo">${esc(initials(x.name))}</div><span class="badge ${x.cancelBeforeRenewal?'badge-danger':''}">${x.cancelBeforeRenewal?'Cancelar antes':'Activa'}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.category)} · ${freq(x.frequency)}</p><div class="subscription-price">${money(x.price,x.currency)}</div><p>Próximo cobro: ${date(x.renewalDate)} · ${relative(x.renewalDate)}</p><div class="card-actions"><button class="small-btn" data-toggle="${x.id}">${x.cancelBeforeRenewal?'Mantener':'Marcar para cancelar'}</button><button class="small-btn danger" data-delete="${x.id}">Eliminar</button></div></article>`).join('')||empty('No hay suscripciones que coincidan.');
}

function renderCalendar(){
 const out=[]; const end=new Date();end.setFullYear(end.getFullYear()+1);
 items.forEach(x=>{let d=parse(x.renewalDate),i=0;while(d<=end&&i<14){if(d>=new Date(new Date().setHours(0,0,0,0)))out.push({...x,occ:iso(d)});if(x.frequency==='one-time')break;if(x.frequency==='monthly')d.setMonth(d.getMonth()+1);if(x.frequency==='quarterly')d.setMonth(d.getMonth()+3);if(x.frequency==='yearly')d.setFullYear(d.getFullYear()+1);i++}});
 out.sort((a,b)=>parse(a.occ)-parse(b.occ));
 $('#calendarList').innerHTML=out.map(x=>{const d=parse(x.occ),mo=new Intl.DateTimeFormat('es-ES',{month:'short'}).format(d);return `<div class="calendar-item"><div class="date-chip"><strong>${d.getDate()}</strong><span>${mo}</span></div><div class="service-meta"><strong>${esc(x.name)}</strong><span>${freq(x.frequency)} · ${esc(x.category)}</span></div><div class="charge"><strong>${money(x.price,x.currency)}</strong>${x.cancelBeforeRenewal?'<span class="danger-text">Cancelar antes</span>':''}</div></div>`}).join('')||empty('No hay cobros programados.');
}
function render(){renderDashboard();renderSubscriptions();renderCalendar()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2000)}
function modal(open){$('#modalBackdrop').hidden=!open;document.body.style.overflow=open?'hidden':'';if(!open)$('#subscriptionForm').reset()}
function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));$(`#${id}View`)?.classList.add('active-view');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));$('#pageTitle').textContent=({dashboard:'Tus suscripciones',subscriptions:'Todas las suscripciones',calendar:'Próximos cobros'})[id]}

$('#openModalBtn').onclick=()=>{modal(true);$('#renewalDate').value=addDays(30)};$('#closeModalBtn').onclick=()=>modal(false);$('#cancelModalBtn').onclick=()=>modal(false);
$('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')modal(false)};
$('#searchInput').oninput=renderSubscriptions;$('#statusFilter').onchange=renderSubscriptions;
$('#subscriptionForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);items.push({id:uid(),name:d.get('name').trim(),price:Number(d.get('price')),currency:d.get('currency'),renewalDate:d.get('renewalDate'),frequency:d.get('frequency'),category:d.get('category'),cancelBeforeRenewal:d.get('cancelBeforeRenewal')==='on'});save();render();modal(false);toast('Suscripción guardada')};
document.addEventListener('click',e=>{const v=e.target.closest('[data-view]')?.dataset.view||e.target.closest('[data-view-target]')?.dataset.viewTarget;if(v)switchView(v);const del=e.target.closest('[data-delete]');if(del){items=items.filter(x=>x.id!==del.dataset.delete);save();render();toast('Suscripción eliminada')}const tog=e.target.closest('[data-toggle]');if(tog){const x=items.find(i=>i.id===tog.dataset.toggle);if(x){x.cancelBeforeRenewal=!x.cancelBeforeRenewal;save();render();toast('Estado actualizado')}}});
$('#notificationBtn').onclick=()=>toast('Los avisos reales se conectarán en la siguiente fase');
render();