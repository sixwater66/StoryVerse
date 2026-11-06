import {createContext,useContext,useState,type ReactNode} from 'react';
import {story} from './data';
export {story};
export type Version={id:string;branchId:string;title:string;text:string;createdAt:string};
export type State={title:string;text:string;world:string;time:number;playing:boolean;perspective:string;seen:string[];versions:Version[];exploration:null|{time:number;playing:boolean};nodeVisited:boolean;selectedBranch:string};
const initial:State={title:story.title,text:story.text,world:story.world,time:0,playing:false,perspective:'lin',seen:[],versions:[],exploration:null,nodeVisited:false,selectedBranch:'wait'};
export function readState():State {try{const s=JSON.parse(localStorage.getItem('storyverse-v1')||'null');if(!s)return initial;return {...initial,...s,time:Math.min(90,Math.max(0,Number(s.time)||0)),versions:Array.isArray(s.versions)?s.versions:[],seen:Array.isArray(s.seen)?s.seen:[]};}catch{return initial;}}
const Context=createContext<{state:State;update:(patch:Partial<State>|((s:State)=>Partial<State>))=>void}> (null!);
export function Provider({children}:{children:ReactNode}){const [state,set]=useState(readState);function update(patch:Partial<State>|((s:State)=>Partial<State>)){set(s=>{const next={...s,...(typeof patch==='function'?patch(s):patch)};try{localStorage.setItem('storyverse-v1',JSON.stringify(next));}catch{alert('本地存储空间不足，状态未保存。');}return next;});}return <Context.Provider value={{state,update}}>{children}</Context.Provider>;}
export const useStory=()=>useContext(Context);
export function makeVersion(branchId:string,title:string):Version {const branch=story.branches.find(b=>b.id===branchId)!;return {id:crypto.randomUUID(),branchId,title:title.trim()||branch.title,text:branch.text,createdAt:new Date().toISOString()};}
