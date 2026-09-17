const KEY='suscripto-v1';
const LAYOUT_KEY='suscripto-layout';
const THEME_KEY='suscripto-theme';
const NOTICE_KEY='suscripto-last-notice';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const startOfDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const today=()=>startOfDay(new Date());
const parse=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(date,n)=>{const d=new Date(date);d.setDate(d.getDate()+n);return startOfDay(d)};
const addDaysFromToday=n=>iso(addDays(today(),n));
const money=(n,c='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number(n)||0);
const shortMoney=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:n>=100?0:2}).format(Number(n)||0);
const dateLabel=s=>new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(parse(s));
const monthLabel=d=>new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(d).replace(/^./,c=>c.toUpperCase());
const dayLong=d=>new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(d).replace(/^./,c=>c.toUpperCase());
const daysUntil=d=>Math.ceil((startOfDay(d)-today())/86400000);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>String(n||'S').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'S';
const freq=f=>({monthly:'Mensual',quarterly:'Cada 3 meses',yearly:'Anual','one-time':'Pago único'})[f]||f;
const frequencyMonths=f=>({monthly:1,quarterly:3,yearly:12})[f]||0;
const monthlyEquivalent=x=>x.frequency==='monthly'?x.price:x.frequency==='quarterly'?x.price/3:x.frequency==='yearly'?x.price/12:0;
const empty=t=>`<div class="empty-state">${esc(t)}</div>`;

