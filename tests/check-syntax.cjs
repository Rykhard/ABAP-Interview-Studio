const fs = require('node:fs');
const {spawnSync} = require('node:child_process');
const vm = require('node:vm');

const sources = ['scripts', 'server', 'functions/api'].flatMap(directory =>
  fs.readdirSync(directory).filter(name => /\.m?js$/.test(name)).map(name => `${directory}/${name}`));
for (const source of sources) {
  const result = spawnSync(process.execPath, ['--check', source], {stdio: 'inherit'});
  if (result.status !== 0) process.exit(1);
}
// Check both compiled locale branches, including source-expression translations.
const html = fs.readFileSync('START_HERE.html', 'utf8');
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (!match[1].includes('application/json')) new vm.Script(match[2]);
}
console.log('Source and generated JavaScript syntax passed.');
