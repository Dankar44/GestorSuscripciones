const KEY='suscripto-v1',LAYOUT_KEY='suscripto-layout',THEME_KEY='suscripto-theme';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)};
const startToday=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const addDays=n=>{const d=startToday();d.setDate(d.getDate()+n);return iso(d)};
const money=(n,c='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number(n)||0);
const shortMoney=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(Number(n)||0)+' €';
const date=s=>new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(parse(s));
const days=s=>Math.ceil((parse(s)-startToday())/86400000);
const monthly=x=>x.frequency==='monthly'?x.price:x.frequency==='quarterly'?x.price/3:x.frequency==='yearly'?x.price/12:0;
const freq=f=>({monthly:'Mensual',quarterly:'Cada 3 meses',yearly:'Anual','one-time':'Pago único'})[f]||f;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>String(n||'S').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'S';
const relative=s=>{const d=days(s);return d===0?'hoy':d===1?'mañana':d>1?`en ${d} días`:`hace ${Math.abs(d)} días`};

const icons={edit:`<svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20ZM13.5 6.5l3.5 3.5"/></svg>`,image:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,flag:`<svg viewBox="0 0 24 24"><path d="M5 21V4M5 5h10l-1 4 3 3H5"/></svg>`,trash:`<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>`};

const services=[
 {terms:['chatgpt','openai'],icon:'openai',color:'111827'},{terms:['spotify'],icon:'spotify',color:'1DB954'},
 {terms:['adobe creative cloud','creative cloud','adobe'],icon:'adobecreativecloud',color:'DA1F26'},{terms:['icloud','apple one','apple music','apple tv'],icon:'apple',color:'111111'},
 {terms:['netflix'],icon:'netflix',color:'E50914'},{terms:['youtube'],icon:'youtube',color:'FF0000'},{terms:['disney'],icon:'disneyplus',color:'113CCF'},
 {terms:['prime video','amazon prime'],icon:'primevideo',color:'00A8E1'},{terms:['onedrive'],icon:'microsoftonedrive',color:'0078D4'},{terms:['microsoft','office 365','microsoft 365'],icon:'microsoft',color:'5E5E5E'},
 {terms:['github'],icon:'github',color:'181717'},{terms:['notion'],icon:'notion',color:'111111'},{terms:['canva'],icon:'canva',color:'00C4CC'},{terms:['dropbox'],icon:'dropbox',color:'0061FF'},
 {terms:['figma'],icon:'figma',color:'F24E1E'},{terms:['claude','anthropic'],icon:'anthropic',color:'191919'},{terms:['perplexity'],icon:'perplexity',color:'20808D'},
 {terms:['midjourney'],icon:'midjourney',color:'111111'},{terms:['vercel'],icon:'vercel',color:'111111'},{terms:['google drive'],icon:'googledrive',color:'4285F4'},
 {terms:['gemini'],icon:'googlegemini',color:'8E75B2'},{terms:['slack'],icon:'slack',color:'4A154B'},{terms:['discord'],icon:'discord',color:'5865F2'},
 {terms:['twitch'],icon:'twitch',color:'9146FF'},{terms:['xbox'],icon:'xbox',color:'107C10'},{terms:['playstation'],icon:'playstation',color:'003791'},{terms:['linkedin'],icon:'linkedin',color:'0A66C2'}
];
const findService=name=>{const n=String(name||'').toLowerCase();return services.find(s=>s.terms.some(t=>n.includes(t)))};
const brandUrl=(s,backup=false)=>backup?`https://api.iconify.design/simple-icons/${s.icon}.svg?color=%23${s.color}`:`https://cdn.simpleicons.org/${s.icon}/${s.color}`;
const safeLogo=logo=>typeof logo==='string'&&/^data:image\/(?:png|jpeg|webp);base64,/i.test(logo)?logo:'';
function logoHtml(item,editable=false,size='normal'){
 const custom=safeLogo(item.logo),service=findService(item.name),tag=editable?'button':'div';
 const attrs=editable?` type="button" data-icon="${esc(item.id)}" aria-label="Cambiar icono de ${esc(item.name)}"`:'';
 const cls=`service-logo${custom||service?' has-image':''}${size==='small'?' service-logo-small':''}`;
 if(custom)return `<${tag} class="${cls}"${attrs}><img src="${custom}" alt="Logo de ${esc(item.name)}"></${tag}>`;
 if(service)return `<${tag} class="${cls}"${attrs}><img class="auto-logo" src="${brandUrl(service)}" data-backup="${brandUrl(service,true)}" data-fallback="${esc(initials(item.name))}" alt="Logo de ${esc(item.name)}"></${tag}>`;
 return `<${tag} class="${cls}"${attrs}><span>${esc(initials(item.name))}</span></${tag}>`;
}

const demo=[
{id:uid(),name:'ChatGPT Plus',price:23,currency:'EUR',renewalDate:addDays(4),frequency:'monthly',category:'Software',cancelBeforeRenewal:false},
{id:uid(),name:'Spotify',price:10.99,currency:'EUR',renewalDate:addDays(9),frequency:'monthly',category:'Entretenimiento',cancelBeforeRenewal:false},
{id:uid(),name:'Adobe Creative Cloud',price:24.19,currency:'EUR',renewalDate:addDays(14),frequency:'monthly',category:'Trabajo',cancelBeforeRenewal:true},
{id:uid(),name:'iCloud+',price:2.99,currency:'EUR',renewalDate:addDays(18),frequency:'monthly',category:'Cloud',cancelBeforeRenewal:false},
{id:uid(),name:'Dominios web',price:18.5,currency:'EUR',renewalDate:addDays(55),frequency:'yearly',category:'Trabajo',cancelBeforeRenewal:false}
];
let items=[];try{items=JSON.parse(localStorage.getItem(KEY))||demo}catch{items=demo}
let pendingIcon='',subscriptionLayout=localStorage.getItem(LAYOUT_KEY)==='list'?'list':'grid';
let calendarCursor=new Date(startToday().getFullYear(),startToday().getMonth(),1),selectedDate=iso(startToday());
const save=()=>localStorage.setItem(KEY,JSON.stringify(items));
const empty=t=>`<div class="empty-state">${esc(t)}</div>`;

function addPeriod(d,f){const x=new Date(d);if(f==='monthly')x.setMonth(x.getMonth()+1);else if(f==='quarterly')x.setMonth(x.getMonth()+3);else if(f==='yearly')x.setFullYear(x.getFullYear()+1);else return null;return x}
function occurrences(start,end){
 const out=[];items.forEach(item=>{let d=parse(item.renewalDate),guard=0;while(d<start&&item.frequency!=='one-time'&&guard++<240){const n=addPeriod(d,item.frequency);if(!n)break;d=n}guard=0;while(d<=end&&guard++<240){if(d>=start)out.push({...item,occ:iso(d)});if(item.frequency==='one-time')break;const n=addPeriod(d,item.frequency);if(!n)break;d=n}});return out.sort((a,b)=>parse(a.occ)-parse(b.occ))
}
function upcoming(){return occurrences(startToday(),new Date(startToday().getFullYear()+2,startToday().getMonth(),startToday().getDate()))}

function applyImageFallbacks(){
 $$('.auto-logo').forEach(img=>{if(img.dataset.bound)return;img.dataset.bound='1';img.addEventListener('error',()=>{if(!img.dataset.tried){img.dataset.tried='1';img.src=img.dataset.backup;return}const p=img.parentElement;p.classList.remove('has-image');p.innerHTML=`<span>${esc(img.dataset.fallback)}</span>`})})
}
function renderDashboard(){
 const recurring=items.filter(x=>x.frequency!=='one-time'),m=recurring.reduce((a,x)=>a+monthly(x),0),yearly=m*12;
 $('#monthlySpend').textContent=money(m);$('#yearlySpend').textContent=money(yearly);$('#activeCount').textContent=`${items.length} suscripciones activas`;
 const savePotential=items.filter(x=>x.cancelBeforeRenewal).reduce((a,x)=>a+monthly(x)*12,0);$('#potentialSavings').textContent=money(savePotential);
 const up=upcoming(),next=up[0];$('#nextChargeAmount').textContent=next?money(next.price,next.currency):'—';$('#nextChargeName').textContent=next?`${next.name} · ${relative(next.occ)}`:'Sin cobros próximos';
 const soon=up.filter(x=>days(x.occ)<=30);$('#next30Spend').textContent=money(soon.reduce((a,x)=>a+x.price,0));$('#next30Count').textContent=`${soon.length} renovaciones`;$('#cancelCount').textContent=items.filter(x=>x.cancelBeforeRenewal).length;
 const nm=new Date();nm.setMonth(nm.getMonth()+1,1);const nmEnd=new Date(nm.getFullYear(),nm.getMonth()+1,0);const nmOcc=occurrences(nm,nmEnd);$('#nextMonthSpend').textContent=money(nmOcc.reduce((a,x)=>a+x.price,0));$('#nextMonthCount').textContent=`${nmOcc.length} cobros previstos`;
 $('#upcomingList').innerHTML=up.slice(0,6).map(x=>`<div class="upcoming-item">${logoHtml(x,false,'small')}<div class="service-meta"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${freq(x.frequency)}</span></div><div class="charge"><strong>${money(x.price,x.currency)}</strong><span class="${x.cancelBeforeRenewal?'danger-text':''}">${x.cancelBeforeRenewal?'Cancelar · ':''}${relative(x.occ)}</span></div></div>`).join('')||empty('No hay renovaciones próximas.');
 renderDonut(recurring,m);renderForecast();renderMiniCalendar();applyImageFallbacks();
}
function renderDonut(recurring,total){
 const cats={};recurring.forEach(x=>cats[x.category]=(cats[x.category]||0)+monthly(x));const entries=Object.entries(cats).sort((a,b)=>b[1]-a[1]);const colors=['var(--series1)','var(--series2)','var(--series3)','var(--series4)','var(--series5)','var(--series6)'];let acc=0;const stops=[];
 entries.forEach(([_,v],i)=>{const p=total?v/total*100:0;stops.push(`${colors[i%colors.length]} ${acc}% ${acc+p}%`);acc+=p});$('#categoryDonut').style.background=entries.length?`conic-gradient(${stops.join(',')})`:'conic-gradient(#e9ecf3 0 100%)';$('#donutTotal').textContent=shortMoney(total);
 $('#categoryLegend').innerHTML=entries.map(([n,v],i)=>`<div class="legend-row"><i class="legend-dot" style="background:${colors[i%colors.length]}"></i><span>${esc(n)} · ${total?Math.round(v/total*100):0}%</span><strong>${money(v)}</strong></div>`).join('')||'<span class="empty-state">Sin datos</span>'
}
function renderForecast(){
 const vals=[];for(let i=0;i<6;i++){const d=new Date();d.setMonth(d.getMonth()+i,1);const end=new Date(d.getFullYear(),d.getMonth()+1,0);const sum=occurrences(d,end).reduce((a,x)=>a+x.price,0);vals.push({d,sum})}const max=Math.max(1,...vals.map(x=>x.sum));
 $('#forecastBars').innerHTML=vals.map(({d,sum})=>`<div class="forecast-col"><div class="forecast-track"><div class="forecast-bar" style="height:${Math.max(5,sum/max*100)}%" title="${money(sum)}"></div></div><strong>${shortMoney(sum)}</strong><span>${new Intl.DateTimeFormat('es-ES',{month:'short'}).format(d)}</span></div>`).join('')
}
function renderMiniCalendar(){
 const now=startToday(),first=new Date(now.getFullYear(),now.getMonth(),1),offset=(first.getDay()+6)%7,start=new Date(first);start.setDate(1-offset);const end=new Date(start);end.setDate(start.getDate()+41);const occ=occurrences(start,end),map={};occ.forEach(x=>(map[x.occ]??=[]).push(x));let html=['L','M','X','J','V','S','D'].map(x=>`<div class="mini-weekday">${x}</div>`).join('');
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const key=iso(d),ev=map[key]||[];html+=`<div class="mini-day ${d.getMonth()===now.getMonth()?'current':''} ${key===iso(now)?'today':''}"><span>${d.getDate()}</span><span class="mini-dots">${ev.slice(0,3).map(()=>'<i></i>').join('')}</span></div>`}$('#miniCalendar').innerHTML=html
}