const icons={
 edit:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14.5 7.5 3 3"/></svg>`,
 image:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
 flag:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 5h10l-1 4 3 3H5"/></svg>`,
 trash:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>`
};

const categoryColors={
 'Entretenimiento':'#6c63ff','Software':'#3f8cff','Trabajo':'#24a69a','Educación':'#f2a341',
 'Cloud':'#7d68b2','Salud':'#e56b8f','Finanzas':'#38a169','Otros':'#9aa1b1'
};
const fallbackColors=['#6c63ff','#3f8cff','#24a69a','#f2a341','#e56b8f','#7d68b2','#9aa1b1'];
const categoryColor=(name,index=0)=>categoryColors[name]||fallbackColors[index%fallbackColors.length];

const knownServices=[
 {terms:['chatgpt','openai'],icon:'openai',color:'111827'},
 {terms:['spotify'],icon:'spotify',color:'1DB954'},
 {terms:['adobe creative cloud','creative cloud','adobe'],icon:'adobecreativecloud',color:'DA1F26'},
 {terms:['icloud','apple one','apple music','apple tv','apple'],icon:'apple',color:'111111'},
 {terms:['netflix'],icon:'netflix',color:'E50914'},
 {terms:['youtube premium','youtube'],icon:'youtube',color:'FF0000'},
 {terms:['disney+','disney plus','disney'],icon:'disneyplus',color:'113CCF'},
 {terms:['prime video','amazon prime'],icon:'primevideo',color:'00A8E1'},
 {terms:['microsoft 365','office 365','microsoft'],icon:'microsoft',color:'5E5E5E'},
 {terms:['onedrive'],icon:'microsoftonedrive',color:'0078D4'},
 {terms:['github'],icon:'github',color:'181717'},
 {terms:['notion'],icon:'notion',color:'111111'},
 {terms:['canva'],icon:'canva',color:'00C4CC'},
 {terms:['dropbox'],icon:'dropbox',color:'0061FF'},
 {terms:['figma'],icon:'figma',color:'F24E1E'},
 {terms:['claude','anthropic'],icon:'anthropic',color:'191919'},
 {terms:['perplexity'],icon:'perplexity',color:'20808D'},
 {terms:['midjourney'],icon:'midjourney',color:'111111'},
 {terms:['vercel'],icon:'vercel',color:'111111'},
 {terms:['google one'],icon:'googleone',color:'4285F4'},
 {terms:['google drive'],icon:'googledrive',color:'4285F4'},
 {terms:['gemini'],icon:'googlegemini',color:'8E75B2'},
 {terms:['slack'],icon:'slack',color:'4A154B'},
 {terms:['discord'],icon:'discord',color:'5865F2'},
 {terms:['twitch'],icon:'twitch',color:'9146FF'},
 {terms:['xbox game pass','game pass','xbox'],icon:'xbox',color:'107C10'},
 {terms:['playstation plus','playstation'],icon:'playstation',color:'003791'},
 {terms:['linkedin'],icon:'linkedin',color:'0A66C2'},
 {terms:['hbo max','max'],icon:'hbo',color:'5B2EFF'}
];
const findService=name=>{const n=String(name||'').toLowerCase();return knownServices.find(s=>s.terms.some(t=>n.includes(t)))};
const iconifyUrl=(service,host='api.iconify.design')=>`https://${host}/simple-icons:${service.icon}.svg?color=%23${service.color}`;
const safeLogo=logo=>typeof logo==='string'&&/^data:image\/(?:png|jpeg|webp);base64,/i.test(logo)?logo:'';

function logoHtml(item,editable=false,size='normal'){
 const custom=safeLogo(item.logo);
 const service=findService(item.name);
 const tag=editable?'button':'div';
 const attrs=editable?` type="button" data-icon="${esc(item.id)}" title="Cambiar icono" aria-label="Cambiar icono de ${esc(item.name)}"`:'';
 const classes=`service-logo${custom||service?' has-image':''}${size==='small'?' service-logo-small':''}`;
 if(custom)return `<${tag} class="${classes}"${attrs}><img src="${custom}" alt="Logo de ${esc(item.name)}"></${tag}>`;
 if(service){
   const main=iconifyUrl(service),backup=iconifyUrl(service,'api.simplesvg.com');
   return `<${tag} class="${classes}"${attrs}><img class="auto-logo" src="${main}" data-alt-src="${backup}" data-fallback="${esc(initials(item.name))}" alt="Logo de ${esc(item.name)}"></${tag}>`;
 }
 return `<${tag} class="${classes}"${attrs}><span>${esc(initials(item.name))}</span></${tag}>`;
}

function wireImageFallbacks(root=document){
 root.querySelectorAll('img[data-alt-src]').forEach(img=>{
   if(img.dataset.wired)return;
   img.dataset.wired='1';
   img.addEventListener('error',()=>{
     if(img.dataset.triedBackup!=='1'){
       img.dataset.triedBackup='1';
       img.src=img.dataset.altSrc;
       return;
     }
     const parent=img.parentElement;
     if(parent){parent.classList.remove('has-image');parent.innerHTML=`<span>${esc(img.dataset.fallback||'S')}</span>`}
   });
 });
}

const demo=[
 {id:uid(),name:'ChatGPT Plus',price:23,currency:'EUR',renewalDate:addDaysFromToday(4),frequency:'monthly',category:'Software',cancelBeforeRenewal:false},
 {id:uid(),name:'Spotify',price:10.99,currency:'EUR',renewalDate:addDaysFromToday(9),frequency:'monthly',category:'Entretenimiento',cancelBeforeRenewal:false},
 {id:uid(),name:'Adobe Creative Cloud',price:24.19,currency:'EUR',renewalDate:addDaysFromToday(14),frequency:'monthly',category:'Trabajo',cancelBeforeRenewal:true},
 {id:uid(),name:'iCloud+',price:2.99,currency:'EUR',renewalDate:addDaysFromToday(18),frequency:'monthly',category:'Cloud',cancelBeforeRenewal:false},
 {id:uid(),name:'Dominios web',price:18.5,currency:'EUR',renewalDate:addDaysFromToday(55),frequency:'yearly',category:'Trabajo',cancelBeforeRenewal:false}
];

function normalizeItem(x){
 return {
   id:String(x?.id||uid()),name:String(x?.name||'Suscripción').slice(0,80),
   price:Math.max(0,Number(x?.price)||0),currency:['EUR','USD','GBP'].includes(x?.currency)?x.currency:'EUR',
   renewalDate:/^\d{4}-\d{2}-\d{2}$/.test(x?.renewalDate||'')?x.renewalDate:addDaysFromToday(30),
   frequency:['monthly','quarterly','yearly','one-time'].includes(x?.frequency)?x.frequency:'monthly',
   category:String(x?.category||'Otros'),cancelBeforeRenewal:Boolean(x?.cancelBeforeRenewal),
   ...(safeLogo(x?.logo)?{logo:x.logo}:{})
 };
}

let items=[];
try{const stored=JSON.parse(localStorage.getItem(KEY));items=Array.isArray(stored)&&stored.length?stored.map(normalizeItem):demo}catch{items=demo}
let pendingIcon='';
let editingId=null;
let subscriptionLayout=localStorage.getItem(LAYOUT_KEY)==='list'?'list':'grid';
let calendarCursor=new Date(today().getFullYear(),today().getMonth(),1);
let selectedDay=iso(today());

function save(){
 try{localStorage.setItem(KEY,JSON.stringify(items));return true}catch{toast('No se pudieron guardar los cambios en el navegador');return false}
}

function addMonthsClamped(base,months){
 const y=base.getFullYear(),m=base.getMonth()+months,day=base.getDate();
 const last=new Date(y,m+1,0).getDate();
 return new Date(y,m,Math.min(day,last));
}
function occurrenceAt(item,k){
 const base=parse(item.renewalDate);
 if(item.frequency==='one-time')return k===0?base:null;
 const step=frequencyMonths(item.frequency);
 return addMonthsClamped(base,step*k);
}
function nextOccurrence(item,from=today()){
 const base=parse(item.renewalDate);
 if(item.frequency==='one-time')return base>=from?base:null;
 const step=frequencyMonths(item.frequency);
 if(base>=from)return base;
 const monthDelta=(from.getFullYear()-base.getFullYear())*12+(from.getMonth()-base.getMonth());
 let k=Math.max(0,Math.floor(monthDelta/step)-1);
 for(let guard=0;guard<8;guard++,k++){
   const d=occurrenceAt(item,k);
   if(d>=from)return d;
 }
 return occurrenceAt(item,k);
}
function occurrencesBetween(start,end){
 const out=[];
 items.forEach(item=>{
   const base=parse(item.renewalDate);
   if(item.frequency==='one-time'){
     if(base>=start&&base<=end)out.push({...item,occurrenceDate:base});
     return;
   }
   const step=frequencyMonths(item.frequency);
   const monthDelta=(start.getFullYear()-base.getFullYear())*12+(start.getMonth()-base.getMonth());
   let k=Math.max(0,Math.floor(monthDelta/step)-2);
   for(let guard=0;guard<80;guard++,k++){
     const d=occurrenceAt(item,k);
     if(d>end)break;
     if(d>=start)out.push({...item,occurrenceDate:d});
   }
 });
 return out.sort((a,b)=>a.occurrenceDate-b.occurrenceDate);
}
function relativeDate(d){
 const n=daysUntil(d);
 if(n===0)return 'hoy';if(n===1)return 'mañana';if(n>1)return `en ${n} días`;if(n===-1)return 'ayer';return `hace ${Math.abs(n)} días`;
}
function eurItems(){return items.filter(x=>x.currency==='EUR')}
function eurMonthly(){return eurItems().filter(x=>x.frequency!=='one-time').reduce((a,x)=>a+monthlyEquivalent(x),0)}

function renderDashboard(){
 const recurring=eurItems().filter(x=>x.frequency!=='one-time');
 const monthlyTotal=recurring.reduce((a,x)=>a+monthlyEquivalent(x),0);
 const annualTotal=monthlyTotal*12;
 const savings=recurring.filter(x=>x.cancelBeforeRenewal).reduce((a,x)=>a+monthlyEquivalent(x)*12,0);
 $('#monthlySpend').textContent=money(monthlyTotal);
 $('#yearlySpend').textContent=money(annualTotal);
 $('#potentialSavings').textContent=savings?`${shortMoney(savings)}/año`:'0,00 €';
 $('#activeCount').textContent=`${items.length} ${items.length===1?'suscripción':'suscripciones'} activas`;
 const otherCurrencies=items.filter(x=>x.currency!=='EUR').length;
 $('#currencyNote').textContent=otherCurrencies?`${otherCurrencies} en otra moneda fuera del total`:'Totales en EUR';

 const nextList=items.map(x=>({item:x,date:nextOccurrence(x)})).filter(x=>x.date).sort((a,b)=>a.date-b.date);
 const next=nextList[0];
 $('#nextChargeAmount').textContent=next?money(next.item.price,next.item.currency):'—';
 $('#nextChargeName').textContent=next?`${next.item.name} · ${relativeDate(next.date)}`:'Sin cobros próximos';

 const now=today(),in30=addDays(now,30);
 const soon=occurrencesBetween(now,in30);
 const soonEur=soon.filter(x=>x.currency==='EUR');
 $('#next30Spend').textContent=money(soonEur.reduce((a,x)=>a+x.price,0));
 $('#next30Count').textContent=`${soon.length} ${soon.length===1?'renovación':'renovaciones'}`;
 $('#cancelCount').textContent=items.filter(x=>x.cancelBeforeRenewal).length;

 const nextMonthStart=new Date(now.getFullYear(),now.getMonth()+1,1);
 const nextMonthEnd=new Date(now.getFullYear(),now.getMonth()+2,0);
 const nextMonth=occurrencesBetween(nextMonthStart,nextMonthEnd);
 $('#nextMonthSpend').textContent=money(nextMonth.filter(x=>x.currency==='EUR').reduce((a,x)=>a+x.price,0));
 $('#nextMonthCount').textContent=`${nextMonth.length} ${nextMonth.length===1?'cobro previsto':'cobros previstos'}`;

 renderDonut();
 renderForecast();
 renderTimeline();
 renderCalendars();
}

function renderDonut(){
 const recurring=eurItems().filter(x=>x.frequency!=='one-time');
 const cats={};recurring.forEach(x=>cats[x.category]=(cats[x.category]||0)+monthlyEquivalent(x));
 const entries=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
 const total=entries.reduce((a,[,v])=>a+v,0);
 $('#donutTotal').textContent=shortMoney(total);
 const chart=$('#donutChart');
 if(!entries.length||total<=0){chart.style.background='conic-gradient(#ebeef5 0deg 360deg)';$('#categoryLegend').innerHTML='<div class="empty-inline">Añade suscripciones para ver la distribución.</div>';return}
 let acc=0;const segments=[];
 entries.forEach(([name,value],i)=>{const start=acc/total*360;acc+=value;const end=acc/total*360;segments.push(`${categoryColor(name,i)} ${start}deg ${end}deg`)});
 chart.style.background=`conic-gradient(${segments.join(',')})`;
 $('#categoryLegend').innerHTML=entries.map(([name,value],i)=>{
   const pct=Math.round(value/total*100);
   return `<div class="legend-row"><span class="legend-dot" style="background:${categoryColor(name,i)}"></span><div class="legend-copy"><strong>${esc(name)}</strong><span>${pct}% del gasto</span></div><div class="legend-value"><strong>${shortMoney(value)}</strong><span>/ mes</span></div></div>`;
 }).join('');
}

function renderForecast(){
 const now=today();const months=[];
 for(let i=0;i<6;i++){
   const start=new Date(now.getFullYear(),now.getMonth()+i,1),end=new Date(now.getFullYear(),now.getMonth()+i+1,0);
   const occ=occurrencesBetween(start,end).filter(x=>x.currency==='EUR');
   months.push({date:start,value:occ.reduce((a,x)=>a+x.price,0)});
 }
 const max=Math.max(1,...months.map(x=>x.value));
 $('#forecastChart').innerHTML=months.map(({date,value})=>{
   const label=new Intl.DateTimeFormat('es-ES',{month:'short'}).format(date).replace('.','');
   const height=value?Math.max(7,Math.round(value/max*100)):2;
   return `<div class="forecast-col"><span class="forecast-value">${value?shortMoney(value):'—'}</span><div class="forecast-track"><div class="forecast-bar" style="height:${height}%"></div></div><span class="forecast-label">${esc(label)}</span></div>`;
 }).join('');
}

function renderTimeline(){
 const start=today(),end=addDays(start,365);
 const list=occurrencesBetween(start,end).slice(0,7);
 $('#upcomingTimeline').innerHTML=list.map(x=>{
   const d=x.occurrenceDate,mon=new Intl.DateTimeFormat('es-ES',{month:'short'}).format(d).replace('.','');
   return `<div class="timeline-item"><div class="timeline-date"><strong>${d.getDate()}</strong><span>${esc(mon)}</span></div><div class="timeline-main">${logoHtml(x,false,'small')}<div class="timeline-copy"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${relativeDate(d)}</span></div></div><div class="timeline-amount"><strong>${money(x.price,x.currency)}</strong><span>${x.cancelBeforeRenewal?'Cancelar antes':freq(x.frequency)}</span></div></div>`;
 }).join('')||'<div class="empty-inline">No hay cobros previstos durante los próximos meses.</div>';
 wireImageFallbacks($('#upcomingTimeline'));
}

function getCalendarGridData(cursor){
 const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);
 const mondayOffset=(first.getDay()+6)%7;
 const gridStart=addDays(first,-mondayOffset),gridEnd=addDays(gridStart,41);
 const occ=occurrencesBetween(gridStart,gridEnd),groups={};
 occ.forEach(x=>{const key=iso(x.occurrenceDate);(groups[key]||(groups[key]=[])).push(x)});
 return {first,gridStart,gridEnd,groups,occ};
}
function renderCalendarGrid(targetId,compact){
 const target=$(`#${targetId}`);if(!target)return;
 const {gridStart,groups}=getCalendarGridData(calendarCursor);
 const weekdays=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
 let html=weekdays.map(x=>`<div class="weekday">${x}</div>`).join('');
 for(let i=0;i<42;i++){
   const d=addDays(gridStart,i),key=iso(d),events=groups[key]||[];
   const outside=d.getMonth()!==calendarCursor.getMonth(),isToday=key===iso(today()),isSelected=key===selectedDay;
   const classes=['calendar-day',outside?'outside':'',isToday?'today':'',isSelected?'selected':''].filter(Boolean).join(' ');
   const total=events.filter(x=>x.currency==='EUR').reduce((a,x)=>a+x.price,0);
   let eventHtml='';
   if(compact){
     eventHtml=events.length?`<div class="day-dots">${events.slice(0,3).map((x,idx)=>`<span class="event-dot" style="background:${x.cancelBeforeRenewal?'var(--danger)':categoryColor(x.category,idx)}"></span>`).join('')}${events.length>3?`<span class="event-more">+${events.length-3}</span>`:''}</div>${total?`<div class="day-total">${shortMoney(total)}</div>`:''}`:'';
   }else{
     eventHtml=events.length?`<div class="day-events">${events.slice(0,3).map(x=>`<div class="day-event-chip ${x.cancelBeforeRenewal?'cancel':''}" title="${esc(x.name)} · ${money(x.price,x.currency)}">${esc(x.name)}</div>`).join('')}${events.length>3?`<div class="event-more">+${events.length-3} más</div>`:''}</div><div class="day-dots">${events.slice(0,4).map((x,idx)=>`<span class="event-dot" style="background:${x.cancelBeforeRenewal?'var(--danger)':categoryColor(x.category,idx)}"></span>`).join('')}</div>`:'';
   }
   html+=`<button type="button" class="${classes}" data-day="${key}" aria-label="${dayLong(d)}${events.length?`, ${events.length} cobros`:''}"><span class="day-number">${d.getDate()}</span>${eventHtml}</button>`;
 }
 target.innerHTML=html;
}
function renderCalendars(){
 const label=monthLabel(calendarCursor);
 $('#dashboardMonthLabel').textContent=label;$('#calendarMonthLabel').textContent=label;
 renderCalendarGrid('dashboardCalendar',true);renderCalendarGrid('calendarGrid',false);
 const monthStart=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth(),1),monthEnd=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,0);
 const monthOcc=occurrencesBetween(monthStart,monthEnd);
 $('#calendarMonthSpend').textContent=money(monthOcc.filter(x=>x.currency==='EUR').reduce((a,x)=>a+x.price,0));
 $('#calendarMonthCount').textContent=monthOcc.length;
 $('#calendarMonthCancel').textContent=monthOcc.filter(x=>x.cancelBeforeRenewal).length;
 renderSelectedDay();
}
function renderSelectedDay(){
 const d=parse(selectedDay);
 $('#selectedDayTitle').textContent=dayLong(d);
 const events=occurrencesBetween(d,d);
 $('#selectedDayList').innerHTML=events.map(x=>`<div class="day-detail-item">${logoHtml(x,false,'small')}<div><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${freq(x.frequency)}</span></div><span class="day-detail-amount">${money(x.price,x.currency)}</span></div>`).join('')||'<div class="empty-inline">No tienes cobros previstos este día.</div>';
 wireImageFallbacks($('#selectedDayList'));
}

