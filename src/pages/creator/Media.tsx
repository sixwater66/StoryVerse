import {useSearchParams} from 'react-router-dom';
import {useCreator} from '../../hooks/useCreator';
import {PageSkeleton,ActionLink} from '../../components/ui';
export default function Media(){const [params]=useSearchParams();const {workspace}=useCreator();const query=`?work=${encodeURIComponent(params.get('work')||workspace.activeStoryId)}`;return <PageSkeleton code="C3" title="视听素材与分镜编辑" description="负责素材关联、镜头顺序及视听时间轴。"><p>素材上传、分镜编辑与配音待实现。现有本地视频导入保留在漫剧放映页。</p><ActionLink to="/watch">预览现有播放器</ActionLink> <ActionLink to={"/creator/interactions"+query}>下一阶段：交互设计 →</ActionLink><ActionLink to={"/creator/story"+query}>← 返回 C2 修改设定</ActionLink></PageSkeleton>;}
