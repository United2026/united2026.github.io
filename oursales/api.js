/* GitHub Pages front end: send app API and data requests to the server with the session token. */
(function(){
  if(location.hostname==="united2026.github.io"){location.replace("https://oursales-sak2.onrender.com/"+location.pathname.replace(/^\/oursales\//,"")+location.search);return}
  var API="https://united-requests.onrender.com/oursales/";
  window.US_TOK=function(t){try{if(t===null)localStorage.removeItem("us_tok");else if(t)localStorage.setItem("us_tok",t);return localStorage.getItem("us_tok")||""}catch(e){return ""}};
  var f=window.fetch.bind(window);
  window.fetch=function(u,o){
    if(typeof u==="string"&&(/^api\//.test(u)||/^(data|stmt|prod|elec)\.json/.test(u))){
      o=Object.assign({},o||{});o.headers=Object.assign({},o.headers||{},{"X-Session":window.US_TOK()});delete o.credentials;
      return f(API+u,o);
    }
    return f(u,o);
  };
})();