function updateCategoryFilter(){
 const select=$('#categoryFilter'),current=select.value||'all';
 const cats=[...new Set(items.map(x=>x.category))].sort((a,b)=>a.localeCompare(b,'es'));
 select.innerHTML='<option value="all">Todas las categorías</option>'+cats.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
 select.value=cats.includes(current)?current:'all';
}
function renderSubscriptionsSummary(){
 const monthly=eurMonthly();
 const next=items.map(x=>({item:x,date:nextOccurrence(x)})).filter(x=>x.date).sort((a,b)=>a.date-b.date)[0];
 $('#subscriptionsSummary').innerHTML=`<div class="summary-pill"><span>Suscripciones</span><strong>${items.length}</strong></div><div class="summary-pill"><span>Gasto recurrente</span><strong>${shortMoney(monthly)}/mes</strong></div><div class="summary-pill"><span>Siguiente renovación</span><strong>${next?new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short'}).format(next.date):'—'}</strong></div>`;
}
function renderSubscriptions(){
 updateCategoryFilter();renderSubscriptionsSummary();
 const q=$('#searchInput').value.trim().toLowerCase(),status=$('#statusFilter').value,cat=$('#categoryFilter').value,sort=$('#sortSelect').value;
 let list=items.filter(x=>x.name.toLowerCase().includes(q)&&(status==='all'||(status==='cancel'&&x.cancelBeforeRenewal)||(status==='active'&&!x.cancelBeforeRenewal))&&(cat==='all'||x.category===cat));
 list=[...list].sort((a,b)=>{
   if(sort==='price-desc')return b.price-a.price;if(sort==='price-asc')return a.price-b.price;if(sort==='name')return a.name.localeCompare(b.name,'es');
   const ad=nextOccurrence(a)||new Date(8640000000000000),bd=nextOccurrence(b)||new Date(8640000000000000);return ad-bd;
 });
 $('#subscriptionsGrid').innerHTML=list.map(x=>{
   const next=nextOccurrence(x),renewal=next?`${dateLabel(iso(next))} · ${relativeDate(next)}`:'Sin próximos cobros';
   return `<article class="subscription-card"><div class="subscription-top">${logoHtml(x,true)}<span class="badge ${x.cancelBeforeRenewal?'badge-danger':''}">${x.cancelBeforeRenewal?'Cancelar antes':'Activa'}</span></div><div class="subscription-copy"><h3>${esc(x.name)}</h3><p>${esc(x.category)} · ${freq(x.frequency)}</p></div><div class="subscription-price">${money(x.price,x.currency)}</div><p class="renewal-copy">Próximo cobro: ${renewal}</p><div class="card-actions"><button class="small-btn primary-action" data-edit="${x.id}">${icons.edit}Editar</button><button class="small-btn" data-icon="${x.id}">${icons.image}Icono</button><button class="small-btn" data-toggle="${x.id}">${icons.flag}${x.cancelBeforeRenewal?'Mantener':'Cancelar antes'}</button><button class="small-btn danger" data-delete="${x.id}">${icons.trash}Eliminar</button></div></article>`;
 }).join('')||empty('No hay suscripciones que coincidan con estos filtros.');
 applySubscriptionLayout();wireImageFallbacks($('#subscriptionsGrid'));
}