function renderSubscriptions(){
 const q=$('#searchInput').value.trim().toLowerCase(),status=$('#statusFilter').value,cat=$('#categoryFilter').value,sort=$('#sortSelect').value;let list=items.filter(x=>x.name.toLowerCase().includes(q)&&(status==='all'||(status==='cancel'?x.cancelBeforeRenewal:!x.cancelBeforeRenewal))&&(cat==='all'||x.category===cat));
 list.sort((a,b)=>sort==='price-desc'?b.price-a.price:sort==='price-asc'?a.price-b.price:sort==='name'?a.name.localeCompare(b.name,'es'):parse(a.renewalDate)-parse(b.renewalDate));
 $('#subscriptionsGrid').innerHTML=list.map(x=>`<article class="subscription-card"><div class="subscription-top">${logoHtml(x,true)}<span class="badge ${x.cancelBeforeRenewal?'badge-danger':''}">${x.cancelBeforeRenewal?'Cancelar antes':'Activa'}</span></div><div class="subscription-copy"><h3>${esc(x.name)}</h3><p>${esc(x.category)} · ${freq(x.frequency)}</p></div><div class="subscription-price">${money(x.price,x.currency)}</div><p class="renewal-copy">Próximo cobro: ${date(x.renewalDate)} · ${relative(x.renewalDate)}</p><div class="card-actions"><button class="small-btn" data-edit="${x.id}">${icons.edit}Editar</button><button class="small-btn" data-icon="${x.id}">${icons.image}Icono</button><button class="small-btn" data-toggle="${x.id}">${icons.flag}${x.cancelBeforeRenewal?'Mantener':'Cancelar'}</button><button class="small-btn danger" data-delete="${x.id}">${icons.trash}Eliminar</button></div></article>`).join('')||empty('No hay suscripciones que coincidan.');applySubscriptionLayout();applyImageFallbacks()
}
function populateCategories(){const sel=$('#categoryFilter'),cur=sel.value||'all',cats=[...new Set(items.map(x=>x.category))].sort();sel.innerHTML='<option value="all">Todas las categorías</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');sel.value=cats.includes(cur)?cur:'all'}
function applySubscriptionLayout(){const grid=$('#subscriptionsGrid');if(!grid)return;grid.classList.toggle('list-mode',subscriptionLayout==='list');$$('.view-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===subscriptionLayout))}

function renderCalendar(){
 const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7,start=new Date(y,m,1-offset),end=new Date(start);end.setDate(start.getDate()+41),occ=occurrences(start,end),map={};occ.forEach(x=>(map[x.occ]??=[]).push(x));$('#calendarMonthTitle').textContent=new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(first);
 let html='';for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const key=iso(d),ev=map[key]||[],outside=d.getMonth()!==m,today=key===iso(startToday()),selected=key===selectedDate;html+=`<button type="button" class="month-day ${outside?'outside':''} ${today?'today':''} ${selected?'selected':''}" data-date="${key}"><span class="day-number">${d.getDate()}</span><span class="day-events">${ev.slice(0,2).map(x=>`<span class="day-event ${x.cancelBeforeRenewal?'cancel':''}">${esc(x.name)}</span>`).join('')}</span><span class="day-dots">${ev.slice(0,3).map(x=>`<i class="${x.cancelBeforeRenewal?'cancel':''}"></i>`).join('')}</span></button>`}$('#monthGrid').innerHTML=html;renderSelectedDay(map[selectedDate]||occurrences(parse(selectedDate),parse(selectedDate)));applyImageFallbacks()
}
function renderSelectedDay(list){const d=parse(selectedDate);$('#selectedDayPanel').innerHTML=`<div class="selected-day-header"><h3>${new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(d)}</h3><span>${list.length} ${list.length===1?'cobro':'cobros'}</span></div>`+(list.length?list.map(x=>`<div class="selected-charge">${logoHtml(x,false,'small')}<div class="meta"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${freq(x.frequency)}</span></div><div class="amount">${money(x.price,x.currency)}</div></div>`).join(''):empty('No hay cobros este día.'))}

function render(){populateCategories();renderDashboard();renderSubscriptions();renderCalendar()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2200)}
function modal(open){$('#modalBackdrop').hidden=!open;document.body.style.overflow=open?'hidden':'';if(!open){$('#subscriptionForm').reset();$('#editingId').value='';pendingIcon='';setIconPreview('');$('#modalEyebrow').textContent='NUEVA SUSCRIPCIÓN';$('#modalTitle').textContent='Añadir servicio';$('#saveBtn').textContent='Guardar suscripción'}}
function setIconPreview(value='',name=''){const p=$('#iconPreview'),custom=safeLogo(value),service=findService(name);if(custom)p.innerHTML=`<img src="${custom}" alt="Vista previa">`;else if(service)p.innerHTML=`<img class="auto-logo" src="${brandUrl(service)}" data-backup="${brandUrl(service,true)}" data-fallback="${esc(initials(name))}" alt="Logo detectado">`;else p.innerHTML=`<span>${esc(name?initials(name):'+')}</span>`;$('#removeIconBtn').hidden=!custom;applyImageFallbacks()}
function openEdit(id){const x=items.find(i=>i.id===id);if(!x)return;modal(true);$('#editingId').value=x.id;$('#name').value=x.name;$('#price').value=x.price;$('#currency').value=x.currency;$('#renewalDate').value=x.renewalDate;$('#frequency').value=x.frequency;$('#category').value=x.category;$('#cancelBeforeRenewal').checked=!!x.cancelBeforeRenewal;pendingIcon=safeLogo(x.logo);setIconPreview(pendingIcon,x.name);$('#modalEyebrow').textContent='EDITAR SUSCRIPCIÓN';$('#modalTitle').textContent=x.name;$('#saveBtn').textContent='Guardar cambios'}
function switchView(id){$$('.view').forEach(v=>v.classList.remove('active-view'));$(`#${id}View`)?.classList.add('active-view');$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));$('#pageTitle').textContent=({dashboard:'Tus suscripciones',subscriptions:'Todas las suscripciones',calendar:'Calendario de cobros'})[id];if(id==='calendar')renderCalendar();window.scrollTo({top:0,behavior:'smooth'})}
function fileToLogo(file){return new Promise((resolve,reject)=>{if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))return reject(new Error('Usa PNG, JPG o WebP'));if(file.size>4*1024*1024)return reject(new Error('Máximo 4 MB'));const r=new FileReader();r.onerror=()=>reject(new Error('No se pudo leer'));r.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('No se pudo procesar'));img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),side=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;ctx.drawImage(img,sx,sy,side,side,0,0,128,128);resolve(c.toDataURL('image/webp',.86))};img.src=r.result};r.readAsDataURL(file)})}
function chooseExistingIcon(id){const inp=document.createElement('input');inp.type='file';inp.accept='image/png,image/jpeg,image/webp';inp.onchange=async()=>{if(!inp.files?.[0])return;try{const logo=await fileToLogo(inp.files[0]),x=items.find(i=>i.id===id);if(x){x.logo=logo;save();render();toast('Icono actualizado')}}catch(e){toast(e.message)}};inp.click()}

