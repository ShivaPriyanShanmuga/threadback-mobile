// Local planar tracking using JSFeat's MIT-licensed ORB and RANSAC primitives.
// This estimates a plane transform, not object identity or general 3D geometry.
export const IDENTITY = [1,0,0,0,1,0,0,0,1];
export function project(h,p) {
  const z=h[6]*p.x+h[7]*p.y+h[8];
  return Math.abs(z)<1e-9?null:{x:(h[0]*p.x+h[1]*p.y+h[2])/z,y:(h[3]*p.x+h[4]*p.y+h[5])/z};
}
export function inverse(h) {
  const [a,b,c,d,e,f,g,i,j]=h;
  const m=[e*j-f*i,c*i-b*j,b*f-c*e,f*g-d*j,a*j-c*g,c*d-a*f,d*i-e*g,b*g-a*i,a*e-b*d];
  const det=a*m[0]+b*m[3]+c*m[6];
  return Math.abs(det)<1e-9?null:m.map(v=>v/det);
}
export function validTransform(h) {
  if(!h?.every(Number.isFinite))return false;
  const p=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}].map(x=>project(h,x));
  if(p.some(v=>!v || v.x< -1.5 || v.y< -1.5 || v.x>2.5 || v.y>2.5))return false;
  const cross=p.map((a,k)=>{const b=p[(k+1)%4],c=p[(k+2)%4];return (b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);});
  if(!cross.every(v=>v>0))return false;
  const area=Math.abs(p.reduce((sum,a,k)=>{const b=p[(k+1)%4];return sum+a.x*b.y-a.y*b.x;},0))/2;
  return area>.12&&area<6;
}
function bits(n){n=n-((n>>>1)&0x55555555);n=(n&0x33333333)+((n>>>2)&0x33333333);return (((n+(n>>>4))&0x0f0f0f0f)*0x01010101)>>>24;}
export class PlanarTracker {
  constructor(cv=globalThis.jsfeat){if(!cv)throw new Error('Vision library not available.');this.cv=cv;this.reference=null;this.cornerPool=[];}
  extract(frame){
    const cv=this.cv,w=frame.width,h=frame.height;
    const gray=new cv.matrix_t(w,h,cv.U8_t|cv.C1_t),blur=new cv.matrix_t(w,h,cv.U8_t|cv.C1_t);
    cv.imgproc.grayscale(frame.data,w,h,gray);cv.imgproc.gaussian_blur(gray,blur,5,1.1);
    while(this.cornerPool.length<w*h)this.cornerPool.push(new cv.keypoint_t());
    cv.yape06.laplacian_threshold=25;cv.yape06.min_eigen_value_threshold=20;
    let count=cv.yape06.detect(blur,this.cornerPool,31);
    const selected=this.cornerPool.slice(0,count).sort((a,b)=>b.score-a.score).slice(0,350).map(p=>({x:p.x,y:p.y,score:p.score,angle:0}));
    for(const p of selected){let mx=0,my=0;for(let y=-15;y<=15;y++){const bound=Math.floor(Math.sqrt(225-y*y));for(let x=-bound;x<=bound;x++){const v=blur.data[(p.y+y)*w+p.x+x];mx+=x*v;my+=y*v;}}p.angle=Math.atan2(my,mx);}
    count=selected.length;
    const descriptors=new cv.matrix_t(32,Math.max(1,count),cv.U8_t|cv.C1_t);
    if(count)cv.orb.describe(blur,selected,count,descriptors);
    return {w,h,points:selected,count,descriptors};
  }
  setReference(frame){this.reference=this.extract(frame);return this.reference.count;}
  match(frame){
    const ref=this.reference;if(!ref || ref.count<12)return {ok:false,reason:'Reference needs more texture',inliers:0};
    const cv=this.cv,cur=this.extract(frame),matches=[],used=new Map(),ad=ref.descriptors.buffer.i32,bd=cur.descriptors.buffer.i32;
    for(let i=0;i<cur.count;i++){
      let best=257,second=257,idx=-1;
      for(let j=0;j<ref.count;j++){let dist=0;for(let k=0;k<8;k++)dist+=bits(bd[i*8+k]^ad[j*8+k]);if(dist<best){second=best;best=dist;idx=j;}else if(dist<second)second=dist;}
      if(best<65&&best<second*.78&&(!used.has(idx)||used.get(idx).dist>best))used.set(idx,{from:ref.points[idx],to:cur.points[i],dist:best});
    }
    matches.push(...used.values());
    if(matches.length<12)return {ok:false,reason:'Looking for the saved workspace',inliers:0};
    const from=matches.map(m=>({x:m.from.x,y:m.from.y})),to=matches.map(m=>({x:m.to.x,y:m.to.y}));
    const model=new cv.motion_model.homography2d(),h=new cv.matrix_t(3,3,cv.F32_t|cv.C1_t),mask=new cv.matrix_t(matches.length,1,cv.U8_t|cv.C1_t);
    const ok=cv.motion_estimator.ransac(new cv.ransac_params_t(4,3,.5,.99),model,from,to,matches.length,h,mask,400);
    if(!ok)return {ok:false,reason:'Alignment uncertain',inliers:0};
    const fi=[],ti=[];for(let i=0;i<matches.length;i++)if(mask.data[i]){fi.push(from[i]);ti.push(to[i]);}
    if(fi.length<12||fi.length/matches.length<.45)return {ok:false,reason:'Too few reliable matches',inliers:fi.length};
    model.run(fi,ti,h,fi.length);
    const raw=Array.from(h.data).slice(0,9);
    const normalized=[raw[0]*ref.w/cur.w,raw[1]*ref.h/cur.w,raw[2]/cur.w,raw[3]*ref.w/cur.h,raw[4]*ref.h/cur.h,raw[5]/cur.h,raw[6]*ref.w,raw[7]*ref.h,raw[8]];
    const spread=(Math.max(...fi.map(p=>p.x))-Math.min(...fi.map(p=>p.x)))/ref.w*(Math.max(...fi.map(p=>p.y))-Math.min(...fi.map(p=>p.y)))/ref.h;
    const error=fi.reduce((sum,p,i)=>{const q=project(raw,p);return sum+(q?Math.hypot(q.x-ti[i].x,q.y-ti[i].y):100);},0)/fi.length;
    if(spread<.035||error>3||!validTransform(normalized))return {ok:false,reason:'Alignment needs a clearer view',inliers:fi.length};
    return {ok:true,matrix:normalized,inliers:fi.length,matches:matches.length,error};
  }
}