function render(){renderDashboard();renderSubscriptions();wireImageFallbacks()}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}

function applySubscriptionLayout(){
 $('#subscriptionsGrid').classList.toggle('list-mode',subscriptionLayout==='list');
 $$('.view-mode').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===subscriptionLayout));
}

function renderIconPreview(name=$('#name').value.trim()){
 const preview=$('#iconPreview');
 if(pendingIcon){preview.innerHTML=`<img src="${pendingIcon}" alt="Vista previa del icono personalizado">`;preview.classList.add('has-image');$('#removeIconBtn').hidden=false;return}
 const service=findService(name);
 if(service){preview.classList.add('has-image');preview.innerHTML=`<img src="${iconifyUrl(service)}" data-alt-src="${iconifyUrl(service,'api.simplesvg.com')}" data-fallback="${esc(initials(name))}" alt="Logo detectado automáticamente">`;$('#removeIconBtn').hidden=true;wireImageFallbacks(preview);return}
 preview.classList.remove('has-image');preview.innerHTML=`<span>${esc(name?initials(name):'+')}</span>`;$('#removeIconBtn').hidden=true;
}
function setModal(open,item=null){
 $('#modalBackdrop').hidden=!open;document.body.style.overflow=open?'hidden':'';
 if(!open){editingId=null;pendingIcon='';$('#subscriptionForm').reset();renderIconPreview('');return}
 editingId=item?.id||null;pendingIcon=safeLogo(item?.logo)||'';
 $('#modalEyebrow').textContent=editingId?'EDITAR SUSCRIPCIÓN':'NUEVA SUSCRIPCIÓN';
 $('#modalTitle').textContent=editingId?'Editar servicio':'Añadir servicio';
 $('#saveButtonText').textContent=editingId?'Guardar cambios':'Guardar suscripción';
 $('#name').value=item?.name||'';$('#price').value=item?.price??'';$('#currency').value=item?.currency||'EUR';$('#renewalDate').value=item?.renewalDate||addDaysFromToday(30);$('#frequency').value=item?.frequency||'monthly';$('#category').value=item?.category||'Entretenimiento';$('#cancelBeforeRenewal').checked=Boolean(item?.cancelBeforeRenewal);$('#iconFile').value='';renderIconPreview(item?.name||'');
 setTimeout(()=>$('#name').focus(),40);
}

