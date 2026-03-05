import { writeFileSync, readFileSync } from "fs";
import https from "https";

const API_KEY = readFileSync(".env.local", "utf8")
  .split("\n")
  .find((l) => l.startsWith("MICROCMS_API_KEY="))
  ?.split("=")[1]
  ?.trim();

const content = `<p style="font-size:1.15em;line-height:1.8;color:#334155">\u300c\u5824\u9632\u304b\u3089<strong>\u30ab\u30f3\u30d1\u30c120kg\u8d85</strong>\u300d\u2014\u2014\u305d\u3093\u306a\u5922\u306e\u3088\u3046\u306a\u91e3\u308a\u304c\u73fe\u5b9f\u306b\u306a\u308b\u5834\u6240\u304c\u3001\u6771\u4eac\u90fd\u306b\u3042\u308a\u307e\u3059\u3002<br/><strong>\u516b\u4e08\u5cf6</strong>\u306f\u3001\u7fbd\u7530\u7a7a\u6e2f\u304b\u3089\u308f\u305a\u304b<strong>55\u5206</strong>\u3002\u9ed2\u6f6e\u306e\u3069\u771f\u3093\u4e2d\u306b\u6d6e\u304b\u3076\u3053\u306e\u5cf6\u306f\u3001\u672c\u571f\u3067\u306f\u8003\u3048\u3089\u308c\u306a\u3044\u30b5\u30a4\u30ba\u306e\u9b5a\u304c\u5824\u9632\u304b\u3089\u72d9\u3048\u308b\u300c\u91e3\u308a\u4eba\u306e\u8056\u5730\u300d\u3067\u3059\u3002</p>

<div style="margin:2em 0;padding:1.2em;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:12px">
<p style="font-weight:700;color:#1e40af;margin:0 0 0.5em;font-size:1em">\u3053\u306e\u8a18\u4e8b\u3067\u308f\u304b\u308b\u3053\u3068</p>
<ul style="margin:0;padding:0 0 0 1.2em;font-size:0.9em;color:#1e3a5f;line-height:2">
<li>\u516b\u4e08\u5cf6\u3067\u72d9\u3048\u308b\u5927\u7269\u30bf\u30fc\u30b2\u30c3\u30c8\u4e00\u89a7</li>
<li>\u4e3b\u8981\u91e3\u308a\u30b9\u30dd\u30c3\u30c85\u9078</li>
<li>\u90fd\u5185\u304b\u3089\u306e\u30a2\u30af\u30bb\u30b9\u65b9\u6cd5\u3068\u8cbb\u7528</li>
<li>\u304a\u3059\u3059\u3081\u306e\u91e3\u308a\u65b9\u30fb\u30bf\u30c3\u30af\u30eb</li>
<li>\u30b7\u30fc\u30ba\u30f3\u30ab\u30ec\u30f3\u30c0\u30fc</li>
<li>\u91e3\u308a\u4eba\u306b\u304a\u3059\u3059\u3081\u306e\u5bbf\u6cca\u65bd\u8a2d</li>
</ul>
</div>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u516b\u4e08\u5cf6\u3067\u91e3\u308c\u308b\u9b5a \u2014 \u672c\u571f\u3068\u306f\u5225\u6b21\u5143</h2>

<p>\u516b\u4e08\u5cf6\u306f\u9ed2\u6f6e\u306e\u672c\u6d41\u304c\u76f4\u6483\u3059\u308b\u7d76\u597d\u306e\u30ed\u30b1\u30fc\u30b7\u30e7\u30f3\u3002\u672c\u571f\u306e\u5824\u9632\u3067\u306f\u8003\u3048\u3089\u308c\u306a\u3044\u30b5\u30a4\u30ba\u30fb\u9b5a\u7a2e\u304c\u65e5\u5e38\u7684\u306b\u91e3\u308c\u307e\u3059\u3002</p>

<div style="overflow-x:auto;margin:1.5em 0">
<table style="width:100%;border-collapse:collapse;font-size:0.9em;min-width:500px">
<thead><tr style="background:#0c4a6e;color:#fff"><th style="padding:0.6em 0.8em;text-align:left">\u9b5a\u7a2e</th><th style="padding:0.6em 0.8em;text-align:left">\u6700\u5927\u30af\u30e9\u30b9</th><th style="padding:0.6em 0.8em;text-align:left">\u91e3\u308a\u65b9</th><th style="padding:0.6em 0.8em;text-align:center">\u5824\u9632\u304b\u3089</th></tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600">\u30ab\u30f3\u30d1\u30c1</td><td style="padding:0.6em 0.8em">20kg\u8d85</td><td style="padding:0.6em 0.8em">\u6cf3\u304c\u305b\u30fb\u30b7\u30e7\u30a2\u30b8\u30ae</td><td style="padding:0.6em 0.8em;text-align:center">\u2b55</td></tr>
<tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:0.6em 0.8em;font-weight:600">\u30d2\u30e9\u30de\u30b5</td><td style="padding:0.6em 0.8em">20kg\u8d85</td><td style="padding:0.6em 0.8em">\u6cf3\u304c\u305b\u30fb\u30b7\u30e7\u30a2\u30b8\u30ae</td><td style="padding:0.6em 0.8em;text-align:center">\u2b55</td></tr>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600">\u30b7\u30de\u30a2\u30b8</td><td style="padding:0.6em 0.8em">5kg\u8d85</td><td style="padding:0.6em 0.8em">\u30ab\u30b4\u91e3\u308a\u30fb\u6cf3\u304c\u305b</td><td style="padding:0.6em 0.8em;text-align:center">\u2b55</td></tr>
<tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:0.6em 0.8em;font-weight:600">\u30af\u30a8\uff08\u30e2\u30ed\u30b3\uff09</td><td style="padding:0.6em 0.8em">50kg\u7d1a</td><td style="padding:0.6em 0.8em">\u30d6\u30c3\u30b3\u30df\u30fb\u6cf3\u304c\u305b</td><td style="padding:0.6em 0.8em;text-align:center">\u2b55</td></tr>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600">\u30ad\u30cf\u30c0\u30de\u30b0\u30ed</td><td style="padding:0.6em 0.8em">30kg\u8d85</td><td style="padding:0.6em 0.8em">\u8239\u91e3\u308a\uff08\u30d1\u30e4\u30aa\uff09</td><td style="padding:0.6em 0.8em;text-align:center">\u2014</td></tr>
<tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:0.6em 0.8em;font-weight:600">\u30a4\u30b7\u30c0\u30a4</td><td style="padding:0.6em 0.8em">5kg\u8d85</td><td style="padding:0.6em 0.8em">\u30d6\u30c3\u30b3\u30df</td><td style="padding:0.6em 0.8em;text-align:center">\u2b55</td></tr>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600">\u30e1\u30b8\u30ca\uff08\u5c3e\u9577\uff09</td><td style="padding:0.6em 0.8em">3kg\u8d85</td><td style="padding:0.6em 0.8em">\u30d5\u30ab\u30bb\u91e3\u308a</td><td style="padding:0.6em 0.8em;text-align:center">\u2b55</td></tr>
</tbody></table></div>

<p>\u7279\u306b\u6ce8\u76ee\u3059\u3079\u304d\u306f<strong>\u30ab\u30f3\u30d1\u30c1</strong>\u3002\u672c\u571f\u3067\u306f\u8239\u3067\u30aa\u30d5\u30b7\u30e7\u30a2\u30b8\u30ae\u30f3\u30b0\u3057\u306a\u3044\u3068\u51fa\u4f1a\u3048\u306a\u3044\u30b5\u30a4\u30ba\u304c\u3001\u516b\u4e08\u5cf6\u3067\u306f\u5824\u9632\u304b\u3089\u306e\u30e0\u30ed\u30a2\u30b8\u6cf3\u304c\u305b\u3067\u73fe\u5b9f\u7684\u306b\u72d9\u3048\u307e\u3059\u3002</p>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u90fd\u5185\u304b\u3089\u306e\u30a2\u30af\u30bb\u30b9 \u2014 \u610f\u5916\u3068\u8fd1\u3044\uff01</h2>

<p>\u516b\u4e08\u5cf6\u306f\u300c\u96e2\u5cf6\u300d\u306e\u30a4\u30e1\u30fc\u30b8\u304b\u3089\u9060\u3044\u5b58\u5728\u306b\u611f\u3058\u308b\u304b\u3082\u3057\u308c\u307e\u305b\u3093\u304c\u3001\u5b9f\u306f<strong>\u90fd\u5185\u304b\u3089\u9a5a\u304f\u307b\u3069\u8fd1\u3044</strong>\u3067\u3059\u3002</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1em;margin:1.5em 0">
<div style="padding:1.2em;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px">
<p style="font-weight:700;color:#166534;margin:0 0 0.3em;font-size:1.05em">\u2708\ufe0f \u98db\u884c\u6a5f\uff08ANA\uff09</p>
<p style="margin:0;font-size:0.9em;color:#15803d"><strong>\u7fbd\u7530\u2192\u516b\u4e08\u5cf6\uff1a\u7d0455\u5206</strong><br/>1\u65e53\u5f80\u5fa9\uff0f\u7247\u905315,170\u5186\uff5e<br/>\u671d\u4e00\u4fbf\u306a\u3089\u5348\u524d\u4e2d\u304b\u3089\u91e3\u308a\u53ef\u80fd\uff01</p>
</div>
<div style="padding:1.2em;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px">
<p style="font-weight:700;color:#1e40af;margin:0 0 0.3em;font-size:1.05em">\ud83d\udea2 \u30d5\u30a7\u30ea\u30fc\uff08\u6771\u6d77\u6c7d\u8239\uff09</p>
<p style="margin:0;font-size:0.9em;color:#1e3a5f"><strong>\u7af9\u829d\u2192\u516b\u4e08\u5cf6\uff1a\u7d0411\u6642\u9593</strong><br/>\u591c\u51fa\u767a\u30fb\u7fcc\u671d\u7740\uff0f2\u7b49 \u7d049,000\u5186\uff5e<br/>\u5927\u8377\u7269OK\uff01\u30bf\u30c3\u30af\u30eb\u6e80\u8f09\u3067\u3082\u5b89\u5fc3</p>
</div>
</div>

<p>\u91e3\u308a\u4eba\u306b\u306f<strong>\u8239\u304c\u304a\u3059\u3059\u3081</strong>\u3002\u30ed\u30c3\u30c9\u30b1\u30fc\u30b9\u3084\u30af\u30fc\u30e9\u30fc\u30dc\u30c3\u30af\u30b9\u306a\u3069\u5927\u578b\u306e\u8377\u7269\u3092\u6c17\u517c\u306d\u306a\u304f\u6301\u3061\u8fbc\u3081\u307e\u3059\u3002</p>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u4e3b\u8981\u91e3\u308a\u30b9\u30dd\u30c3\u30c85\u9078</h2>

<h3>1. \u795e\u6e4a\u6f01\u6e2f\uff08\u30b0\u30f3\u30ab\u30f3\u5824\u9632\uff09</h3>
<p>\u6c88\u3093\u3060\u8ecd\u8266\u3092\u57fa\u790e\u306b\u3057\u3066\u9020\u3089\u308c\u305f\u5824\u9632\u3002<strong>\u30ab\u30f3\u30d1\u30c1\u30fb\u30d2\u30e9\u30de\u30b5\u306e20kg\u8d85\u306e\u5b9f\u7e3e</strong>\u3042\u308a\u3002\u7a7a\u6e2f\u304b\u3089\u8eca\u3067\u7d045\u5206\u3002</p>
<ul><li><strong>\u72d9\u3048\u308b\u9b5a</strong>\uff1a\u30ab\u30f3\u30d1\u30c1\u3001\u30d2\u30e9\u30de\u30b5\u3001\u30de\u30c0\u30a4\u3001\u30b7\u30de\u30a2\u30b8</li><li><strong>\u304a\u3059\u3059\u3081</strong>\uff1a\u6cf3\u304c\u305b\u91e3\u308a\u3001\u30b5\u30d3\u30ad</li><li><strong>\u30ec\u30d9\u30eb</strong>\uff1a\u521d\u5fc3\u8005\u301c\u4e2d\u7d1a\u8005</li></ul>

<h3>2. \u516b\u91cd\u6839\u6e2f</h3>
<p>\u6f6e\u901a\u3057\u304c\u826f\u304f<strong>\u30ab\u30f3\u30d1\u30c1\u306e\u56de\u904a\u304c\u591a\u3044</strong>\u3002\u8db3\u5834\u304c\u826f\u304f\u521d\u5fc3\u8005\u3067\u3082\u5927\u7269\u306b\u6311\u6226\u3057\u3084\u3059\u3044\u3002</p>
<ul><li><strong>\u72d9\u3048\u308b\u9b5a</strong>\uff1a\u30ab\u30f3\u30d1\u30c1\u3001\u30d2\u30e9\u30de\u30b5\u3001\u30e0\u30ed\u30a2\u30b8</li><li><strong>\u304a\u3059\u3059\u3081</strong>\uff1a\u6cf3\u304c\u305b\u91e3\u308a\u3001\u30b7\u30e7\u30a2\u30b8\u30ae\u30f3\u30b0</li></ul>

<h3>3. \u85cd\u30f6\u6c5f\u6e2f</h3>
<p>\u7384\u6b66\u5ca9\u306e\u7f8e\u3057\u3044\u5730\u5c64\u304c\u898b\u3048\u308b\u6e2f\u3002\u8fd1\u304f\u306b\u8db3\u6e6f\u300c\u304d\u3089\u3081\u304d\u300d\u3082\u3002</p>
<ul><li><strong>\u72d9\u3048\u308b\u9b5a</strong>\uff1a\u30ab\u30c4\u30aa\u3001\u30d2\u30e9\u30de\u30b5\u3001\u30ab\u30f3\u30d1\u30c1\u3001\u30b7\u30de\u30a2\u30b8</li></ul>

<h3>4. \u5e95\u571f\u6e2f</h3>
<p>\u30d5\u30a7\u30ea\u30fc\u767a\u7740\u6e2f\u3002\u5824\u9632\u304c\u5e83\u304f<strong>\u30d5\u30a1\u30df\u30ea\u30fc\u306b\u3082\u6700\u9069</strong>\u3002</p>
<ul><li><strong>\u72d9\u3048\u308b\u9b5a</strong>\uff1a\u30e0\u30ed\u30a2\u30b8\u3001\u30e1\u30b8\u30ca\u3001\u30ab\u30f3\u30d1\u30c1\uff08\u56de\u904a\u6642\uff09</li></ul>

<h3>5. \u30ca\u30ba\u30de\u30c9</h3>
<p>\u8eca\u3067\u30a2\u30af\u30bb\u30b9\u3067\u304d\u308b\u78ef\u30dd\u30a4\u30f3\u30c8\u3002\u30b7\u30e7\u30a2\u30b8\u30ae\u30f3\u30b0\u3067\u30b7\u30e7\u30b4\u304c\u72d9\u3048\u308b\u3002</p>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#fefce8;border:1px solid #fde68a;border-radius:12px">
<p style="font-weight:700;color:#92400e;margin:0 0 0.3em;font-size:0.9em">\u98a8\u5411\u304d\u3067\u4f7f\u3044\u5206\u3051\u308b\u306e\u304c\u30b3\u30c4</p>
<p style="font-size:0.85em;color:#78350f;margin:0">\u30b0\u30f3\u30ab\u30f3\u5824\u9632\u30fb\u5e95\u571f\u6e2f\u30fb\u516b\u91cd\u6839\u6e2f\u306e3\u7b87\u6240\u3092\u62bc\u3055\u3048\u3066\u304a\u3051\u3070\u3001\u3069\u306e\u98a8\u5411\u304d\u3067\u3082\u7aff\u304c\u51fa\u305b\u307e\u3059\u3002</p>
</div>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u304a\u3059\u3059\u3081\u306e\u91e3\u308a\u65b9\u3068\u30bf\u30c3\u30af\u30eb</h2>

<h3>\u6cf3\u304c\u305b\u91e3\u308a\uff08\u5824\u9632\u304b\u3089\u306e\u5927\u7269\u72d9\u3044\uff09</h3>
<p>\u30b5\u30d3\u30ad\u3067\u30e0\u30ed\u30a2\u30b8\u3092\u78ba\u4fdd\u2192\u30a8\u30b5\u306b\u30ab\u30f3\u30d1\u30c1\u30fb\u30d2\u30e9\u30de\u30b5\u30fb\u30af\u30a8\u3092\u72d9\u3046\u3002<strong>20kg\u8d85\u304c\u639b\u304b\u308b\u53ef\u80fd\u6027\u3042\u308a</strong>\u3002</p>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#0369a1">\u6cf3\u304c\u305b\u30fb\u5927\u7269\u7528\u30ed\u30c3\u30c9</span>
<a href="https://amzn.to/4s4i64m" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#0c4a6e;text-decoration:none;font-size:0.95em">\u30b7\u30de\u30ce \u30ed\u30c3\u30c9 \u2192</a>
<span style="font-size:0.82em;color:#475569">\u5927\u7269\u3068\u306e\u30d5\u30a1\u30a4\u30c8\u306b\u8010\u3048\u308b\u4fe1\u983c\u306e\u30b7\u30de\u30ce\u88fd\u3002</span>
</div>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#0369a1">\u5927\u7269\u5bfe\u5fdc\u30ea\u30fc\u30eb</span>
<a href="https://amzn.to/4atW7Om" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#0c4a6e;text-decoration:none;font-size:0.95em">\u30b7\u30de\u30ce \u30ea\u30fc\u30eb \u2192</a>
<span style="font-size:0.82em;color:#475569">\u6ed1\u3089\u304b\u306a\u30c9\u30e9\u30b0\u6027\u80fd\u3067\u5927\u578b\u30ab\u30f3\u30d1\u30c1\u3068\u306e\u3084\u308a\u53d6\u308a\u3082\u5b89\u5fc3\u3002</span>
</div>

<h3>\u30b7\u30e7\u30a2\u30b8\u30ae\u30f3\u30b0</h3>
<p>\u30a8\u30b5\u4e0d\u8981\u3067\u624b\u8efd\u3002\u671d\u30de\u30c5\u30e1\u30fb\u5915\u30de\u30c5\u30e1\u304c\u52dd\u8ca0\u6642\u3002</p>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#0369a1">\u30b7\u30e7\u30a2\u30b8\u30ae\u7528PE\u30e9\u30a4\u30f3</span>
<a href="https://amzn.to/4s45H0i" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#0c4a6e;text-decoration:none;font-size:0.95em">\u6771\u30ec PE\u30e9\u30a4\u30f3 \u2192</a>
<span style="font-size:0.82em;color:#475569">\u611f\u5ea6\u3068\u5f37\u5ea6\u306b\u512a\u308c\u305f\u65e5\u672c\u88fdPE\u30e9\u30a4\u30f3\u3002</span>
</div>

<h3>\u78ef\u30d5\u30ab\u30bb\u91e3\u308a</h3>
<p>\u5c3e\u9577\u30e1\u30b8\u30ca\u3084\u30a4\u30b7\u30c0\u30a4\u3092\u72d9\u3046\u306a\u3089\u78ef\u30d5\u30ab\u30bb\u3002</p>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#0369a1">\u30d5\u30ab\u30bb\u91e3\u308a\u306e\u30cf\u30ea\u30b9</span>
<a href="https://amzn.to/408jI1f" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#0c4a6e;text-decoration:none;font-size:0.95em">\u30d5\u30ed\u30ed\u30ab\u30fc\u30dc\u30f3 \u30cf\u30ea\u30b9 \u2192</a>
<span style="font-size:0.82em;color:#475569">\u6839\u30ba\u30ec\u306b\u5f37\u3044\u30d5\u30ed\u30ed\u30ab\u30fc\u30dc\u30f3\u3002</span>
</div>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u30b7\u30fc\u30ba\u30f3\u30ab\u30ec\u30f3\u30c0\u30fc</h2>

<div style="overflow-x:auto;margin:1.5em 0">
<table style="width:100%;border-collapse:collapse;font-size:0.9em;min-width:500px">
<thead><tr style="background:#0c4a6e;color:#fff"><th style="padding:0.6em 0.8em;text-align:left">\u6642\u671f</th><th style="padding:0.6em 0.8em;text-align:left">\u4e3b\u306a\u5bfe\u8c61\u9b5a</th><th style="padding:0.6em 0.8em;text-align:left">\u5099\u8003</th></tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600">\u6625\uff083\u301c5\u6708\uff09</td><td style="padding:0.6em 0.8em">\u30ab\u30f3\u30d1\u30c1\u3001\u30d2\u30e9\u30de\u30b5\u3001\u30e1\u30b8\u30ca</td><td style="padding:0.6em 0.8em">\u5927\u7269\u30b7\u30fc\u30ba\u30f3\u958b\u5e55</td></tr>
<tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:0.6em 0.8em;font-weight:600">\u590f\uff086\u301c8\u6708\uff09</td><td style="padding:0.6em 0.8em">\u30ad\u30cf\u30c0\u30de\u30b0\u30ed\u3001\u30ab\u30f3\u30d1\u30c1\u3001\u30ab\u30c4\u30aa</td><td style="padding:0.6em 0.8em">\u8239\u91e3\u308a\u6700\u76db\u671f</td></tr>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600">\u79cb\uff089\u301c11\u6708\uff09</td><td style="padding:0.6em 0.8em">\u30ab\u30f3\u30d1\u30c1\u3001\u30d2\u30e9\u30de\u30b5\u3001\u30a2\u30aa\u30ea\u30a4\u30ab</td><td style="padding:0.6em 0.8em"><strong>\u5e74\u9593\u30d9\u30b9\u30c8\u30b7\u30fc\u30ba\u30f3</strong></td></tr>
<tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:0.6em 0.8em;font-weight:600">\u51ac\uff0812\u301c2\u6708\uff09</td><td style="padding:0.6em 0.8em">\u30b7\u30de\u30a2\u30b8\u3001\u30e1\u30b8\u30ca\u3001\u30a4\u30b7\u30c0\u30a4</td><td style="padding:0.6em 0.8em">\u30b7\u30de\u30a2\u30b8\u306e\u30cf\u30a4\u30b7\u30fc\u30ba\u30f3</td></tr>
</tbody></table></div>

<p><strong>\u5e74\u9593\u30d9\u30b9\u30c8\u306f\u79cb\uff089\u301c11\u6708\uff09</strong>\u3002\u51ac\u306e<strong>\u30b7\u30de\u30a2\u30b8</strong>\u3082\u516b\u4e08\u5cf6\u306a\u3089\u3067\u306f\u306e\u30bf\u30fc\u30b2\u30c3\u30c8\u3002</p>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u91e3\u308a\u4eba\u306b\u304a\u3059\u3059\u3081\u306e\u5bbf</h2>

<h3>\u7dcf\u5408\u91e3\u308a\u30bb\u30f3\u30bf\u30fc \u30a2\u30b5\u30ae\u30af</h3>
<p><strong>\u5bbf\u6cca\u30fb\u8239\u306e\u624b\u914d\u30fb\u91e3\u308a\u9053\u5177\u30ec\u30f3\u30bf\u30eb\u30fb\u91e3\u679c\u306e\u8abf\u7406</strong>\u307e\u3067\u5168\u3066\u30ef\u30f3\u30b9\u30c8\u30c3\u30d7\u3002\u521d\u3081\u3066\u306e\u516b\u4e08\u5cf6\u91e3\u884c\u3067\u3082\u5b89\u5fc3\u3002</p>
<ul><li>\u91e3\u308a\u9053\u5177\u30ec\u30f3\u30bf\u30eb\uff1a2,500\u5186\uff5e</li><li>\u4ed5\u7acb\u8239\u30fb\u4e57\u5408\u8239\u306e\u624b\u914dOK</li><li>\u91e3\u3063\u305f\u9b5a\u306e\u8abf\u7406\u30b5\u30fc\u30d3\u30b9\u3042\u308a</li></ul>

<h3>\u30ea\u30fc\u30c9\u30d1\u30fc\u30af\u30ea\u30be\u30fc\u30c8\u516b\u4e08\u5cf6</h3>
<p>\u516b\u4e08\u5bcc\u58eb\u5c71\u9e93\u306e\u30ea\u30be\u30fc\u30c8\u30db\u30c6\u30eb\u3002\u5c55\u671b\u9732\u5929\u98a8\u5442\u304c\u6700\u9ad8\u30021\u6cca6,600\u5186\uff5e\u3002</p>

<h3>\u516b\u4e08\u30d3\u30e5\u30fc\u30db\u30c6\u30eb</h3>
<p>\u7a7a\u6e2f\u304b\u3089\u8eca\u3067\u7d045\u5206\u3002\u697d\u5929\u30c8\u30e9\u30d9\u30eb\u53e3\u30b3\u30df\u8a55\u4fa14.30\u30021\u6cca9,000\u5186\uff5e\u3002</p>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#b91c1c">\u516b\u4e08\u5cf6\u306e\u5bbf\u3092\u63a2\u3059</span>
<a href="https://a.r10.to/hYK79g" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#991b1b;text-decoration:none;font-size:0.95em">\u697d\u5929\u30c8\u30e9\u30d9\u30eb\u3067\u516b\u4e08\u5cf6\u306e\u5bbf\u3092\u898b\u308b \u2192</a>
<span style="font-size:0.82em;color:#475569">\u79cb\u306e\u30d9\u30b9\u30c8\u30b7\u30fc\u30ba\u30f3\u306f\u65e9\u3081\u306e\u4e88\u7d04\u304c\u304a\u3059\u3059\u3081\u3002</span>
</div>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u6301\u3061\u7269\u30c1\u30a7\u30c3\u30af\u30ea\u30b9\u30c8</h2>

<div style="margin:1.5em 0;padding:1.2em;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px">
<p style="font-weight:700;margin:0 0 0.8em;color:#1e293b">\u516b\u4e08\u5cf6\u91e3\u884c\u306e\u5fc5\u9700\u54c1</p>
<ul style="margin:0;padding:0 0 0 1.2em;font-size:0.9em;line-height:2;color:#334155">
<li>\u30ed\u30c3\u30c9\u30fb\u30ea\u30fc\u30eb\uff08\u5927\u7269\u5bfe\u5fdc\u3002\u30ec\u30f3\u30bf\u30eb\u3082\u53ef\uff09</li>
<li>PE\u30e9\u30a4\u30f3 3\u53f7\u4ee5\u4e0a</li>
<li>\u30b5\u30d3\u30ad\u4ed5\u639b\u3051\uff08\u30e0\u30ed\u30a2\u30b8\u78ba\u4fdd\u7528\uff09</li>
<li>\u30e9\u30a4\u30d5\u30b8\u30e3\u30b1\u30c3\u30c8\uff08\u78ef\u91e3\u308a\u5fc5\u9808\uff09</li>
<li>\u30b9\u30d1\u30a4\u30af\u30b7\u30e5\u30fc\u30ba\uff08\u78ef\u5834\u7528\uff09</li>
<li>\u30af\u30fc\u30e9\u30fc\u30dc\u30c3\u30af\u30b9\uff08\u5927\u578b\u63a8\u5968\uff09</li>
<li>\u65e5\u713c\u3051\u6b62\u3081\u30fb\u5e3d\u5b50\u30fb\u504f\u5149\u30b5\u30f3\u30b0\u30e9\u30b9</li>
<li>\u30e2\u30d0\u30a4\u30eb\u30d0\u30c3\u30c6\u30ea\u30fc</li>
</ul>
</div>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#0369a1">\u91e3\u884c\u306e\u5fc5\u9700\u54c1</span>
<a href="https://amzn.to/4s3kDvE" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#0c4a6e;text-decoration:none;font-size:0.95em">\u30e2\u30d0\u30a4\u30eb\u30d0\u30c3\u30c6\u30ea\u30fc \u2192</a>
<span style="font-size:0.82em;color:#475569">\u96e2\u5cf6\u3067\u306f\u5145\u96fb\u30b9\u30dd\u30c3\u30c8\u304c\u9650\u3089\u308c\u307e\u3059\u3002\u5927\u5bb9\u91cf\u304c\u3042\u308b\u3068\u5b89\u5fc3\u3002</span>
</div>

<div style="margin:1.5em 0;padding:1em 1.2em;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;flex-direction:column;gap:0.5em">
<span style="font-size:0.75em;font-weight:600;color:#0369a1">\u5927\u5bb9\u91cf\u3067\u6574\u7406\u3057\u3084\u3059\u3044</span>
<a href="https://amzn.to/4aOYPgo" target="_blank" rel="noopener noreferrer sponsored" style="font-weight:700;color:#0c4a6e;text-decoration:none;font-size:0.95em">\u30d5\u30a3\u30c3\u30b7\u30f3\u30b0\u30d0\u30c3\u30b0 40L \u2192</a>
<span style="font-size:0.82em;color:#475569">\u96e2\u5cf6\u91e3\u884c\u306f\u8377\u7269\u304c\u591a\u304f\u306a\u308a\u304c\u3061\u30022\u5c64\u69cb\u9020\u3067\u6574\u7406\u3057\u3084\u3059\u3044\u3002</span>
</div>

<hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/>

<h2>\u307e\u3068\u3081 \u2014 \u516b\u4e08\u5cf6\u306f\u300c\u4e00\u5ea6\u306f\u884c\u304f\u3079\u304d\u300d\u91e3\u308a\u306e\u8056\u5730</h2>

<ul>
<li><strong>\u90fd\u5185\u304b\u308955\u5206</strong>\u3067\u884c\u3051\u308b\u624b\u8efd\u3055</li>
<li><strong>\u5824\u9632\u304b\u3089\u30ab\u30f3\u30d1\u30c120kg\u8d85</strong>\u304c\u73fe\u5b9f\u7684\u306b\u72d9\u3048\u308b</li>
<li>\u30b7\u30de\u30a2\u30b8\u30fb\u30af\u30a8\u30fb\u30d2\u30e9\u30de\u30b5\u306a\u3069<strong>\u672c\u571f\u3067\u306f\u51fa\u4f1a\u3048\u306a\u3044\u5927\u7269</strong></li>
<li>\u98a8\u5411\u304d\u306b\u5408\u308f\u305b\u3066\u30dd\u30a4\u30f3\u30c8\u3092\u9078\u3079\u308b\u306e\u3067<strong>\u30dc\u30a6\u30ba\u306e\u30ea\u30b9\u30af\u304c\u4f4e\u3044</strong></li>
<li>\u91e3\u3063\u305f\u9b5a\u3092\u5bbf\u3067\u8abf\u7406\u3057\u3066\u3082\u3089\u3048\u308b<strong>\u6700\u9ad8\u306e\u8d05\u6ca2</strong></li>
</ul>

<p>\u300c\u5927\u7269\u3092\u91e3\u3063\u3066\u307f\u305f\u3044\u300d\u300c\u3044\u3064\u3082\u3068\u9055\u3046\u91e3\u308a\u304c\u3057\u305f\u3044\u300d\u2014\u2014\u305c\u3072\u4e00\u5ea6\u516b\u4e08\u5cf6\u3092\u8a2a\u308c\u3066\u307f\u3066\u304f\u3060\u3055\u3044\u3002</p>

<div style="margin:2em 0;padding:1.2em;background:linear-gradient(135deg,#fef2f2,#fff1f2);border:1px solid #fecaca;border-radius:12px;text-align:center">
<p style="font-weight:700;color:#991b1b;margin:0 0 0.5em;font-size:1.05em">\u516b\u4e08\u5cf6\u306e\u5bbf\u3092\u4e88\u7d04\u3059\u308b</p>
<p style="font-size:0.9em;color:#7f1d1d;margin:0 0 0.8em">\u79cb\u306e\u30d9\u30b9\u30c8\u30b7\u30fc\u30ba\u30f3\u306f\u65e9\u3081\u306e\u4e88\u7d04\u304c\u304a\u3059\u3059\u3081\u3067\u3059</p>
<a href="https://a.r10.to/hYK79g" target="_blank" rel="noopener noreferrer sponsored" style="display:inline-block;padding:0.7em 2em;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95em">\u697d\u5929\u30c8\u30e9\u30d9\u30eb\u3067\u516b\u4e08\u5cf6\u306e\u5bbf\u3092\u898b\u308b \u2192</a>
</div>

<div style="margin:2em 0;padding:1.2em;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #bbf7d0;border-radius:12px">
<p style="font-weight:700;color:#166534;margin:0 0 0.5em">\u3053\u306e\u8a18\u4e8b\u3092\u66f8\u3044\u305f\u4eba</p>
<p style="font-size:0.9em;color:#15803d;margin:0"><strong>\u6b63\u6728 \u5bb6\u5eb7</strong>\uff08\u30c4\u30ea\u30b9\u30dd\u7de8\u96c6\u9577\uff09</p>
<p style="font-size:0.85em;color:#4ade80;margin:0.3em 0 0">29\u6b73\u3001\u91e3\u308a\u6b742\u5e74\u76ee\u3002SNS\u30fb\u91e3\u679c\u30b5\u30a4\u30c8\u30fb\u516c\u5f0f\u60c5\u5831\u3092\u6bce\u65e5\u30c1\u30a7\u30c3\u30af\u3057\u3066\u3001\u91e3\u308a\u4eba\u306b\u5f79\u7acb\u3064\u6700\u65b0\u60c5\u5831\u3092\u304a\u5c4a\u3051\u3057\u3066\u3044\u307e\u3059\u3002</p>
</div>`;

