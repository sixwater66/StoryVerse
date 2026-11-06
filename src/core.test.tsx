// @vitest-environment jsdom
import {afterEach,expect,test} from 'vitest';
import {cleanup,render,screen,fireEvent} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {Provider,story,makeVersion,readState} from './store';
import Explore from './pages/Explore';
import Branches from './pages/Branches';
import Studio from './pages/Studio';
import Player from './components/Player';
afterEach(()=>{cleanup();localStorage.clear();});
function mount(node:React.ReactNode){return render(<Provider><MemoryRouter>{node}</MemoryRouter></Provider>);}
test('角色切换与客观线索正文一致',()=>{mount(<Explore/>);fireEvent.click(screen.getByRole('button',{name:/阿禾/}));expect(screen.getByText(story.characters[1].known)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/抽屉/}));expect(screen.getByText(story.clues[4].text)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/老周/}));expect(screen.getByText(story.characters[2].known)).toBeTruthy();expect(screen.getByText(story.clues[4].text)).toBeTruthy();expect(readState().seen).toContain('drawer');});
test('三种结果不同，独立保存并重新加载',()=>{mount(<Branches/>);fireEvent.click(screen.getByRole('button',{name:/上前质疑/}));expect(screen.getByText(story.branches[1].text)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/保存为独立版本/}));fireEvent.click(screen.getByRole('button',{name:/直接离开/}));expect(screen.getByText(story.branches[2].text)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/保存为独立版本/}));const s=readState();expect(s.versions).toHaveLength(2);expect(s.versions[0].id).not.toBe(s.versions[1].id);expect(s.text).toBe(story.text);cleanup();mount(<Branches/>);expect(screen.getByText(/2 个版本/)).toBeTruthy();});
test('手稿可编辑并保存',()=>{mount(<Studio/>);fireEvent.change(screen.getByLabelText('故事正文'),{target:{value:'测试手稿'}});expect(readState().text).toBe('测试手稿');});
test('返回探索恢复原进度和播放状态',()=>{localStorage.setItem('storyverse-v1',JSON.stringify({exploration:{time:33,playing:true},time:33,playing:false}));mount(<Routes><Route path="/" element={<Explore/>}/><Route path="/work" element={<div>已返回作品</div>}/></Routes>);fireEvent.click(screen.getByRole('button',{name:/返回放映/}));expect(screen.getByText('已返回作品')).toBeTruthy();expect(readState().time).toBe(33);expect(readState().playing).toBe(true);expect(readState().exploration).toBeNull();});
test('手动进入探索记录位置与状态',()=>{mount(<Routes><Route path="/" element={<Player/>}/><Route path="/explore" element={<div>探索页</div>}/></Routes>);fireEvent.change(screen.getByLabelText('播放进度'),{target:{value:'27'}});fireEvent.click(screen.getByRole('button',{name:'播放'}));fireEvent.click(screen.getByRole('button',{name:'进入探索'}));expect(screen.getByText('探索页')).toBeTruthy();expect(readState().exploration).toEqual({time:27,playing:true});});
test('版本唯一，损坏存储安全回退',()=>{expect(makeVersion('wait','').id).not.toBe(makeVersion('wait','').id);localStorage.setItem('storyverse-v1','broken');expect(readState().title).toBe(story.title);});
test('数据模型更新后旧存档及独立版本不被覆盖',()=>{
 const version={id:'existing',branchId:'leave',title:'我的旧版本',text:'保存时的文本',createdAt:'2026-11-05T00:00:00Z'};
 localStorage.setItem('storyverse-v1',JSON.stringify({title:'我的手稿',text:'编辑后的正文',world:'编辑后的世界',time:42,playing:false,perspective:'zhou',seen:['clock'],versions:[version],selectedBranch:'leave',exploration:{time:42,playing:true}}));
 const state=readState();expect(state.title).toBe('我的手稿');expect(state.text).toBe('编辑后的正文');expect(state.world).toBe('编辑后的世界');expect(state.versions).toEqual([version]);expect(state.time).toBe(42);expect(state.exploration).toEqual({time:42,playing:true});expect(state.perspective).toBe('zhou');expect(state.seen).toEqual(['clock']);
});
