// In-memory Firebase stand-in. This fixture never reads or writes production.
let builder={},listener;
export const initializeApp=()=>({});
export const getDatabase=()=>({});
export const ref=(_,path)=>path;
export function onValue(_,callback){listener=callback;callback({val:()=>builder})}
export function publishBuilder(value){builder=value;listener?.({val:()=>builder})}
