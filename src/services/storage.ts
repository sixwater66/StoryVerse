/** The only localStorage boundary. Keep an intact previous value for recovery. */
export const DB_KEY='storyverse-db-v2';
export const STORAGE_NOTICE='仅保存在当前浏览器，容量受限且可能被清理；不是云端永久存储，请保留原始文件。';
let warning='';
export function storageWarning(){return warning;}
export function readRaw(key:string){try{return localStorage.getItem(key);}catch{warning='浏览器存储不可用。'+STORAGE_NOTICE;return null;}}
export function writeRaw(key:string,value:string){try{localStorage.setItem(key,value);}catch{throw new Error('保存失败：浏览器存储不可用或容量不足。'+STORAGE_NOTICE);}}
export function loadJson<T>(key:string,validate:(value:unknown)=>value is T):T|null{
 const raw=readRaw(key);if(raw===null)return null;
 try{const value:unknown=JSON.parse(raw);if(!validate(value))throw Error('Invalid schema');return value;}catch{
 warning='存档损坏或版本不兼容，已尝试恢复备份。'+STORAGE_NOTICE;
 try{writeRaw(key+'-corrupt',raw);}catch{/* Preserve original if backup cannot be written. */}
 const backup=readRaw(key+'-backup');try{const value:unknown=JSON.parse(backup||'null');return validate(value)?value:null;}catch{return null;}
 }
}
export function saveJson(key:string,value:unknown,previous?:unknown){const encoded=JSON.stringify(value);if(previous!==undefined)writeRaw(key+'-backup',JSON.stringify(previous));writeRaw(key,encoded);}
