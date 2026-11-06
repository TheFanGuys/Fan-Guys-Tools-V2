(function(){
 const script=document.currentScript;const base=new URL('../',script?script.src:location.href);const tool=location.pathname.split('/').filter(Boolean).slice(-1)[0]==='index.html'?location.pathname.split('/').filter(Boolean).slice(-2)[0]:location.pathname.split('/').filter(Boolean).slice(-1)[0];
 const names={survey:'Site survey',estimate:'Pricing check',layout:'Layout studio',materials:'Materials',tech:'Tech Pro'};
 function init(){
  if(!names[tool])return;
  document.body.dataset.tool=tool;const j=FGTStore.current();
  const header=document.createElement('header');header.className='workspace-header';
  const back=document.createElement('a');back.href=base.href;back.className='workspace-back';back.textContent='‹';back.setAttribute('aria-label','Back to workspace');
  const title=document.createElement('div');title.className='workspace-title';const small=document.createElement('small');small.textContent=names[tool];const strong=document.createElement('strong');strong.textContent=j?j.name:'Workspace';title.append(small,strong);
  const status=document.createElement('span');status.id='workspace-status';status.textContent='On device';status.title='Your job records are stored on this device';
  const theme=document.createElement('button');theme.type='button';theme.className='workspace-theme';theme.textContent='◐';theme.setAttribute('aria-label','Toggle daylight theme');theme.onclick=()=>{let light=document.documentElement.dataset.theme!=='light';document.documentElement.dataset.theme=light?'light':'dark';document.body.classList.toggle('light',light);FGTStore.setItem('fgt-theme',JSON.stringify(light?'light':'dark'));window.dispatchEvent(new CustomEvent('fgt-theme-change',{detail:light?'light':'dark'}));};
  header.append(back,title,status,theme);document.body.prepend(header);
  let light=FGTStore.readRaw('fgt-theme','dark')==='light';document.documentElement.dataset.theme=light?'light':'dark';document.body.classList.toggle('light',light);
  const nav=document.createElement('nav');nav.className='workspace-nav';nav.setAttribute('aria-label','Job tools');Object.entries(names).forEach(([id,name])=>{const a=document.createElement('a');a.href=new URL(id+'/',base).href;a.textContent=id==='survey'?'Survey':id==='estimate'?'Estimate':id==='layout'?'Layout':id==='materials'?'Materials':'Tech';if(id===tool)a.setAttribute('aria-current','page');nav.append(a);});document.body.append(nav);
  if(tool==='estimate'){const scope=document.getElementById('install-pills')?.closest('.section'),fans=document.getElementById('fan-grid')?.closest('.section'),app=document.getElementById('app');if(app&&fans)app.prepend(fans);if(app&&scope)app.prepend(scope);}
  window.addEventListener('fgt-save',e=>{status.textContent=e.detail.ok?'Saved on device':'Save failed';status.classList.toggle('failed',!e.detail.ok);if(!e.detail.ok)alert(e.detail.message);});
  // Hide a second layout-level project list: the workspace owns project identity.
  if(tool==='layout'){const btn=document.getElementById('mJobs');if(btn){btn.onclick=()=>location.assign(base.href+'#jobs');} }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(new URL('sw.js',base)).catch(()=>{}));
})();