function fileToLogo(file){
 return new Promise((resolve,reject)=>{
   if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))return reject(new Error('Usa una imagen PNG, JPG o WebP'));
   if(file.size>4*1024*1024)return reject(new Error('La imagen es demasiado grande. Máximo 4 MB'));
   const reader=new FileReader();reader.onerror=()=>reject(new Error('No se pudo leer la imagen'));
   reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('No se pudo procesar la imagen'));img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');const side=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;ctx.clearRect(0,0,128,128);ctx.drawImage(img,sx,sy,side,side,0,0,128,128);resolve(canvas.toDataURL('image/webp',.84))};img.src=reader.result};reader.readAsDataURL(file);
 });
}
function chooseExistingIcon(id){
 const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';
 input.addEventListener('change',async()=>{if(!input.files?.[0])return;try{const logo=await fileToLogo(input.files[0]);const item=items.find(x=>x.id===id);if(!item)return;item.logo=logo;if(save()){render();toast('Icono actualizado')}}catch(err){toast(err.message||'No se pudo cargar el icono')}});input.click();
}

function switchView(id){
 $$('.view').forEach(v=>v.classList.remove('active-view'));$(`#${id}View`)?.classList.add('active-view');$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));
 const titles={dashboard:['Tus suscripciones','Todo lo que pagas, claro y en un solo sitio.'],subscriptions:['Todas las suscripciones','Busca, ordena y gestiona cada servicio.'],calendar:['Calendario de cobros','Visualiza exactamente cuándo llega cada renovación.']};
 $('#pageTitle').textContent=titles[id]?.[0]||'Suscripto';$('#pageSubtitle').textContent=titles[id]?.[1]||'';
 if(id==='calendar')renderCalendars();
 window.scrollTo({top:0,behavior:'smooth'});
}

