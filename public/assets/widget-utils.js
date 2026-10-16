export const DEFAULT_PREFERENCES=Object.freeze({scale:100,contrast:false,underline:false,motion:false});
export const PREFERENCE_KEY='icg-display-preferences-v1';
export function normalisePreferences(value){
  const input=value&&typeof value==='object'?value:{};
  const scale=Number(input.scale);
  return {scale:Number.isFinite(scale)?Math.min(140,Math.max(100,Math.round(scale/10)*10)):100,contrast:input.contrast===true,underline:input.underline===true,motion:input.motion===true};
}
export function readPreferences(storage){
  try{return normalisePreferences(JSON.parse(storage.getItem(PREFERENCE_KEY)||'null'));}catch{return {...DEFAULT_PREFERENCES};}
}
export function savePreferences(storage,preferences){
  try{storage.setItem(PREFERENCE_KEY,JSON.stringify(normalisePreferences(preferences)));return true;}catch{return false;}
}
