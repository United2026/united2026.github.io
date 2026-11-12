/* Standalone runtime: replaces the Claude-hosted services (db, user, downloads) with this server's API. */
(function(){
  const api=async(p,body)=>{const r=await fetch(p,{method:body?"POST":"GET",credentials:"same-origin",headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined});
    if(r.status===401){location.href="login.html";throw new Error("login")}const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||r.status);e.status=r.status;throw e}return j};
  const meP=api("api/me").then(j=>{if(j.user.mustChange)location.href="login.html?change=1";return j.user});
  // ---- db: local cache of all docs, kept fresh by polling /api/db/sync
  const cache=new Map();let rev=0,ready=null,timer=null;const L=new Set();
  const snapDoc=p=>{const d=cache.get(p);return {id:p.split("/")[1],exists:!!d,data:()=>d?JSON.parse(JSON.stringify(d)):undefined}};
  const snapCol=c=>({docs:[...cache.keys()].filter(p=>p.split("/")[0]===c).map(p=>({id:p.split("/")[1],data:()=>JSON.parse(JSON.stringify(cache.get(p)))}))});
  async function sync(){
    try{const j=await api("api/db/sync?since="+rev);const changed=new Set();
      for(const [p,d] of j.docs){if(d)cache.set(p,d);else cache.delete(p);changed.add(p)}rev=j.rev;
      if(changed.size)for(const l of L)if([...changed].some(l.match)){try{l.fire()}catch(e){console.error(e)}}
    }catch(e){if(e.message!=="login")console.warn("sync",e)}
  }
  function loop(){clearTimeout(timer);timer=setTimeout(async()=>{await sync();loop()},document.hidden?60000:8000)}
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){sync();loop()}});
  const start=()=>ready||(ready=sync().then(loop));
  function listen(match,fire,first){const l={match,fire};L.add(l);start().then(()=>first());return ()=>L.delete(l)}
  const write=async(url,body)=>{await api(url,body);await sync()};
  const db={
    doc(p){return {
      get:async()=>{await start();return snapDoc(p)},
      set:async(data)=>write("api/db/set",{path:p,data}),
      delete:async()=>write("api/db/delete",{path:p}),
      onSnapshot(ok){const f=()=>ok(snapDoc(p));return listen(x=>x===p,f,f)}
    }},
    collection(c){return {
      get:async()=>{await start();return snapCol(c)},
      doc:id=>db.doc(c+"/"+id),
      onSnapshot(ok){const f=()=>ok(snapCol(c));return listen(x=>x.split("/")[0]===c,f,f)}
    }}
  };
  const user={id:async()=>(await meP).id,isOwner:async()=>!!(await meP).admin,
    profiles:async ids=>{const j=await api("api/people");const o={};ids.forEach(i=>{if(j.people[i])o[i]=j.people[i]});return o}};
  const downloads={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]);const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=filename||"file";document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},4000);return true}};

  // ---- install as an app (Android / Mac / Windows via Chrome or Edge; iPhone & Mac Safari via Share menu)
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
  let _bip=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();_bip=e;const a=document.querySelector("#acctbar #inst");if(a)a.hidden=false});
  window.claude={use:async k=>k==="db"?db:k==="user"?user:k==="downloads"?downloads:null};
  // ---- account bar (bottom corner): name, change password, accounts (admin), logout
  meP.then(u=>{const b=document.createElement("div");b.id="acctbar";
    b.innerHTML=`<span>👤 ${u.name.replace(/[<>&]/g,"")}</span><a href="login.html?change=1">🔑 كلمة المرور</a>${u.admin?'<a href="admin.html">👥 الحسابات</a>':""}<a href="#" id="inst" hidden>📲 تثبيت التطبيق</a><a href="#" id="lo">⎋ خروج</a>`;
    const st=document.createElement("style");st.textContent="#acctbar{position:fixed;bottom:8px;left:8px;z-index:50;background:#fff;border:1px solid #ddd;border-radius:10px;padding:5px 10px;font:12px system-ui,Tahoma;display:flex;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,.08);direction:rtl}#acctbar a{color:#1F4E79;text-decoration:none}@media print{#acctbar{display:none}}";
    document.head.append(st);document.body.append(b);const ib=b.querySelector("#inst");ib.hidden=!_bip;ib.onclick=async e=>{e.preventDefault();if(_bip){_bip.prompt();await _bip.userChoice.catch(()=>{});_bip=null;ib.hidden=true}};b.querySelector("#lo").onclick=async e=>{e.preventDefault();await api("api/logout",{}).catch(()=>{});window.US_TOK(null);location.href="login.html"}}).catch(()=>{});
})();
