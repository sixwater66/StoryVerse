import {useSearchParams} from 'react-router-dom';
import {PageSkeleton,ActionLink} from '../../components/ui';
import {useViewerStory} from '../../store';
export default function Discover(){const [params]=useSearchParams();const {state}=useViewerStory();const favorites=params.get('shelf')==='favorites';return <PageSkeleton code="V1" title={favorites?'我的收藏':'作品发现与推荐'} description="寻找故事，或继续上一次的体验。"><p>{favorites?'收藏列表与收藏操作待实现。':'推荐与筛选待实现；以下为唯一测试作品。'}</p>{!favorites&&<><h2>{state.title}</h2><ActionLink to="/story">进入作品 →</ActionLink></>} {favorites&&<ActionLink to="/">返回发现</ActionLink>}</PageSkeleton>;}
