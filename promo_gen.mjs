import { chromium } from "playwright";
import { promises as fs } from "fs";
import path from "path";

const ROOT = "/home/claude/stone-car-prestige";
const OUT = "/home/claude/promo";
const FRAMES = path.join(OUT, "frames");
await fs.rm(FRAMES, { recursive: true, force: true });
await fs.mkdir(FRAMES, { recursive: true });

async function b64(p) {
  return "data:image/jpeg;base64," + (await fs.readFile(p)).toString("base64");
}
const extAvant = await b64(path.join(ROOT, "public/realisations/ext-avant.jpg"));
const extApres = await b64(path.join(ROOT, "public/realisations/ext-apres.jpg"));
const intAvant = await b64(path.join(ROOT, "public/realisations/int-avant.jpg"));
const intApres = await b64(path.join(ROOT, "public/realisations/int-apres.jpg"));

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0C0C0E;overflow:hidden;
  font-family:"Oswald","Bebas Neue","Arial Narrow",system-ui,sans-serif;color:#F5F3EE}
.stage{position:relative;width:1920px;height:1080px;background:#0C0C0E}
.scene{position:absolute;inset:0;opacity:0;display:flex;align-items:center;justify-content:center;flex-direction:column}
.gold{background:linear-gradient(120deg,#E9CE7B,#C9A227 45%,#9C7B1E);-webkit-background-clip:text;background-clip:text;color:transparent}
.disp{font-weight:600;text-transform:uppercase;letter-spacing:.14em;line-height:1}
.thin{font-weight:300;letter-spacing:.42em;text-transform:uppercase}
.rule{height:2px;width:0;background:linear-gradient(90deg,transparent,#C9A227,transparent);margin:30px 0}
.vign{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,transparent 40%,rgba(0,0,0,.78) 100%);pointer-events:none}
.ba{position:absolute;inset:0}
.ba img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.frame{position:absolute;inset:60px;border:1px solid rgba(201,162,39,.5);z-index:6;pointer-events:none}
.tag{position:absolute;left:100px;top:100px;z-index:7;font-weight:600;letter-spacing:.3em;text-transform:uppercase;font-size:36px;
  color:#EAD08A;padding:14px 30px;border:1px solid rgba(201,162,39,.75);background:rgba(0,0,0,.42)}
.cap{position:absolute;left:100px;bottom:110px;z-index:7;font-weight:300;letter-spacing:.34em;text-transform:uppercase;font-size:30px;color:#cfc8ba}

@keyframes sc{0%{opacity:0}12%{opacity:1}86%{opacity:1}100%{opacity:0}}
.s1{animation:sc 3.0s .2s both}
.s2{animation:sc 4.4s 3.0s both}
.s3{animation:sc 3.6s 7.2s both}
.s4{animation:sc 3.2s 10.6s both}
.s5{animation:sc 4.2s 13.6s both}

@keyframes fin{from{opacity:0}to{opacity:1}}
@keyframes fout{from{opacity:1}to{opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:translateY(0)}}
@keyframes grow{from{width:0}to{width:420px}}
@keyframes kb{from{transform:scale(1.12)}to{transform:scale(1)}}
@keyframes pop{0%{opacity:0;transform:scale(.7)}55%{opacity:1;transform:scale(1.07)}100%{opacity:1;transform:scale(1)}}

.s1 .t1{opacity:0;animation:up .7s .5s both;font-size:130px}
.s1 .t2{opacity:0;animation:up .7s .72s both;font-size:130px}
.s1 .rule{animation:grow .6s 1.1s both}
.s1 .t3{opacity:0;animation:fin .7s 1.4s both;font-size:40px;color:#d9d2c4}

.kbwrap{position:absolute;inset:0}
.s2 .kbwrap{animation:kb 4.6s 3.0s both}
.s3 .kbwrap{animation:kb 3.8s 7.2s both}

.s2 .avant{opacity:1;animation:fout .9s 5.2s both}
.s2 .tag-a{opacity:1;animation:fout .4s 5.2s both}
.s2 .tag-b{opacity:0;animation:fin .5s 5.4s both}
.s3 .avant{opacity:1;animation:fout .9s 9.0s both}
.s3 .tag-a{opacity:1;animation:fout .4s 9.0s both}
.s3 .tag-b{opacity:0;animation:fin .5s 9.2s both}

.s4 .k{opacity:0;animation:fin .6s 10.9s both;font-size:38px;letter-spacing:.5em}
.s4 .big{opacity:0;animation:pop .7s 11.2s both;font-size:300px;font-weight:600;
  background:linear-gradient(120deg,#E9CE7B,#C9A227 40%,#F1DE9A 60%,#9C7B1E);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.s4 .sub{opacity:0;animation:up .7s 11.7s both;font-size:52px;letter-spacing:.16em;color:#efe9db}
.s4 .rule{animation:grow .6s 11.9s both}

.s5 .brand{opacity:0;animation:up .7s 13.9s both;font-size:74px}
.s5 .rule{animation:grow .7s 14.4s both}
.s5 .site{opacity:0;animation:pop .8s 14.8s both;font-size:92px;font-weight:600;margin:10px 0 52px}
.s5 .info{opacity:0;animation:fin .8s 15.4s both;font-size:38px;letter-spacing:.22em;color:#cfc8ba;margin-bottom:30px}
.s5 .cta{opacity:0;animation:fin .8s 15.9s both;font-size:32px;letter-spacing:.34em;color:#EAD08A}
</style></head><body>
<div class="stage">
  <div class="scene s1">
    <div class="thin gold" style="font-size:34px;margin-bottom:24px;opacity:.95">Car Care · Detailing</div>
    <div class="disp t1">Stone Car</div>
    <div class="disp t2 gold">Prestige</div>
    <div class="rule"></div>
    <div class="thin t3">L'exigence à chaque détail</div>
  </div>
  <div class="scene s2">
    <div class="ba"><div class="kbwrap"><img class="apres" src="${extApres}"><img class="avant" src="${extAvant}"></div></div>
    <div class="vign"></div><div class="frame"></div>
    <div class="tag tag-a">Avant</div><div class="tag tag-b">Après</div>
    <div class="cap">Extérieur — Carrosserie</div>
  </div>
  <div class="scene s3">
    <div class="ba"><div class="kbwrap"><img class="apres" src="${intApres}"><img class="avant" src="${intAvant}"></div></div>
    <div class="vign"></div><div class="frame"></div>
    <div class="tag tag-a">Avant</div><div class="tag tag-b">Après</div>
    <div class="cap">Intérieur — Habitacle</div>
  </div>
  <div class="scene s4">
    <div class="disp k gold">Offre de lancement</div>
    <div class="big">−20%</div>
    <div class="rule"></div>
    <div class="disp sub">sur votre premier detailing</div>
  </div>
  <div class="scene s5">
    <div class="disp brand">Stone Car <span class="gold">Prestige</span></div>
    <div class="rule"></div>
    <div class="disp site gold">stone.dasolabs.be</div>
    <div class="info">Thuin · Belgique&nbsp;&nbsp;—&nbsp;&nbsp;0499 91 29 32</div>
    <div class="disp cta">Réservez dès maintenant</div>
  </div>
</div>
</body></html>`;

const htmlPath = path.join(OUT, "promo.html");
await fs.writeFile(htmlPath, html, "utf8");

const FPS = 30, DUR = 18.0;
const N = Math.round(FPS * DUR);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--force-color-profile=srgb", "--hide-scrollbars"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto("file://" + htmlPath, { waitUntil: "load" });
await page.evaluate(async () => {
  await Promise.all(Array.from(document.images).map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
});
await page.waitForTimeout(300);
// fige toutes les animations pour pouvoir les positionner image par image
await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));

for (let i = 0; i < N; i++) {
  const ms = (i / FPS) * 1000;
  await page.evaluate((t) => document.getAnimations().forEach((a) => { a.currentTime = t; }), ms);
  await page.screenshot({
    path: path.join(FRAMES, "f" + String(i).padStart(5, "0") + ".jpg"),
    type: "jpeg", quality: 92,
  });
}
await browser.close();
console.log("FRAMES_DONE=" + N);