function setTheme(theme){
 const value=theme==='dark'?'dark':'light';document.documentElement.dataset.theme=value==='dark'?'dark':'';localStorage.setItem(THEME_KEY,value);$('#themeLabel').textContent=value==='dark'?'Modo claro':'Modo oscuro';
}
function initTheme(){const saved=localStorage.getItem(THEME_KEY);setTheme(saved==='dark'?'dark':'light')}

async function enableNotifications(){
 if(!('Notification' in window)){toast('Este navegador no admite notificaciones');return}
 try{
   const permission=await Notification.requestPermission();
   if(permission==='granted'){toast('Avisos del navegador activados');updateNotificationButton();checkDueNotifications(true)}
   else toast('No se han activado los avisos');
 }catch{toast('No se pudieron activar las notificaciones')}
}
function updateNotificationButton(){
 const btn=$('#notificationBtn');if(!btn)return;
 btn.textContent=('Notification' in window&&Notification.permission==='granted')?'Avisos activados':'Activar avisos';
}
function checkDueNotifications(force=false){
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 const stamp=iso(today());if(!force&&localStorage.getItem(NOTICE_KEY)===stamp)return;
 const events=occurrencesBetween(today(),addDays(today(),1));
 events.slice(0,3).forEach(x=>{const when=iso(x.occurrenceDate)===stamp?'hoy':'mañana';try{new Notification(`${x.name} se renueva ${when}`,{body:`Cobro previsto: ${money(x.price,x.currency)}`,icon:findService(x.name)?iconifyUrl(findService(x.name)):undefined})}catch{}});
 localStorage.setItem(NOTICE_KEY,stamp);
}