const data = {
  title: "\u3010\u5b8c\u5168\u30ac\u30a4\u30c9\u3011\u516b\u4e08\u5cf6\u91e3\u308a\u7279\u96c6\uff5c\u90fd\u5185\u304b\u308955\u5206\u3067\u5927\u7269\u5929\u56fd\uff01\u5824\u9632\u304b\u3089\u30ab\u30f3\u30d1\u30c120kg\u8d85\u306e\u5922",
  slug: "hachijojima-fishing-guide",
  description: "\u516b\u4e08\u5cf6\u306f\u7fbd\u7530\u304b\u3089\u98db\u884c\u6a5f55\u5206\u3067\u884c\u3051\u308b\u5927\u7269\u91e3\u308a\u306e\u8056\u5730\u3002\u5824\u9632\u304b\u3089\u30ab\u30f3\u30d1\u30c1\u30fb\u30d2\u30e9\u30de\u30b520kg\u8d85\u3001\u30b7\u30de\u30a2\u30b8\u3001\u30af\u30a8\u3082\u72d9\u3048\u308b\u3002\u4e3b\u8981\u91e3\u308a\u30b9\u30dd\u30c3\u30c85\u9078\u30fb\u304a\u3059\u3059\u3081\u5bbf\u30fb\u30a2\u30af\u30bb\u30b9\u30fb\u30bf\u30c3\u30af\u30eb\u3092\u5b8c\u5168\u89e3\u8aac\u3002",
  tags: "\u516b\u4e08\u5cf6,\u6771\u4eac,\u96e2\u5cf6\u91e3\u308a,\u30ab\u30f3\u30d1\u30c1,\u30d2\u30e9\u30de\u30b5,\u30b7\u30de\u30a2\u30b8,\u30af\u30a8,\u30b7\u30e7\u30a2\u30b8\u30ae\u30f3\u30b0,\u6cf3\u304c\u305b\u91e3\u308a,\u5927\u7269\u91e3\u308a",
  content
};

const body = JSON.stringify(data);
const req = https.request({
  hostname: "tsurispot.microcms.io",
  path: "/api/v1/blogs",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-MICROCMS-API-KEY": API_KEY,
    "Content-Length": Buffer.byteLength(body)
  }
}, (res) => {
  let d = "";
  res.on("data", c => d += c);
  res.on("end", () => console.log(res.statusCode, d));
});
req.write(body);
req.end();
