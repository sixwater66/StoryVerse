import {story as preset} from '../data';
import rawModel from '../data/model.json';
import type {Database,InitialModel,LegacyState,LegacyVersion,Remix,Snapshot,StoryRecord,Permissions} from './model';
import {isDatabase,legacyVersionSchema,initialModelSchema} from './schema';
import {DB_KEY,loadJson,saveJson,readRaw,storageWarning,STORAGE_NOTICE} from './storage';
import {saveFile,getFile,deleteFile} from './files';
const model:InitialModel=initialModelSchema.parse(rawModel);
export const STORY_ID=model.story.id;
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
const now=()=>new Date().toISOString();
export function initialDatabase():Database{
 const snapshot:Snapshot={id:model.release.id,storyId:STORY_ID,presetVersionId:model.presetVersionId,title:preset.title,text:preset.text,world:preset.world,permissions:clone(model.permissions),assetIds:model.assets.map(a=>a.id),assetVersionRefs:model.assets.map(a=>({assetId:a.id,versionId:a.versions.at(-1)!.id})),createdAt:model.release.publishedAt};
 return {schemaVersion:2,stories:[{...model.story,name:preset.title,synopsis:preset.synopsis,originalText:preset.originalText,draft:{id:STORY_ID+'-draft',title:preset.title,text:preset.text,world:preset.world,updatedAt:model.release.publishedAt}}],world:{characters:clone(preset.characters),relationships:clone(model.relationships),rules:clone(model.rules),scenes:[{id:model.sceneId,name:preset.worldSetting.shop.name,setting:clone(preset.worldSetting)}],events:clone(preset.facts),knowledge:preset.characters.flatMap(c=>[{nodeId:'arrival',characterId:c.id,factIds:c.id==='lin'?['letter']:[]},{nodeId:'suspense',characterId:c.id,factIds:c.knowledge.factIds},{nodeId:'decision',characterId:c.id,factIds:c.knowledge.factIds}])},assets:clone(model.assets),interactions:clone(model.interactions),permissions:clone(model.permissions),releases:{[STORY_ID]:{status:'published',currentVersionId:snapshot.id,publishedAt:snapshot.createdAt,display:{title:snapshot.title,synopsis:preset.synopsis},versions:[snapshot]}},progress:{storyId:STORY_ID,releaseId:snapshot.id,time:0,chapterId:'shot-1',nodeId:'arrival',playing:false,perspective:'lin',seen:[],completed:false,exploration:null,nodeVisited:false,selectedBranch:'wait',videoAssetId:null},branches:[]};
}
// Validate referential integrity as well as field shapes at the persistence boundary.
export function validDatabase(value:unknown):value is Database{
 if(!isDatabase(value))return false;
 const d=value, ids=d.stories.map(s=>s.id), assets=d.assets.map(a=>a.id);
 if(new Set(ids).size!==ids.length||new Set(assets).size!==assets.length)return false;
 if(JSON.stringify(d.world)!==JSON.stringify(initialDatabase().world))return false;
 const snapshots=Object.values(d.releases).flatMap(r=>r.versions);
 if(new Set(snapshots.map(s=>s.id)).size!==snapshots.length||new Set(d.branches.map(b=>b.id)).size!==d.branches.length)return false;
 if(!ids.includes(d.progress.storyId)||d.stories.find(s=>s.id===STORY_ID)?.originalText!==preset.originalText)return false;
 const validPermissions=(p:Permissions)=>p.explorableSceneIds.every(id=>d.world.scenes.some(s=>s.id===id))&&p.perspectiveIds.every(id=>preset.characters.some(c=>c.id===id))&&p.remixNodeIds.every(id=>d.interactions.some(n=>n.id===id))&&p.reusableAssetIds.every(id=>assets.includes(id));
 if(!validPermissions(d.permissions)||snapshots.some(s=>!validPermissions(s.permissions)))return false;
 if(d.world.knowledge.some(k=>!preset.characters.some(c=>c.id===k.characterId)||k.factIds.some(id=>!d.world.events.some(f=>f.id===id))))return false;
 for(const [id,r] of Object.entries(d.releases)){if(!ids.includes(id)||r.versions.some(s=>s.storyId!==id||s.presetVersionId!==model.presetVersionId||s.assetIds.some(a=>!assets.includes(a))||s.assetVersionRefs.some(ref=>!d.assets.some(a=>a.id===ref.assetId&&a.versions.some(v=>v.id===ref.versionId)))))return false;if(r.status==='published'&&!r.versions.some(s=>s.id===r.currentVersionId))return false;}
 if(!snapshots.some(s=>s.id===d.progress.releaseId&&s.storyId===d.progress.storyId))return false;
 if(!preset.characters.some(c=>c.id===d.progress.perspective)||d.progress.seen.some(id=>!preset.clues.some(c=>c.id===id))||!preset.branches.some(b=>b.id===d.progress.selectedBranch))return false;
 if(d.progress.videoAssetId&&!d.assets.some(a=>a.id===d.progress.videoAssetId&&a.kind==='video'))return false;
 return d.branches.every(b=>{const source=snapshots.find(s=>s.id===b.sourceVersionId&&s.storyId===b.sourceStoryId);const base=preset.branches.find(p=>p.id===b.branchId);return source&&base&&(['title','text'] as const).every(field=>b[field]===(b.changes.find(c=>c.field===field)?.value??base[field]))&&source.permissions.remixNodeIds.includes(b.sourceNodeId)&&preset.branches.some(p=>p.id===b.branchId)&&b.reusedAssetIds.every(id=>source.permissions.reusableAssetIds.includes(id))&&b.changes.every(c=>source.permissions.editableFields.includes(c.field)&&b[c.field]===c.value);});
}
function migrate():Database{
 const db=initialDatabase();let old:Partial<LegacyState>={};try{const v:unknown=JSON.parse(readRaw('storyverse-v1')||'null');if(v&&typeof v==='object'&&!Array.isArray(v))old=v as Partial<LegacyState>;}catch{/* Keep the untouched legacy key for recovery. */}
 const draft=db.stories[0].draft;for(const key of ['title','text','world'] as const)if(typeof old[key]==='string')draft[key]=old[key];
 const p=db.progress;if(typeof old.time==='number'&&Number.isFinite(old.time))p.time=Math.max(0,Math.min(preset.duration,old.time));
 for(const key of ['playing','nodeVisited'] as const)if(typeof old[key]==='boolean')p[key]=old[key];
 if(preset.characters.some(c=>c.id===old.perspective))p.perspective=old.perspective!;
 if(preset.branches.some(b=>b.id===old.selectedBranch))p.selectedBranch=old.selectedBranch!;
 if(Array.isArray(old.seen))p.seen=Array.from(new Set(old.seen.filter(id=>preset.clues.some(c=>c.id===id))));
 if(old.exploration&&typeof old.exploration.time==='number'&&Number.isFinite(old.exploration.time)&&typeof old.exploration.playing==='boolean')p.exploration={time:Math.max(0,Math.min(90,old.exploration.time)),playing:old.exploration.playing};
 if(Array.isArray(old.versions))for(const v of old.versions){if(legacyVersionSchema.safeParse(v).success&&preset.branches.some(b=>b.id===v.branchId)&&!db.branches.some(b=>b.id===v.id))db.branches.push(enrichVersion(v,db));}
 deriveProgress(db);return db;
}
export function readDatabase():Database{return loadJson(DB_KEY,validDatabase)||migrate();}
export function saveDatabase(db:Database){if(!validDatabase(db))throw Error('数据结构或引用无效，未保存。');
 const previous=loadJson(DB_KEY,validDatabase);if(previous){for(const asset of previous.assets)for(const version of asset.versions){const retained=db.assets.find(a=>a.id===asset.id)?.versions.find(v=>v.id===version.id);if(JSON.stringify(retained)!==JSON.stringify(version))throw Error('素材历史版本不可覆盖或删除。');}for(const r of Object.values(previous.releases))for(const snapshot of r.versions){const retained=Object.values(db.releases).flatMap(r=>r.versions).find(v=>v.id===snapshot.id);if(JSON.stringify(retained)!==JSON.stringify(snapshot))throw Error('正式发布快照不可覆盖或删除。');}}
 saveJson(DB_KEY,db,previous||undefined);}