$('#openModalBtn').addEventListener('click',()=>setModal(true));
$('#closeModalBtn').addEventListener('click',()=>setModal(false));
$('#cancelModalBtn').addEventListener('click',()=>setModal(false));
$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')setModal(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modalBackdrop').hidden)setModal(false)});
$('#searchInput').addEventListener('input',renderSubscriptions);$('#statusFilter').addEventListener('change',renderSubscriptions);$('#categoryFilter').addEventListener('change',renderSubscriptions);$('#sortSelect').addEventListener('change',renderSubscriptions);
$('#name').addEventListener('input',()=>{if(!pendingIcon)renderIconPreview()});
$('#iconFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{pendingIcon=await fileToLogo(file);renderIconPreview();toast('Imagen preparada')}catch(err){pendingIcon='';e.target.value='';renderIconPreview();toast(err.message||'No se pudo cargar la imagen')}});
$('#removeIconBtn').addEventListener('click',()=>{pendingIcon='';$('#iconFile').value='';renderIconPreview();toast('Se usará el icono automático')});
$('#notificationBtn').addEventListener('click',enableNotifications);
$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

$$('.view-mode').forEach(btn=>btn.addEventListener('click',()=>{subscriptionLayout=btn.dataset.mode==='list'?'list':'grid';localStorage.setItem(LAYOUT_KEY,subscriptionLayout);applySubscriptionLayout()}));

$('#subscriptionForm').addEventListener('submit',e=>{
 e.preventDefault();const d=new FormData(e.currentTarget),name=String(d.get('name')||'').trim(),price=Number(d.get('price'));
 if(!name){toast('Escribe el nombre del servicio');return}if(!Number.isFinite(price)||price<0){toast('Revisa el precio');return}
 const wasEditing=Boolean(editingId);
 const data={id:editingId||uid(),name,price,currency:d.get('currency'),renewalDate:d.get('renewalDate'),frequency:d.get('frequency'),category:d.get('category'),cancelBeforeRenewal:d.get('cancelBeforeRenewal')==='on'};
 if(pendingIcon)data.logo=pendingIcon;
 if(editingId){const idx=items.findIndex(x=>x.id===editingId);if(idx>=0)items[idx]=normalizeItem(data)}else items.push(normalizeItem(data));
 if(save()){render();setModal(false);toast(wasEditing?'Suscripción actualizada':'Suscripción guardada')}
});

document.addEventListener('click',e=>{
 const view=e.target.closest('[data-view]')?.dataset.view||e.target.closest('[data-view-target]')?.dataset.viewTarget;if(view){switchView(view);return}
 const nav=e.target.closest('[data-cal-nav]');if(nav){calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+Number(nav.dataset.calNav),1);selectedDay=iso(calendarCursor);renderCalendars();return}
 if(e.target.closest('[data-cal-today]')){calendarCursor=new Date(today().getFullYear(),today().getMonth(),1);selectedDay=iso(today());renderCalendars();return}
 const day=e.target.closest('[data-day]');if(day){selectedDay=day.dataset.day;const d=parse(selectedDay);calendarCursor=new Date(d.getFullYear(),d.getMonth(),1);if(day.closest('#dashboardCalendar'))switchView('calendar');renderCalendars();return}
 const edit=e.target.closest('[data-edit]');if(edit){const item=items.find(x=>x.id===edit.dataset.edit);if(item)setModal(true,item);return}
 const icon=e.target.closest('[data-icon]');if(icon){chooseExistingIcon(icon.dataset.icon);return}
 const toggle=e.target.closest('[data-toggle]');if(toggle){const item=items.find(x=>x.id===toggle.dataset.toggle);if(item){item.cancelBeforeRenewal=!item.cancelBeforeRenewal;if(save()){render();toast(item.cancelBeforeRenewal?'Marcada para cancelar':'Se mantendrá la suscripción')}}return}
 const del=e.target.closest('[data-delete]');if(del){const item=items.find(x=>x.id===del.dataset.delete);if(item&&confirm(`¿Eliminar ${item.name}?`)){items=items.filter(x=>x.id!==item.id);if(save()){render();toast('Suscripción eliminada')}}}
});

initTheme();updateNotificationButton();render();setTimeout(()=>checkDueNotifications(false),700);
