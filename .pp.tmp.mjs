import sharp from 'sharp';
const S = process.argv[2];
const { data: img, info } = await sharp('src/assets/photos/salon.jpg').raw().toBuffer({resolveWithObject:true});
const { width:W, height:H, channels:C } = info;
const { data: mask } = await sharp('public/room/salon-mask.png').toColourspace('b-w').raw().toBuffer({resolveWithObject:true});
const wl=[]; for(let i=0;i<W*H;i++){ if(mask[i]<200) continue; const j=i*C;
  wl.push((0.299*img[j]+0.587*img[j+1]+0.114*img[j+2])/255); }
wl.sort((a,b)=>a-b); const ref=wl[Math.floor(wl.length*0.98)];
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
async function render(hex,out){ const [tr,tg,tb]=hex2rgb(hex); const o=Buffer.from(img);
  for(let i=0;i<W*H;i++){ const a=mask[i]/255; if(a<=0.003) continue; const j=i*C;
    const L=(0.299*img[j]+0.587*img[j+1]+0.114*img[j+2])/255; const f=Math.min(L/ref,1);
    o[j]=img[j]*(1-a)+Math.round(tr*f)*a; o[j+1]=img[j+1]*(1-a)+Math.round(tg*f)*a; o[j+2]=img[j+2]*(1-a)+Math.round(tb*f)*a; }
  await sharp(o,{raw:{width:W,height:H,channels:C}}).jpeg({quality:90}).toFile(out); }
await render('#2A9D8F', `${S}/v-turq.jpg`);
await render('#C1502E', `${S}/v-terra.jpg`);
// Recorte sobre la planta, que es donde estaba el fallo.
const box={left:430,top:320,width:520,height:340};
const cells=await Promise.all([['ORIGINAL','src/assets/photos/salon.jpg'],['TURQUESA',`${S}/v-turq.jpg`]]
  .map(async ([n,f])=>{ const im=await sharp(f).extract(box).resize(box.width*2,box.height*2).toBuffer();
    const lbl=Buffer.from(`<svg width="${box.width*2}" height="24"><rect width="100%" height="100%" fill="#000"/><text x="6" y="18" font-family="monospace" font-size="15" fill="#0f0">${n}</text></svg>`);
    return sharp({create:{width:box.width*2,height:box.height*2+24,channels:3,background:'#000'}})
      .composite([{input:im,top:24,left:0},{input:lbl,top:0,left:0}]).png().toBuffer(); }));
await sharp({create:{width:box.width*2,height:(box.height*2+24)*2,channels:3,background:'#000'}})
  .composite(cells.map((input,i)=>({input,top:i*(box.height*2+24),left:0})))
  .jpeg({quality:90}).toFile(`${S}/v-planta.jpg`);
console.log('ref', ref.toFixed(3), 'ok');
