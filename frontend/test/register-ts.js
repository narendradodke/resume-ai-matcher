const ts = require("typescript");
const fs = require("fs");
const Module = require("module");

const originalCompile = Module.prototype._compile;
Module.prototype._compile = function (content, filename) {
  if (filename.endsWith(".ts") && !filename.includes("node_modules")) {
    const transpiled = ts.transpileModule(content, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    return originalCompile.call(this, transpiled, filename);
  }
  return originalCompile.call(this, content, filename);
};

require.extensions[".ts"] = function (module, filename) {
  const content = fs.readFileSync(filename, "utf8");
  module._compile(content, filename);
};