$('#openModalBtn').onclick=()=>{modal(true);$('#renewalDate').value=addDays(30)};$('#closeModalBtn').onclick=()=>modal(false);$('#cancelModalBtn').onclick=()=>modal(false);$('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')modal(false)};
['searchInput','statusFilter','categoryFilter','sortSelect'].forEach(id=>$('#'+id).addEventListener(id==='searchInput'?'input':'change',renderSubscriptions));
$$('.view-mode').forEach(b=>b.onclick=()=>{subscriptionLayout=b.dataset.mode;localStorage.setItem(LAYOUT_KEY,subscriptionLayout);applySubscriptionLayout()});
$('#iconFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{pendingIcon=await fileToLogo(f);setIconPreview(pendingIcon,$('#name').value)}catch(err){toast(err.message)}};$('#removeIconBtn').onclick=()=>{pendingIcon='';$('#iconFile').value='';setIconPreview('',$('#name').value)};$('#name').oninput=()=>{if(!pendingIcon)setIconPreview('', $('#name').value)};
$('#subscriptionForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),id=d.get('editingId'),entry={id:id||uid(),name:String(d.get('name')).trim(),price:Number(d.get('price')),currency:d.get('currency'),renewalDate:d.get('renewalDate'),frequency:d.get('frequency'),category:d.get('category'),cancelBeforeRenewal:d.get('cancelBeforeRenewal')==='on'};if(pendingIcon)entry.logo=pendingIcon;else if(id){const old=items.find(x=>x.id===id);if(old?.logo)entry.logo=old.logo}if(id)items=items.map(x=>x.id===id?entry:x);else items.push(entry);save();render();modal(false);toast(id?'Cambios guardados':'Suscripción guardada')};
document.addEventListener('click',e=>{const view=e.target.closest('[data-view]')?.dataset.view||e.target.closest('[data-view-target]')?.dataset.viewTarget;if(view){switchView(view);return}const day=e.target.closest('[data-date]');if(day){selectedDate=day.dataset.date;renderCalendar();return}const edit=e.target.closest('[data-edit]');if(edit){openEdit(edit.dataset.edit);return}const icon=e.target.closest('[data-icon]');if(icon){chooseExistingIcon(icon.dataset.icon);return}const del=e.target.closest('[data-delete]');if(del){items=items.filter(x=>x.id!==del.dataset.delete);save();render();toast('Suscripción eliminada');return}const tog=e.target.closest('[data-toggle]');if(tog){const x=items.find(i=>i.id===tog.dataset.toggle);if(x){x.cancelBeforeRenewal=!x.cancelBeforeRenewal;save();render();toast('Estado actualizado')}}});
$('#prevMonthBtn').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderCalendar()};$('#nextMonthBtn').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderCalendar()};$('#todayBtn').onclick=()=>{calendarCursor=new Date(startToday().getFullYear(),startToday().getMonth(),1);selectedDate=iso(startToday());renderCalendar()};
$('#themeBtn').onclick=()=>{const dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'':'dark';localStorage.setItem(THEME_KEY,dark?'light':'dark')};if(localStorage.getItem(THEME_KEY)==='dark')document.documentElement.dataset.theme='dark';
$('#notificationBtn').onclick=async()=>{if(!('Notification'in window))return toast('Tu navegador no admite avisos');const p=await Notification.requestPermission();toast(p==='granted'?'Avisos activados mientras la app esté abierta':'Permiso de avisos no concedido')};
render();