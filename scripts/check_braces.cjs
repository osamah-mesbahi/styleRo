const fs = require('fs');
const s = fs.readFileSync('pages/Login.tsx', 'utf8');
const lines = s.split(/\r?\n/);
let open = 0;
let firstLine = null;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  for (const ch of l) {
    if (ch === '{') open++;
    if (ch === '}') open--;
  }
  if (open === 1 && firstLine === null) firstLine = i + 1;
}
console.log('first line with open==1:', firstLine);
let maxDiff=0; let maxLine=0; open=0;
for(let i=0;i<lines.length;i++){
  const l=lines[i];
  for(const ch of l){ if(ch==='{' ) open++; if(ch==='}') open--; }
  if(open>maxDiff){ maxDiff=open; maxLine=i+1; }
}
console.log('maxDiff',maxDiff,'at',maxLine);
let totalOpen=0, totalClose=0;
for(const ch of s){ if(ch==='{' ) totalOpen++; if(ch==='}') totalClose++; }
console.log('totalOpen',totalOpen,'totalClose',totalClose);

// print context around maxLine
const start=Math.max(1,maxLine-10);
const end=Math.min(lines.length, maxLine+10);
for(let i=start;i<=end;i++) console.log(i+':',lines[i-1]);
