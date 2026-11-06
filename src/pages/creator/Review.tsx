import {PageSkeleton,ActionLink} from '../../components/ui';
export default function Review(){return <PageSkeleton code="C5" title="作者审核与发布" description="负责作者核对、发布前检查与发布记录。"><p>审核和应用内发布待实现，此页面不会发布作品。网站部署仍由既有 GitHub Actions 管理。</p><ActionLink to="/story">查看作品详情</ActionLink> <ActionLink to="/creator">返回作品管理</ActionLink></PageSkeleton>;}
