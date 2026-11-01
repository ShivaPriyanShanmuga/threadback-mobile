import {emptyState,validateState} from './core.mjs';
const KEY='threadback.workspace.v1';
let dbPromise;
export function readState(){const raw=localStorage.getItem(KEY);return raw?validateState(JSON.parse(raw)):null;}
export function writeState(state){localStorage.setItem(KEY,JSON.stringify(state));}
export function clearState(){localStorage.removeItem(KEY);}
function db(){return dbPromise ||= new Promise((resolve,reject)=>{const request=indexedDB.open('threadback-evidence',1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('Photo storage is unavailable. Allow site storage or use a regular browser tab.'));});}
async function operation(mode,action){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('images',mode),store=tx.objectStore('images');let value;const request=action(store);if(request)request.onsuccess=()=>{value=request.result;};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(new Error('Could not save the photo. Export your data or free device storage.'));tx.onabort=()=>reject(new Error('Photo storage operation was interrupted.'));});}
export const putImage=(id,data)=>operation('readwrite',s=>s.put(data,id));
export const getImage=id=>id?operation('readonly',s=>s.get(id)):Promise.resolve(null);
export const removeImage=id=>operation('readwrite',s=>s.delete(id));
export const clearImages=()=>operation('readwrite',s=>s.clear());
export async function backup(state){const ids=new Set(state.tasks.flatMap(t=>[t.reference,...t.checkpoints.map(c=>c.imageId)]).filter(Boolean));const images={};for(const id of ids){const data=await getImage(id);if(data)images[id]=data;}return {format:'threadback-backup',exportedAt:new Date().toISOString(),state,images};}
export async function restore(input){if(input?.format!=='threadback-backup')throw new Error('Choose a Threadback backup JSON file.');const state=validateState(input.state),images=input.images||{};if(typeof images!=='object'||Array.isArray(images)||Object.keys(images).length>300)throw new Error('The backup has too many photos.');for(const [id,data]of Object.entries(images)){if(id.length>100||typeof data!=='string'||data.length>2_000_000||!/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(data))throw new Error('The backup contains an unsupported photo.');}for(const [id,data]of Object.entries(images))await putImage(id,data);writeState(state);return state;}

