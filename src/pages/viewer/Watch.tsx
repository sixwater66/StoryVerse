import Player from '../../components/Player';
import {ActionLink} from '../../components/ui';
import {useStory} from '../../store';
export default function Watch(){const {state}=useStory();return <div className="page"><div className="eyebrow">V3 · 漫剧自动播放</div><div className="page-heading"><h1>{state.title}</h1><ActionLink to="/story">返回作品详情</ActionLink></div><Player/></div>;}
