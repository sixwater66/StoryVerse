import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import {story} from './data';
import {DB_KEY} from './services/storage';
import {readLegacyState,saveLegacyState,published,createRemix,storageWarning,STORAGE_NOTICE} from './services/data';
import type {LegacyState,LegacyVersion} from './services/model';
export {story};
export type Version=LegacyVersion;
export type State=LegacyState;
export const readState=readLegacyState;
const Context=createContext<{state:State;update:(patch:Partial<State>|((s:State)=>Partial<State>))=>boolean}>(null!);
export function Provider({children}:{children:ReactNode}){
 const [state,set]=useState(readState);
 useEffect(()=>{const refresh=()=>set(readState());const sync=(event:StorageEvent)=>{if(event.key===DB_KEY)refresh();};window.addEventListener('storage',sync);window.addEventListener('storyverse-data',refresh);return ()=>window.removeEventListener('storage',sync);window.removeEventListener('storyverse-data',refresh);},[]);
 function update(patch:Partial<State>|((s:State)=>Partial<State>)){
  // Read the latest disk state so a progress update cannot overwrite another tab's draft.
  try{const previous=readState();const next={...previous,...(typeof patch==='function'?patch(previous):patch)};saveLegacyState(next);set(readState());return true;}
  catch(e){alert(e instanceof Error?e.message:'保存失败。'+STORAGE_NOTICE);return false;}
 }
 return <Context.Provider value={{state,update}}><p role="status" className="storage-notice">{storageWarning()||STORAGE_NOTICE}</p>{children}</Context.Provider>;
}
export const useStory=()=>useContext(Context);
/** Viewer content always comes from the current immutable release, never the draft. */
export function useViewerStory(){
 const context=useStory();const snapshot=published();
 const update:typeof context.update=patch=>context.update(previous=>{const next=typeof patch==='function'?patch({...previous,title:snapshot.title,text:snapshot.text,world:snapshot.world}):patch;if(['title','text','world'].some(key=>key in next))throw Error('观众端不能修改作者草稿。');return next;});
 return {update,state:{...context.state,title:snapshot.title,text:snapshot.text,world:snapshot.world}};
}
export function makeVersion(branchId:string,title:string):Version{return createRemix(branchId,title);}
