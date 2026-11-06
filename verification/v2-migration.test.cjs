const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {indexedDB}=require('./vendor/fake-indexeddb');
const physical=new Map([['fgt-jobs','LIVE-JOBS'],['fgt-current','LIVE-CURRENT'],['fgt2:abc:fanlayout.v1','LIVE-LAYOUT']]);
const localStorage={get length(){return physical.size},key(i){return [...physical.keys()][i]},getItem(k){return physical.get(k)??null},setItem(k,v){physical.set(k,String(v))},removeItem(k){physical.delete(k)}};
const window={localStorage,addEventListener(){},dispatchEvent(){}};
const ctx={window,localStorage,indexedDB,crypto:{randomUUID:()=>'v2-job'},location:{pathname:'/Fan-Guys-Tools-V2/'},CustomEvent:class{constructor(){}},Date,JSON,Object,Promise};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../shared/store.js'),'utf8'),ctx);
const S=window.FGTStore;
(async()=>{
 assert.equal(S.releaseNamespace,'v2:');assert.equal(S.photoDatabase,'v2:fanlayout_photos');assert.equal(S.jobs().length,0);
 const layout={current:'Building',jobs:{Building:{fans:[{photos:[{id:'p1'}]}]}}};
 const b={app:'Fan Guys Tools',version:1,data:{'fgt-jobs':JSON.stringify([{id:'abc',name:'Warehouse'}]),'fgt-current':JSON.stringify('abc'),'fg_estimator_autosave_v1':JSON.stringify({qtyByType:{turnkey:{taz:2},mech_hook:{taz:4}},miscCosts:[{name:'Permit',amount:55}]}),'fanlayout.v1':JSON.stringify(layout)},photos:{p1:'data:image/jpeg;base64,YQ=='}};
 const result=await S.importLiveBackup(b);assert.equal(result.photos,1);assert.equal(S.current().name,'Warehouse');assert.equal(S.getFor('abc','fanlayout.v1').jobs.Building.fans[0].photos[0].id,'p1');assert.equal(S.getFor('abc','fg_estimator_autosave_v1').qtyByType.mech_hook.taz,4);
 const backup=await S.backup();assert.equal(backup.photos.p1,b.photos.p1);assert.equal(backup.inventory.missingPhotos.length,0);
 assert.equal(physical.get('fgt-jobs'),'LIVE-JOBS');assert.equal(physical.get('fgt-current'),'LIVE-CURRENT');assert.equal(physical.get('fgt2:abc:fanlayout.v1'),'LIVE-LAYOUT');
 assert.equal(physical.get('v2:fgt-jobs')!=null,true);assert.equal(physical.get('v2:fgt2:abc:fanlayout.v1')!=null,true);
 await assert.rejects(S.importLiveBackup(b),/empty V2/);
 console.log('PASS: live-format backup and photo import to isolated V2, mixed estimate, live keys unchanged, V2 export includes photo');
})().catch(e=>{console.error(e);process.exitCode=1});
// The attached live Home patch reads the original, unprefixed photo database.
const liveHtml=fs.readFileSync(path.resolve(__dirname,'../live-home-backup-patch/index.html'),'utf8');
assert(liveHtml.includes("indexedDB.open('fanlayout_photos',1)"));
assert(liveHtml.includes('photos:photos'));
assert(liveHtml.includes('if(missing.length)'));
console.log('PASS: separate live Home patch includes original photo database and refuses an incomplete photo backup');
