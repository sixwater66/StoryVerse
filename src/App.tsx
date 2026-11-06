import {Routes,Route,Navigate} from 'react-router-dom';
import CreatorLayout from './layouts/CreatorLayout';
import ViewerLayout from './layouts/ViewerLayout';
import Studio from './pages/Studio';
import Work from './pages/Work';
import Explore from './pages/Explore';
import Branches from './pages/Branches';
import CreatorHome from './pages/creator/Home';
import Media from './pages/creator/Media';
import Interactions from './pages/creator/Interactions';
import Review from './pages/creator/Review';
import Discover from './pages/viewer/Discover';
import Watch from './pages/viewer/Watch';
export default function App(){return <Routes><Route path="creator" element={<CreatorLayout/>}><Route index element={<CreatorHome/>}/><Route path="story" element={<Studio/>}/><Route path="media" element={<Media/>}/><Route path="interactions" element={<Interactions/>}/><Route path="review" element={<Review/>}/></Route><Route element={<ViewerLayout/>}><Route index element={<Discover/>}/><Route path="story" element={<Work/>}/><Route path="watch" element={<Watch/>}/><Route path="explore" element={<Explore/>}/><Route path="remix" element={<Branches/>}/></Route><Route path="studio" element={<Navigate to="/creator/story" replace/>}/><Route path="work" element={<Navigate to="/story" replace/>}/><Route path="branches" element={<Navigate to="/remix" replace/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>;}
