const KEY = 'mingli.ziling.history.v1';
export const REVIEW_LABELS = { pending:'还没结果', match:'符合', partial:'部分符合', miss:'不符合', unclear:'无法判断' };
export const loadReadings = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || raw.length > 500000) return [];
    const rows = JSON.parse(raw);
    return Array.isArray(rows) ? rows.filter(row => row && typeof row.id === 'string' && typeof row.createdAt === 'string' && row.reading?.version === 'ziling-reading-2'
      && ['summary','tension','observation','questionText'].every(key=>typeof row.reading[key]==='string')
      && Array.isArray(row.reading.chips) && row.reading.chips.every(chip=>chip&&typeof chip.label==='string')
      && Array.isArray(row.reading.sections) && row.reading.sections.every(section=>section&&typeof section.h==='string'&&typeof section.body==='string')).slice(0,20) : [];
  } catch { return []; }
};
const write = rows => {
  try { localStorage.setItem(KEY, JSON.stringify(rows)); return true; }
  catch { return false; }
};
export const saveReading = ({id,reading,type,createdAt}) => {
  const rows = loadReadings();
  if(rows.some(row=>row.id===id)) return {ok:true};
  if(rows.length>=20) return {ok:false,message:'本机已保存20条，请先在记录里删除不需要的一条。不会自动覆盖旧记录。'};
  const days = reading.window === 'week' ? 7 : reading.window === 'month' ? 30 : 0;
  const row = {id,type,createdAt,dueAt:days ? new Date(Date.parse(createdAt)+days*86400000).toISOString() : '',reading:JSON.parse(JSON.stringify(reading)),review:{outcome:'pending',note:'',updatedAt:''}};
  return write([row,...rows]) ? {ok:true} : {ok:false,message:'浏览器未能保存，可能存储空间不足或不允许本机存储；本次解读仍可查看。'};
};
export const updateReview = (id,outcome,note) => {
  if(!Object.hasOwn(REVIEW_LABELS,outcome)) return false;
  const rows=loadReadings();const row=rows.find(row=>row.id===id);if(!row)return false;
  row.review={outcome,note:String(note||'').slice(0,500),updatedAt:new Date().toISOString()};
  return write(rows);
};
export const deleteReading = id => write(loadReadings().filter(row=>row.id!==id));
