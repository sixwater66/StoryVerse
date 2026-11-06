import {PageSkeleton,ActionLink} from '../../components/ui';
import {useStory} from '../../store';
export default function CreatorHome(){const {state}=useStory();return <PageSkeleton code="C1" title="创作首页与作品管理" description="管理作品、查看制作阶段并进入故事编辑。"><h2>{state.title}</h2><p>当前唯一测试作品 · 本地草稿。作品新建、删除与多作品管理待实现。</p><ActionLink to="/creator/story">继续编辑故事 →</ActionLink></PageSkeleton>;}
