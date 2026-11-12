/* GitHub Pages front end: send app API and data requests to the server with the session token. */
(function(){
  if(location.hostname==="united2026.github.io"){location.replace("https://oursales-sak2.onrender.com/"+location.pathname.replace(/^\/oursales\//,"")+location.search);return}
  var API="https://united-requests.onrender.com/oursales/";
  window.US_TOK=function(t){try{if(t===null)localStorage.removeItem("us_tok");else if(t)localStorage.setItem("us_tok",t);return localStorage.getItem("us_tok")||""}catch(e){return ""}};
  function maint(){
    if(document.getElementById("us-maint"))return;
    var go=function(){
      var d=document.createElement("div");d.id="us-maint";
      d.setAttribute("style","position:fixed;inset:0;z-index:9999;background:#F3F6FA;display:grid;place-items:center;font-family:system-ui,Tahoma,sans-serif;direction:rtl;text-align:center;padding:20px");
      d.innerHTML='<div style="background:#fff;border-radius:16px;padding:30px 26px;box-shadow:0 6px 24px rgba(0,0,0,.08);max-width:360px"><img src="img/logo.png" alt="" style="height:56px"><h2 style="color:#1F4E79;margin:18px 0 8px">الموقع تحت الصيانة</h2><p style="color:#555;margin:0 0 6px">يرجى المحاولة لاحقاً.</p><p style="color:#888;font-size:13px;margin:0">أوقات العمل: من الأحد إلى الخميس، 7 الصبح إلى 5 العصر</p></div>';
      document.body.appendChild(d);
    };
    if(document.body)go();else document.addEventListener("DOMContentLoaded",go);
  }
  var f=window.fetch.bind(window);
  window.fetch=function(u,o){
    if(typeof u==="string"&&(/^api\//.test(u)||/^(data|stmt|prod|elec)\.json/.test(u))){
      o=Object.assign({},o||{});o.headers=Object.assign({},o.headers||{},{"X-Session":window.US_TOK()});delete o.credentials;
      return f(API+u,o).then(function(r){if(r.status===423)maint();return r});
    }
    return f(u,o);
  };
})();
