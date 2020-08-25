"use strict";
const crypto = require("crypto");

class webpack_modulename {
  constructor(options) { }

  apply(compiler) {
    compiler.plugin("compilation", compilation => {
      // module-ids
      compilation.plugin("module-ids", modules => {
        modules.forEach(module => {
          if (/*module.id === null &&*/ module.libIdent) {
            var modulePath = module.libIdent({
              context: compiler.options.context
            });
            if (modulePath) {
              modulePath = modulePath.replace(/[\\\/]/gi, "/");
              modulePath = modulePath.replace(
                process.cwd().replace(/[\\\/]/gi, "/"),
                ""
              );
            }
            if (
              modulePath &&
              /^(\.*\/src\/)/.test(modulePath) &&
              /\s+/.test(modulePath) == false
            ) {
              //只处理源码目录下的文件
              modulePath = modulePath.replace(/[\.\\\/]/gi, "_");
              module.id = modulePath;
            }
            //if(modulePath.indexOf("src/components/") > -1){
            //    modulePath = modulePath.replace(/[\.\\\/]/gi,'_');
            //    if(/^[_]*src_components/i.test(modulePath)){
            //        module.id = modulePath;
            //    }
            //}
          }
        });
      });

      compilation.plugin("before-chunk-ids", chunks => {
        chunks.forEach(chunk => {
          if (chunk.id === null) {
            if (chunk.name) {
              chunk.id = chunk.name;
            } else {
              let paths = "";
              chunk.forEachModule(m => {
                //不同版本的webpack, m.resource m.rawRequest m.fileDependencies
                //有些存在，有些不存在，要注意做兼容处理
                //let file = m.resource || m.rawRequest;
                //if(!file && m.fileDependencies) file = m.fileDependencies[0]
                let files = [m.resource, m.rawRequest];
                if (m.fileDependencies) files.push(...m.fileDependencies);
                let file = files.join(",");
                if (file) {
                  file = file.replace(/[\\\/]/gi, "/");
                  file = file.replace(
                    process.cwd().replace(/[\\\/]/gi, "/"),
                    ""
                  );
                  file = file.replace(/[\.\\\/]/gi, "_");
                  file = file.replace(/^[_]*src[_]*/gi, "");
                  file = file.replace(/[_]*vue$/gi, "");
                  paths += file;
                }
              });
              if (paths) {
                let hash = crypto
                  .createHash("md5")
                  .update(paths)
                  .digest("hex");
                hash = hash.substr(0, 8);
                chunk.id = hash;
              }
            }
          }
        });
      });
    });
  }
}

module.exports = webpack_modulename;
