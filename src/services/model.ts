import type {Character, WorldSetting, Fact} from '../data/types';
export interface Permissions {
  explorableSceneIds:string[]; perspectiveIds:string[]; remixNodeIds:string[];
  editableFields:('title'|'text')[]; reusableAssetIds:string[];
}
export interface AssetVersion {id:string;createdAt:string;path?:string;fileId?:string}
export interface Asset {id:string;kind:'character'|'background'|'prop'|'audio'|'video';name:string;mimeType?:string;size?:number;references:string[];versions:AssetVersion[]}
export interface World {characters:Character[];relationships:{from:string;to:string;description:string}[];rules:string[];scenes:{id:string;name:string;setting:WorldSetting}[];events:Fact[];knowledge:{nodeId:string;characterId:string;factIds:string[]}[]}
export interface Interaction {id:string;sceneId:string;at:number;hotspotIds:string[];actions:string[];trigger:{kind:'time'|'choice';value:string};stateChanges:{key:string;value:string}[];branchIds:string[]}
export interface StoryRecord {id:string;name:string;type:string;author:string;synopsis:string;status:'draft'|'producing'|'ready'|'published';stage:string;originalText:string;draft:{id:string;title:string;text:string;world:string;updatedAt:string}}
export interface Snapshot {id:string;storyId:string;presetVersionId:string;title:string;text:string;world:string;permissions:Permissions;assetIds:string[];assetVersionRefs:{assetId:string;versionId:string}[];createdAt:string}
export interface Release {status:'unpublished'|'published';currentVersionId:string|null;publishedAt:string|null;display:{title:string;synopsis:string};versions:Snapshot[]}
export interface Progress {storyId:string;releaseId:string;time:number;chapterId:string;nodeId:string;playing:boolean;perspective:string;seen:string[];completed:boolean;exploration:null|{time:number;playing:boolean};nodeVisited:boolean;selectedBranch:string;videoAssetId:string|null}
export interface Remix {id:string;branchId:string;title:string;text:string;createdAt:string;sourceStoryId:string;sourceVersionId:string;sourceNodeId:string;changes:{field:'title'|'text';value:string}[];reusedAssetIds:string[]}
export interface Database {schemaVersion:2;creator?:CreatorWorkspace;stories:StoryRecord[];world:World;assets:Asset[];interactions:Interaction[];permissions:Permissions;releases:Record<string,Release>;progress:Progress;branches:Remix[]}
export interface InitialModel {schemaVersion:1;presetVersionId:string;story:{id:string;type:string;author:string;status:'published';stage:string};relationships:World['relationships'];rules:string[];sceneId:string;interactions:Interaction[];permissions:Permissions;assets:Asset[];release:{id:string;publishedAt:string}}
export interface LegacyVersion {id:string;branchId:string;title:string;text:string;createdAt:string}
export interface LegacyState {title:string;text:string;world:string;time:number;playing:boolean;perspective:string;seen:string[];versions:LegacyVersion[];exploration:null|{time:number;playing:boolean};nodeVisited:boolean;selectedBranch:string;videoAssetId:string|null}

export interface CreatorStructure {
 characters:{id:string;name:string;identity:string;personality:string;goal:string;boundaries:string}[];
 scenes:{id:string;name:string;description:string}[];
 facts:{id:string;text:string}[];
 events:{id:string;title:string;description:string;order:number}[];
 nodes:{id:string;name:string}[];
 knowledge:{nodeId:string;characterId:string;factIds:string[]}[];
 relationships:{id:string;from:string;to:string;description:string}[];
 worldbook:string;rules:string[];
}
export interface CreatorProject {storyId:string;archived:boolean;idea:string;structure:CreatorStructure;templateId?:string}
export interface CreatorWorkspace {activeStoryId:string;projects:Record<string,CreatorProject>}
