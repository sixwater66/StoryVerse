import {expect,test} from 'vitest';
import {story} from './index';
test('预设模型数量、ID、引用与时间轴完整',()=>{
 expect(story.characters).toHaveLength(3);expect(story.clues).toHaveLength(6);expect(story.shots).toHaveLength(6);expect(story.branches).toHaveLength(3);
 for(const group of [story.characters,story.clues,story.shots,story.branches,story.facts])expect(new Set(group.map(x=>x.id)).size).toBe(group.length);
 const facts=new Set(story.facts.map(f=>f.id));
 for(const c of story.characters){for(const id of [...c.knowledge.factIds,...c.knowledge.unknownFactIds])expect(facts.has(id)).toBe(true);expect(c.knowledge.factIds.filter(id=>c.knowledge.unknownFactIds.includes(id))).toEqual([]);expect(c.narrative.length).toBeGreaterThan(100);}
 for(let i=0;i<story.shots.length;i++){const shot=story.shots[i];expect(shot.start).toBe(i?story.shots[i-1].end:0);expect(shot.end).toBeGreaterThan(shot.start);expect(shot.visualDescription).not.toBe('');for(const d of shot.dialogue){expect(story.characters.some(c=>c.id===d.speakerId)).toBe(true);expect(story.branches.some(b=>b.id===d.trigger.branchId)).toBe(true);}}
 expect(story.shots.at(-1)?.end).toBe(story.duration);expect(story.linearNarrative.text).toBe(story.originalText);
});
test('认知边界、统一线索及预制台词保持约束',()=>{
 expect(story.characters.find(c=>c.id==='lin')!.knowledge.factIds).not.toContain('storage');
 const zhou=story.characters.find(c=>c.id==='zhou')!;expect(zhou.knowledge.factIds).toEqual(['bystander']);expect(zhou.knowledge.unknownFactIds).toEqual(expect.arrayContaining(['letter','storage']));
 expect(story.clues.every(c=>c.perspectivePolicy==='shared-objective')).toBe(true);
 const dialogue=story.shots.flatMap(s=>s.dialogue);expect(dialogue).toHaveLength(3);expect(dialogue.every(d=>d.trigger.branchId==='question')).toBe(true);
 expect(dialogue.map(d=>d.text)).toEqual(['刚才放在这里的信呢？','先稍等，这本古籍不能碰坏。','我刚刚就看你一直在找东西。']);
 expect(story.branches.every(b=>b.mode==='prewritten')).toBe(true);expect(story.branches.map(b=>b.result)).toEqual(['误会解除','矛盾扩大','信件遗留']);
});
