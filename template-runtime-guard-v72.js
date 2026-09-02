// RAF.studio — template runtime guard v7.2
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {WEBSITE_ROOT} from './firebase-config.js';
const db=getDatabase(getApp()),EDITOR=new URLSearchParams(location.search).has('editor');
const path=EDITOR?`${WEBSITE_ROOT}/public/editorDraft/builder/templateV72`:`${WEBSITE_ROOT}/public/builder/templateV72`;
onValue(ref(db,path),s=>{if(s.exists())return;delete document.body.dataset.rafTemplate72;document.getElementById('rafTpl72Css')?.remove()});
