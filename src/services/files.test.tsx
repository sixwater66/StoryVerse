// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import {File as NativeFile} from 'node:buffer';
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,render,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {Provider} from '../store';
import Player from '../components/Player';
import {importVideo,readLegacyState,saveLegacyState} from './data';
afterEach(()=>{cleanup();localStorage.clear();vi.unstubAllGlobals();vi.restoreAllMocks();});
test('播放器卸载并重新挂载后，从持久化文件恢复而非旧 blob URL',async()=>{
 let count=0;const create=vi.fn(()=>`blob:restored-${++count}`),revoke=vi.fn();
 vi.stubGlobal('URL',class extends URL{static createObjectURL=create;static revokeObjectURL=revoke;});
 vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
 const file=new NativeFile(['video-data'],'local.mp4',{type:'video/mp4'}) as unknown as File;
 await importVideo(file);saveLegacyState({...readLegacyState(),time:24,playing:false});
 const mount=()=>render(<Provider><MemoryRouter><Player/></MemoryRouter></Provider>);
 const first=mount();await waitFor(()=>expect(first.container.querySelector('video')?.getAttribute('src')).toBe('blob:restored-1'));
 first.unmount();expect(revoke).toHaveBeenCalledWith('blob:restored-1');
 const second=mount();await waitFor(()=>expect(second.container.querySelector('video')?.getAttribute('src')).toBe('blob:restored-2'));
 expect(readLegacyState().time).toBe(24);expect(create.mock.calls).toHaveLength(2);
});
