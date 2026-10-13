const fs = require('fs');
const html = fs.readFileSync('ai-tools.html', 'utf8');
const regex = /<div class="ai-card-logo" style="([^"]*)">\s*<img src="([^"]*)" alt="([^"]*)">\s*<\/div>\s*<div class="ai-card-title-group">\s*<h3 class="ai-card-tool-name">([^<]*)<\/h3>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(JSON.stringify({ tool: m[4], style: m[1], img: m[2], alt: m[3] }));
}
