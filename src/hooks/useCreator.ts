import {useEffect,useState} from 'react';
import {readCreator} from '../services/creator';
export function useCreator(){const [value,set]=useState(readCreator);useEffect(()=>{const refresh=()=>set(readCreator());window.addEventListener('storyverse-data',refresh);window.addEventListener('storage',refresh);return ()=>{window.removeEventListener('storyverse-data',refresh);window.removeEventListener('storage',refresh);};},[]);return value;}
