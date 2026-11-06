// @vitest-environment jsdom
import {afterEach,expect,test} from 'vitest';
import {cleanup,render,screen,fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import {Provider} from './store';
afterEach(()=>{cleanup();localStorage.clear();});
const routes=[['/creator','创作首页与作品管理'],['/creator/story/','让文字，拥有另一个世界。'],['/creator/media/','视听素材与分镜编辑'],['/creator/interactions/','交互节点与创作权限设计'],['/creator/review/','作者审核与发布'],['/','作品发现与推荐'],['/story/','旧书店的来信'],['/watch/','旧书店的来信'],['/explore/','走进故事的缝隙'],['/remix/','如果，当时……']] as const;
test.each(routes)('%s 独立页面与对应端布局', (path,heading)=>{render(<Provider><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></Provider>);expect(screen.getByRole('heading',{level:1,name:heading})).toBeTruthy();expect(screen.getByRole('navigation',{name:path.startsWith('/creator')?'创作者导航':'观众导航'})).toBeTruthy();});
test.each([['/studio','让文字，拥有另一个世界。'],['/work','旧书店的来信'],['/branches','如果，当时……']])('旧路由 %s 保持可访问',(path,heading)=>{render(<Provider><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></Provider>);expect(screen.getByRole('heading',{level:1,name:heading})).toBeTruthy();});
test('详情到播放、探索返回及双端切换',()=>{render(<Provider><MemoryRouter initialEntries={['/story']}><App/></MemoryRouter></Provider>);fireEvent.click(screen.getByRole('link',{name:/开始放映/}));expect(screen.getByRole('button',{name:'播放'})).toBeTruthy();fireEvent.change(screen.getByLabelText('播放进度'),{target:{value:'23'}});fireEvent.click(screen.getByRole('button',{name:'进入探索'}));fireEvent.click(screen.getByRole('button',{name:/返回放映/}));expect((screen.getByLabelText('播放进度') as HTMLInputElement).value).toBe('23');fireEvent.click(screen.getByRole('link',{name:/进入创作者端/}));expect(screen.getByRole('heading',{name:'创作首页与作品管理'})).toBeTruthy();fireEvent.click(screen.getByRole('link',{name:/进入观众端/}));expect(screen.getByRole('heading',{name:'作品发现与推荐'})).toBeTruthy();});
test('收藏入口明确为骨架，不伪装已实现',()=>{render(<Provider><MemoryRouter><App/></MemoryRouter></Provider>);fireEvent.click(screen.getByRole('link',{name:'收藏入口'}));expect(screen.getByRole('heading',{name:'我的收藏'})).toBeTruthy();expect(screen.getByText('收藏列表与收藏操作待实现。')).toBeTruthy();});
