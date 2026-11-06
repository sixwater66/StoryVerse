import {useEffect,useRef,type ReactNode,type ButtonHTMLAttributes,type InputHTMLAttributes} from 'react';
import {Link} from 'react-router-dom';
export function Button(props:ButtonHTMLAttributes<HTMLButtonElement>){return <button {...props}/>;}
export function ActionLink({to,children}:{to:string;children:ReactNode}){return <Link className="button" to={to}>{children}</Link>;}
export function Card({children}:{children:ReactNode}){return <section className="panel">{children}</section>;}
export function Tag({children}:{children:ReactNode}){return <span className="pill">{children}</span>;}
export function Field({label,...props}:InputHTMLAttributes<HTMLInputElement>&{label:string}){return <label>{label}<input {...props}/></label>;}
export function Modal({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{if(open)ref.current?.showModal();else if(ref.current?.open)ref.current.close();},[open]);return <dialog ref={ref} aria-label={title} onCancel={onClose}><h2>{title}</h2>{children}<Button onClick={onClose}>关闭</Button></dialog>;}
export function PageSkeleton({code,title,description,children}:{code:string;title:string;description:string;children:ReactNode}){return <div className="page"><div className="eyebrow">{code} · STORYVERSE</div><h1>{title}</h1><p>{description}</p><Card><Tag>页面骨架 · 概念演示</Tag><p>本阶段仅建立职责与导航，相关业务暂未实现。</p>{children}</Card></div>;}