function change(fn:(d:Database)=>void){const db=readDatabase();fn(db);saveDatabase(db);return db;}
export function published(db=readDatabase(),storyId=STORY_ID):Snapshot{const r=db.releases[storyId];const s=r?.versions.find(v=>v.id===r.currentVersionId);if(!s||r.status!=='published')throw Error('作品尚未发布。');return clone(s);}
export function readDraft(storyId=STORY_ID){const s=readDatabase().stories.find(s=>s.id===storyId);if(!s)throw Error('作品不存在。');return clone(s.draft);}
export function saveDraft(patch:Partial<Pick<StoryRecord['draft'],'title'|'text'|'world'>>,storyId=STORY_ID){return change(d=>{const s=d.stories.find(s=>s.id===storyId);if(!s)throw Error('作品不存在。');for(const key of ['title','text','world'] as const)if(patch[key]!==undefined){if(typeof patch[key]!=='string')throw Error('编辑稿格式无效。');s.draft[key]=patch[key];}s.draft.updatedAt=now();});}
export function createStory(name:string){const id=crypto.randomUUID();change(d=>{d.stories.push({id,name,type:'互动短篇',author:'本地创作者',synopsis:'',status:'draft',stage:'story',originalText:'',draft:{id:id+'-draft',title:name,text:'',world:'',updatedAt:now()}});d.releases[id]={status:'unpublished',currentVersionId:null,publishedAt:null,display:{title:name,synopsis:''},versions:[]};});return id;}
export function publishDraft(storyId=STORY_ID){const id=crypto.randomUUID();change(d=>{const s=d.stories.find(s=>s.id===storyId);if(!s)throw Error('作品不存在。');const snapshot:Snapshot={id,storyId,presetVersionId:model.presetVersionId,title:s.draft.title,text:s.draft.text,world:s.draft.world,permissions:clone(d.permissions),assetIds:d.assets.map(a=>a.id),assetVersionRefs:d.assets.map(a=>({assetId:a.id,versionId:a.versions.at(-1)!.id})),createdAt:now()};const r=d.releases[storyId];r.versions.push(snapshot);r.status='published';r.currentVersionId=id;r.publishedAt=snapshot.createdAt;r.display={title:snapshot.title,synopsis:s.synopsis};s.status='published';if(d.progress.storyId===storyId){Object.assign(d.progress,{releaseId:id,time:0,playing:false,seen:[],completed:false,exploration:null,nodeVisited:false});deriveProgress(d);}});return id;}
export function setPermissions(patch:Partial<Permissions>){return change(d=>{d.permissions={...d.permissions,...patch};});}
function deriveProgress(db:Database){const p=db.progress;p.chapterId=(preset.shots.find(s=>p.time>=s.start&&p.time<s.end)||preset.shots.at(-1)!).id;p.nodeId=p.time>=62?'decision':p.time>=45?'suspense':'arrival';p.completed=p.time>=preset.duration;}
export function enrichVersion(v:LegacyVersion,db=readDatabase()):Remix{const s=published(db);return {...v,sourceStoryId:s.storyId,sourceVersionId:s.id,sourceNodeId:'decision',reusedAssetIds:[],changes:[{field:'title',value:v.title},{field:'text',value:v.text}]};}
export function createRemix(branchId:string,title:string,nodeId='decision',changes?:Remix['changes']):Remix{
 const db=readDatabase(),s=published(db),b=preset.branches.find(b=>b.id===branchId);
 if(!b||!s.permissions.remixNodeIds.includes(nodeId)||!db.interactions.some(n=>n.id===nodeId&&n.branchIds.includes(branchId)))throw Error('作者未授权该节点二创。');
 const edits=changes||[{field:'title' as const,value:title.trim()||b.title},{field:'text' as const,value:b.text}];
 if(edits.some(c=>!s.permissions.editableFields.includes(c.field)))throw Error('修改内容超出作者授权。');
 const v:Remix={id:crypto.randomUUID(),branchId,title:b.title,text:b.text,createdAt:now(),sourceStoryId:s.storyId,sourceVersionId:s.id,sourceNodeId:nodeId,reusedAssetIds:[],changes:edits};for(const c of edits)v[c.field]=c.value;return v;
}
export function saveRemix(v:Remix){return change(d=>{if(d.branches.some(b=>b.id===v.id))throw Error('独立版本 ID 已存在。');d.branches.unshift(v);});}
export function characterKnowledge(characterId:string,nodeId:string){const db=readDatabase();if(!published(db).permissions.perspectiveIds.includes(characterId))throw Error('作者未授权该视角。');const ids=db.world.knowledge.find(k=>k.characterId===characterId&&k.nodeId===nodeId)?.factIds||[];return db.world.events.filter(f=>ids.includes(f.id));}
export function canExplore(sceneId:string){return published().permissions.explorableSceneIds.includes(sceneId);}
export function canReuseAsset(assetId:string){return published().permissions.reusableAssetIds.includes(assetId);}
export function readLegacyState():LegacyState{const db=readDatabase(),d=db.stories[0].draft,p=db.progress;return {title:d.title,text:d.text,world:d.world,time:p.time,playing:p.playing,perspective:p.perspective,seen:p.seen,versions:db.branches.map(({id,branchId,title,text,createdAt})=>({id,branchId,title,text,createdAt})),exploration:p.exploration,nodeVisited:p.nodeVisited,selectedBranch:p.selectedBranch,videoAssetId:p.videoAssetId};}
export function saveLegacyState(state:LegacyState){return change(d=>{Object.assign(d.stories[0].draft,{title:state.title,text:state.text,world:state.world,updatedAt:now()});if(state.perspective!==d.progress.perspective&&!published(d).permissions.perspectiveIds.includes(state.perspective))throw Error('作者未授权此视角。');if(state.exploration&&!published(d).permissions.explorableSceneIds.includes('bookshop'))throw Error('作者未授权场景探索。');Object.assign(d.progress,{time:state.time,playing:state.playing,perspective:state.perspective,seen:state.seen,exploration:state.exploration,nodeVisited:state.nodeVisited,selectedBranch:state.selectedBranch,videoAssetId:state.videoAssetId});deriveProgress(d);d.branches=state.versions.map(v=>d.branches.find(b=>b.id===v.id)||('sourceVersionId' in v?v as Remix:enrichVersion(v,d)));});}
export async function importVideo(file:File){if(!['video/mp4','video/webm'].includes(file.type))throw Error('请选择 MP4 或 WebM 视频。');const id=crypto.randomUUID(),fileId='file-'+id;await saveFile(fileId,file);try{change(d=>{d.assets.push({id,kind:'video',name:file.name,mimeType:file.type,size:file.size,references:[STORY_ID],versions:[{id:id+'-v1',createdAt:now(),fileId}]});d.progress.videoAssetId=id;});}catch(e){await deleteFile(fileId);throw e;}return id;}
export async function videoFile(assetId:string){const asset=readDatabase().assets.find(a=>a.id===assetId&&a.kind==='video');const id=asset?.versions.at(-1)?.fileId;return id?getFile(id):undefined;}
export {storageWarning,STORAGE_NOTICE};
