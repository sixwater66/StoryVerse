/** Preset narrative data; character knowledge is scoped before choosing an action. */
export interface Fact { id: string; text: string }
export interface Character {
  id: string; name: string; role: string; description: string; personality: string;
  known: string; narrative: string;
  knowledge: { at: string; factIds: string[]; unknownFactIds: string[]; subjectivePerceptions: string[] };
}
export interface WorldSetting {
  shop: { name: string; services: string[] }; location: string; weather: string;
  environment: string; spatialFeatures: string[];
}
export interface Clue { id: string; name: string; x: number; y: number; text: string; perspectivePolicy: string }
export interface Dialogue { speakerId: string; text: string; trigger: { branchId: string } }
export interface Shot { id: string; start: number; end: number; title: string; caption: string; visualDescription: string; narration: string; dialogue: Dialogue[] }
export interface Branch { id: string; action: string; title: string; text: string; dialogue: string[]; result: string; mode: string }
export interface Story {
  schemaVersion: number; title: string; synopsis: string; background: string; theme: string;
  originalText: string; linearNarrative: { title: string; text: string; mode: string };
  /** Compatibility fields used by the existing editable prototype. */
  text: string; world: string; duration: number; exploreAt: number; videoSrc: string;
  worldSetting: WorldSetting; facts: Fact[]; characters: Character[]; clues: Clue[]; shots: Shot[]; branches: Branch[];
}
