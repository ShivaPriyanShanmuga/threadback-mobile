export const VERSION = 1;
export const MAX_TASKS = 30;
export const MAX_STEPS = 30;
const clean = (x, max = 1000) => typeof x === 'string' ? x.trim().slice(0,max) : '';
export const uid = () => globalThis.crypto?.randomUUID?.() || `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const clone = x => JSON.parse(JSON.stringify(x));
export function emptyState() { return {version:VERSION,tasks:[],activeId:null}; }
export function makeTask(title, steps, options={}) {
  const now = options.now || new Date().toISOString();
  const items = (steps || []).map(x => clean(x,160)).filter(Boolean).slice(0,MAX_STEPS);
  if (!clean(title,100) || !items.length) throw new Error('Give your task a name and at least one step.');
  return {id:uid(), title:clean(title,100), createdAt:now, updatedAt:now, status:'active', example:!!options.example,
    steps:items.map((title,i)=>({id:uid(),title,status:i===0?'active':'todo',detail:'',next:'',marker:null})),
    checkpoints:[],events:[],reference:null};
}
export function currentStep(task) { return task?.steps.find(s=>s.status==='active') || task?.steps.find(s=>s.status!=='done') || null; }
export function progress(task) { return task?.steps.length ? Math.round(task.steps.filter(s=>s.status==='done').length/task.steps.length*100) : 0; }
export function resumePacket(task) {
  const active = currentStep(task);
  const done = [...task.steps].reverse().find(s=>s.status==='done');
  const last = task.checkpoints.at(-1);
  return {lastCompleted:done?.title || 'No step completed yet',unfinished:active?.detail || last?.unfinished || '',
    nextAction:active?.next || (active ? active.title : 'All steps are complete. Review your finished work.'),
    step:active,checkpoint:last,summary:active ? `${done ? `${done.title} is complete. ` : ''}${active.detail ? `${active.detail} ` : ''}Next: ${active.next || active.title}` : 'All steps are complete. Your work is saved.'};
}
export function recordEvent(task, type, payload={}, now=new Date().toISOString()) {
  task.events.push({id:uid(),type,at:now,...payload}); task.events=task.events.slice(-300); task.updatedAt=now;
}
export function setStepStatus(task, stepId, status, now) {
  const step = task.steps.find(s=>s.id===stepId);
  if (!step || !['todo','active','done'].includes(status)) throw new Error('Unknown step or status.');
  if (status==='active') for (const s of task.steps) if (s.id!==stepId && s.status==='active') s.status='todo';
  step.status=status;
  if (status==='done') {
    step.detail=''; step.next='';
    if (!task.steps.some(s=>s.status==='active')) { const next = task.steps.find(s=>s.status==='todo'); if(next) next.status='active'; }
  }
  task.status=task.steps.every(s=>s.status==='done')?'complete':'active';
  recordEvent(task,'step',{stepId,status,label:step.title},now);
}
export function saveCheckpoint(task, input, now=new Date().toISOString()) {
  const step = task.steps.find(s=>s.id===input.stepId) || currentStep(task);
  const note=clean(input.note,2000), unfinished=clean(input.unfinished), next=clean(input.next);
  if (!note && !unfinished && !next) throw new Error('Add a note, unfinished detail, or next action.');
  if (step) { if (unfinished) step.detail=unfinished; if(next) step.next=next; }
  const checkpoint={id:uid(),at:now,stepId:step?.id || null,note,unfinished,next,
    source:input.source==='voice'?'voice':'typed',imageId:clean(input.imageId,100)||null,
    done:input.complete===true,confirmed:true};
  task.checkpoints.push(checkpoint); task.checkpoints=task.checkpoints.slice(-150);
  if (step && input.complete===true) setStepStatus(task,step.id,'done',now);
  recordEvent(task,'checkpoint',{checkpointId:checkpoint.id,label:note || unfinished || next},now);
  return checkpoint;
}
export function suggestCheckpoint(text) {
  const note=clean(text,2000);
  const clauses=note.split(/(?<=[.!?])\s+|;\s*|\n+/).map(s=>s.trim()).filter(Boolean);
  const nextClause=clauses.find(s=>/^(next(?:\s+step)?|then|tomorrow|resume with)\s*[:,\-]?\s+/i.test(s));
  const unfinished=clauses.filter(s=>/\b(not yet|not done|not finished|haven['’]?t|hasn['’]?t|isn['’]?t|aren['’]?t|still|unfinished|unresolved|but|need to|needs|waiting|stuck)\b/i.test(s)).join(' ');
  const negative=/\b(not|never|haven['’]?t|hasn['’]?t|isn['’]?t|aren['’]?t|didn['’]?t|unfinished)\b/i.test(note);
  const complete=!negative && /\b(done|finished|completed|complete)\b/i.test(note);
  return {note,unfinished,next:nextClause?nextClause.replace(/^(next(?:\s+step)?|then|tomorrow|resume with)\s*[:,\-]?\s*/i,''):'',complete};
}
export function applyChange(state, taskId, operation) {
  const next=clone(state), task=next.tasks.find(t=>t.id===taskId);
  if (!task) throw new Error('This task could not be found.');
  operation(task); return next;
}
export function validateState(input) {
  if (!input || input.version!==VERSION || !Array.isArray(input.tasks) || input.tasks.length>MAX_TASKS) throw new Error('This is not a supported Threadback backup.');
  const seen=new Set();
  const tasks=input.tasks.map(t=>{
    if(!t || typeof t.id!=='string' || seen.has(t.id) || !clean(t.title,100) || !Array.isArray(t.steps) || !t.steps.length || t.steps.length>MAX_STEPS) throw new Error('The backup contains an invalid task.');
    seen.add(t.id);
    const ids=new Set();
    const steps=t.steps.map(s=>{
      if(!s || typeof s.id!=='string' || ids.has(s.id) || !clean(s.title,160) || !['todo','active','done'].includes(s.status)) throw new Error('The backup contains an invalid step.');
      ids.add(s.id);
      const m=s.marker;
      const marker=m && Number.isFinite(m.x)&&Number.isFinite(m.y)&&m.x>=0&&m.x<=1&&m.y>=0&&m.y<=1 ? {x:m.x,y:m.y}:null;
      return {id:clean(s.id,100),title:clean(s.title,160),status:s.status,detail:clean(s.detail),next:clean(s.next),marker};
    });
    if(steps.filter(s=>s.status==='active').length>1) throw new Error('A task can only have one current step.');
    const checkpoints=(Array.isArray(t.checkpoints)?t.checkpoints:[]).slice(-150).map(c=>({id:clean(c.id,100)||uid(),at:validDate(c.at),stepId:ids.has(c.stepId)?c.stepId:null,note:clean(c.note,2000),unfinished:clean(c.unfinished),next:clean(c.next),source:c.source==='voice'?'voice':'typed',imageId:clean(c.imageId,100)||null,done:c.done===true,confirmed:c.confirmed===true}));
    return {id:clean(t.id,100),title:clean(t.title,100),createdAt:validDate(t.createdAt),updatedAt:validDate(t.updatedAt),status:steps.every(s=>s.status==='done')?'complete':t.status==='paused'?'paused':'active',example:t.example===true,steps,checkpoints,events:(Array.isArray(t.events)?t.events:[]).slice(-300).map(e=>({id:clean(e.id,100)||uid(),type:clean(e.type,30),at:validDate(e.at),label:clean(e.label,2000)})),reference:typeof t.reference==='string'?clean(t.reference,100):null};
  });
  return {version:VERSION,tasks,activeId:tasks.some(t=>t.id===input.activeId)?input.activeId:tasks[0]?.id||null};
}
function validDate(d){return typeof d==='string'&&Number.isFinite(Date.parse(d))?new Date(d).toISOString():new Date().toISOString();}
export function exampleState() {
  const now=new Date(), before=new Date(now.getTime()-27*60000).toISOString();
  const task=makeTask('Build a desk organizer',['Assemble the base','Attach the dividers','Fit the back panel','Finish & tidy'],{example:true,now:before});
  task.steps[0].marker={x:.46,y:.58};task.steps[1].marker={x:.72,y:.52};task.steps[2].marker={x:.25,y:.64};
  setStepStatus(task,task.steps[0].id,'done',before);
  saveCheckpoint(task,{stepId:task.steps[1].id,note:'The base is assembled. The dividers are positioned, but not glued. Next: glue the left divider before fitting the back panel.',unfinished:'Dividers positioned, but not glued.',next:'Glue the left divider.',source:'voice'},before);
  task.status='paused';return {version:VERSION,tasks:[task],activeId:task.id};
}

