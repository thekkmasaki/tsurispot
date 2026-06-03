import fs from "node:fs";
const F = process.argv[2];
const lines = fs.readFileSync(F, "utf8").trim().split("\n");
console.log("行数:", lines.length);
for (const l of lines) {
  try {
    const o = JSON.parse(l);
    const t = o.type || o.role || "?";
    let s = "";
    if (o.type === "assistant" && o.message?.content) {
      s = o.message.content.map((c) => c.type === "text" ? "text:" + c.text.slice(0, 150) : c.type === "tool_use" ? "tool:" + c.name : c.type).join(" | ");
    } else if (o.type === "user" && o.message?.content) {
      const c = o.message.content;
      s = (typeof c === "string" ? c : c.map((x) => x.type === "tool_result" ? "tool_result:" + (typeof x.content === "string" ? x.content.slice(0, 120) : JSON.stringify(x.content).slice(0, 120)) : x.type).join(" | ")).slice(0, 200);
    } else if (o.type === "result" || o.error) {
      s = JSON.stringify(o).slice(0, 200);
    }
    console.log("-", t, "::", s);
  } catch (e) { /* skip */ }
}
