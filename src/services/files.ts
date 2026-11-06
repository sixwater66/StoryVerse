import {STORAGE_NOTICE} from './storage';
const DB='storyverse-files';
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(typeof indexedDB==='undefined'){reject(Error('IndexedDB 不可用。'+STORAGE_NOTICE));return;}const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('文件数据库被其他页面阻塞。'));});}
async function operation<T>(mode:IDBTransactionMode,run:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('files',mode);const request=run(tx.objectStore('files'));let value:T;request.onsuccess=()=>{value=request.result;};tx.oncomplete=()=>{db.close();resolve(value);};tx.onerror=tx.onabort=()=>{db.close();reject(Error('本地文件存储失败，可能达到容量限制。'+STORAGE_NOTICE));};});}
export function saveFile(id:string,file:Blob){return operation('readwrite',s=>s.put(file,id));}
export function getFile(id:string){return operation<Blob|undefined>('readonly',s=>s.get(id));}
export function deleteFile(id:string){return operation('readwrite',s=>s.delete(id));}
