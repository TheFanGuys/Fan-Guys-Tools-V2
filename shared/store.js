/* Static-only project storage. Legacy keys remain untouched until explicitly imported. */
(function(){
 'use strict';
 const scoped=['fg_sitesurvey_autosave_v1','fg_estimator_autosave_v1','fg_materials_autosave_v1','fanlayout.v1','fanGuysParamCaptures','fg_estimate_rates_v2'];
 const globalKeys=['fgt-jobs','fgt-current','fgt-rates','fanGuysProData_v6','lp_theme','lp_tips_off','lp_wizard_seen','fgt-theme','fgt-rates-reviewed-v2'];
 // Set to '' when this isolated V2 package replaces the live app.
 const RELEASE_NAMESPACE='v2:';
 const physical=window.localStorage;
 const raw={getItem(k){return physical.getItem(RELEASE_NAMESPACE+k)},setItem(k,v){return physical.setItem(RELEASE_NAMESPACE+k,v)},removeItem(k){return physical.removeItem(RELEASE_NAMESPACE+k)},key(i){return Array.from({length:physical.length},(_,i)=>physical.key(i)).filter(k=>k&&k.startsWith(RELEASE_NAMESPACE)).map(k=>k.slice(RELEASE_NAMESPACE.length))[i]||null},get length(){return Array.from({length:physical.length},(_,i)=>physical.key(i)).filter(k=>k&&k.startsWith(RELEASE_NAMESPACE)).length}};
 const prefix='fgt2:';
 let bound=null;
 const read=(k,d)=>{try{let s=raw.getItem(k);return s===null?d:JSON.parse(s);}catch(e){return d;}};
 function uid(){return crypto.randomUUID?crypto.randomUUID():'j'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);}
 function jobs(){return read('fgt-jobs',[]);}
 function saveJobs(list){raw.setItem('fgt-jobs',JSON.stringify(list));}
 function current(){return jobs().find(j=>j.id===read('fgt-current',null))||null;}
 function create(data){const j=Object.assign({id:uid(),created:Date.now(),updated:Date.now()},data);let list=jobs();list.push(j);saveJobs(list);raw.setItem('fgt-current',JSON.stringify(j.id));return j;}
 const toolPage=/\/(survey|estimate|materials|layout|tech)\/(index.html)?$/.test(location.pathname);
 if(toolPage){let j=current();if(!j)j=create({name:'Untitled job',customer:''});bound=j.id;}
 function key(k,id){return scoped.includes(k)?prefix+(id||bound||(current()||{}).id||'unassigned')+':'+k:k;}
 function signal(ok,msg){window.dispatchEvent(new CustomEvent('fgt-save',{detail:{ok,message:msg||''}}));}
 function setItem(k,v){try{raw.setItem(key(k),String(v));signal(true);}catch(e){signal(false,'Storage full. Export a backup before continuing.');throw e;}}
 function getItem(k){return raw.getItem(key(k));}
 function removeItem(k){raw.removeItem(key(k));signal(true);}
 function switchJob(id){if(!jobs().some(j=>j.id===id))throw Error('Job not found');raw.setItem('fgt-current',JSON.stringify(id));}
 function getFor(id,k){return read(key(k,id),null);}
 function legacy(){const out=[];for(const k of scoped){let v=read(k,null);if(v!==null)out.push({key:k,data:v});}return out;}
 function recover(k,id,layoutName){if(!scoped.includes(k))throw Error('Unknown record');const data=read(k,null);if(!data)throw Error('No legacy record');let dest=key(k,id);if(raw.getItem(dest)!==null)throw Error('This job already has this tool saved. Import into a new job.');let value=data;if(k==='fanlayout.v1'&&layoutName){if(!data.jobs||!data.jobs[layoutName])throw Error('Layout missing');value={current:layoutName,jobs:{[layoutName]:data.jobs[layoutName]}};}raw.setItem(dest,JSON.stringify(value));}
 function photoDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(RELEASE_NAMESPACE+'fanlayout_photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 async function allPhotos(){const db=await photoDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('photos'),s=tx.objectStore('photos'),out={};s.openCursor().onsuccess=e=>{let c=e.target.result;if(c){out[c.key]=c.value;c.continue();}};tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
 async function putPhotos(photos){const db=await photoDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');Object.entries(photos).forEach(([id,value])=>tx.objectStore('photos').put(value,id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Photo restore aborted'));});}finally{db.close();}}
 async function backup(){const data={};for(let i=0;i<raw.length;i++){const k=raw.key(i);if(k.startsWith(prefix)||globalKeys.includes(k)||scoped.includes(k))data[k]=raw.getItem(k);}const photos=await allPhotos();let missing=[];Object.entries(data).filter(([k])=>k.endsWith('fanlayout.v1')).forEach(([k,v])=>{let s=JSON.parse(v);Object.values(s.jobs||{}).forEach(j=>(j.fans||[]).forEach(f=>(f.photos||[]).forEach(p=>{if(p.id&&!Object.prototype.hasOwnProperty.call(photos,p.id))missing.push(p.id);})));});return {app:'Fan Guys Tools',version:2,saved:new Date().toISOString(),data,photos,inventory:{jobs:jobs().length,photos:Object.keys(photos).length,missingPhotos:[...new Set(missing)]}};}
 function validateBackup(b){if(!b||b.app!=='Fan Guys Tools'||![1,2].includes(b.version)||!b.data||typeof b.data!=='object'||Array.isArray(b.data))throw Error('Not a supported Fan Guys Tools backup');Object.entries(b.data).forEach(([k,v])=>{if(!(k.startsWith(prefix)||globalKeys.includes(k)||scoped.includes(k)))throw Error('Unknown backup key: '+k);if(typeof v!=='string')throw Error('Invalid record');JSON.parse(v);});const list=JSON.parse(b.data['fgt-jobs']||'[]');if(!Array.isArray(list)||list.some(j=>!j||typeof j.id!=='string'||typeof j.name!=='string')||new Set(list.map(j=>j.id)).size!==list.length)throw Error('Invalid job inventory');if(b.photos&&(typeof b.photos!=='object'||Array.isArray(b.photos)))throw Error('Invalid photos');return list;}
 async function restore(b){validateBackup(b);const before={};for(const k of Object.keys(b.data))before[k]=raw.getItem(k);try{ // Roll back records if browser quota prevents a complete restore.
 Object.entries(b.data).forEach(([k,v])=>raw.setItem(k,v));await putPhotos(b.photos||{});
 }catch(e){Object.keys(before).forEach(k=>raw.removeItem(k));Object.entries(before).forEach(([k,v])=>{if(v!==null)raw.setItem(k,v);});throw e;}signal(true);}
 function validateLiveBackup(b){
  if(!b||b.app!=='Fan Guys Tools'||b.version!==1||!b.data||typeof b.data!=='object'||Array.isArray(b.data))throw Error('Select a live Home backup (version 1)');
  const allowed=[...scoped,...globalKeys];
  for(const [k,v] of Object.entries(b.data)){if(!allowed.includes(k)||typeof v!=='string')throw Error('Invalid live backup record: '+k);JSON.parse(v);}
  const photos=b.photos||{};if(typeof photos!=='object'||Array.isArray(photos))throw Error('Invalid photo inventory');
  for(const [id,value] of Object.entries(photos))if(typeof id!=='string'||typeof value!=='string'||!value.startsWith('data:image/'))throw Error('Invalid photo: '+id);
  const layout=JSON.parse(b.data['fanlayout.v1']||'{}');
  for(const job of Object.values(layout.jobs||{}))for(const fan of job.fans||[])for(const photo of fan.photos||[])
   if(photo.id&&!Object.prototype.hasOwnProperty.call(photos,photo.id))throw Error('Backup is missing Layout photo '+photo.id+'. Make a new live Home backup with the photo patch.');
  const list=JSON.parse(b.data['fgt-jobs']||'[]');if(!Array.isArray(list)||list.some(j=>!j||typeof j.id!=='string'||typeof j.name!=='string'))throw Error('Invalid job inventory');
  return {jobs:list.length,photos:Object.keys(photos).length};
 }
 async function importLiveBackup(b){
  const inventory=validateLiveBackup(b);
  if(raw.length)throw Error('Import into an empty V2 workspace to avoid overwriting work.');
  const records={};const list=JSON.parse(b.data['fgt-jobs']||'[]');let id=JSON.parse(b.data['fgt-current']||'null');
  if(!list.some(j=>j.id===id))id=list[0]?.id||uid();
  if(!list.length)list.push({id,name:'Recovered live work',created:Date.now(),updated:Date.now()});
  records['fgt-jobs']=JSON.stringify(list);records['fgt-current']=JSON.stringify(id);
  for(const [k,v] of Object.entries(b.data)){
   if(k==='fgt-jobs'||k==='fgt-current')continue;
   records[scoped.includes(k)?key(k,id):k]=v;
  }
  await putPhotos(b.photos||{});
  try{for(const [k,v] of Object.entries(records))raw.setItem(k,v);}catch(e){for(const k of Object.keys(records))raw.removeItem(k);throw e;}
  signal(true);return inventory;
 }
 window.FGTStore={uid,getItem,setItem,removeItem,jobs,current,create,saveJobs,switchJob,getFor,legacy,recover,backup,restore,validateBackup,validateLiveBackup,importLiveBackup,readRaw:read,scoped,releaseNamespace:RELEASE_NAMESPACE,photoDatabase:RELEASE_NAMESPACE+'fanlayout_photos'};
 window.addEventListener('storage',e=>{if(e.key===RELEASE_NAMESPACE+'fgt-current'&&toolPage)location.reload();});
})();
