// CJS wrapper — require(esm) supported in Node 22+
const mod = require("./plugin.js");
module.exports = mod.default;
module.exports.default = mod.default;
module.exports.postcss = true;
