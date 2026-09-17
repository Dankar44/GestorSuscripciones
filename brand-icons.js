(()=>{
 const services=[
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
  {terms:['linkedin'],icon:'linkedin',color:'0A66C2'}
 ];
 const findService=name=>{const n=(name||'').toLowerCase();return services.find(s=>s.terms.some(t=>n.includes(t)))};
 const url=(s,host='api.iconify.design')=>`https://${host}/simple-icons/${s.icon}.svg?color=%23${s.color}`;
 const initials=name=>(name||'S').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 const nameFor=el=>{
  const row=el.closest('.upcoming-item,.subscription-card');
  if(row)return row.querySelector('.service-meta strong,.subscription-copy h3')?.textContent?.trim()||'';
  return '';
 };
 const paint=(el,name)=>{
  const service=findService(name); if(!service)return;
  const current=el.querySelector('img');
  if(current?.src?.startsWith('data:image/'))return;
  if(el.dataset.brandIcon===service.icon&&current)return;
  el.dataset.brandIcon=service.icon;el.classList.add('has-image');
  const img=document.createElement('img');img.alt=`Logo de ${name}`;img.className='brand-auto-logo';img.src=url(service);
  let backup=false;
  img.addEventListener('error',()=>{if(!backup){backup=true;img.src=url(service,'api.simplesvg.com');return}el.classList.remove('has-image');el.removeAttribute('data-brand-icon');el.textContent=initials(name)});
  el.replaceChildren(img);
 };
 const apply=()=>document.querySelectorAll('.service-logo').forEach(el=>paint(el,nameFor(el)));
 const style=document.createElement('style');
 style.textContent='.service-logo.has-image{background:#fff!important}.service-logo .brand-auto-logo{width:100%!important;height:100%!important;object-fit:contain!important;padding:7px!important;display:block}.icon-preview .brand-auto-logo{width:100%;height:100%;object-fit:contain;padding:9px;background:#fff}';
 document.head.appendChild(style);
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 const nameInput=document.querySelector('#name'),preview=document.querySelector('#iconPreview');
 nameInput?.addEventListener('input',()=>{
  if(!preview||preview.querySelector('img[src^="data:image/"]'))return;
  const name=nameInput.value.trim(),service=findService(name);if(!service)return;
  preview.classList.add('has-image');const img=document.createElement('img');img.alt=`Logo de ${name}`;img.className='brand-auto-logo';img.src=url(service);preview.replaceChildren(img);
 });
 apply();
})();