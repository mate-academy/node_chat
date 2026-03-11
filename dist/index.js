var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports, module) {
    module.exports = {
      name: "dotenv",
      version: "17.3.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var path2 = __require("path");
    var os = __require("os");
    var crypto = __require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var TIPS = [
      "\u{1F510} encrypt with Dotenvx: https://dotenvx.com",
      "\u{1F510} prevent committing .env to code: https://dotenvx.com/precommit",
      "\u{1F510} prevent building .env in docker: https://dotenvx.com/prebuild",
      "\u{1F916} agentic secret storage: https://dotenvx.com/as2",
      "\u26A1\uFE0F secrets for agents: https://dotenvx.com/as2",
      "\u{1F6E1}\uFE0F auth for agents: https://vestauth.com",
      "\u{1F6E0}\uFE0F  run anywhere with `dotenvx run -- yourcommand`",
      "\u2699\uFE0F  specify custom .env file path with { path: '/custom/path/.env' }",
      "\u2699\uFE0F  enable debug logging with { debug: true }",
      "\u2699\uFE0F  override existing env vars with { override: true }",
      "\u2699\uFE0F  suppress all logs with { quiet: true }",
      "\u2699\uFE0F  write to custom object with { processEnv: myObject }",
      "\u2699\uFE0F  load multiple .env files with { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/dotenv/lib/env-options.js"(exports, module) {
    "use strict";
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module.exports = options;
  }
});

// node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/dotenv/lib/cli-options.js"(exports, module) {
    "use strict";
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// src/index.ts
import EventEmitter from "events";

// src/createServer.ts
import express from "express";

// src/routes/message.routes.ts
import { Router } from "express";

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => fn(req, res, next).catch(next);
};

// node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// src/db.ts
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.2",
  "engineVersion": "94a226be1cf2967af2541cca5529f0f7ba866919",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Message {\n  id        String   @id @default(dbgenerated("gen_random_uuid()"))\n  author    String\n  text      String\n  roomId    String?\n  createdAt DateTime @default(now())\n  room      Room?    @relation(fields: [roomId], references: [id])\n\n  @@map("messages")\n}\n\nmodel Room {\n  id        String    @id @default(dbgenerated("gen_random_uuid()"))\n  title     String\n  createdAt DateTime  @default(now())\n  messages  Message[]\n\n  @@map("rooms")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"author","kind":"scalar","type":"String"},{"name":"text","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"room","kind":"object","type":"Room","relationName":"MessageToRoom"}],"dbName":"messages"},"Room":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"messages","kind":"object","type":"Message","relationName":"MessageToRoom"}],"dbName":"rooms"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","messages","_count","room","Message.findUnique","Message.findUniqueOrThrow","Message.findFirst","Message.findFirstOrThrow","Message.findMany","data","Message.createOne","Message.createMany","Message.createManyAndReturn","Message.updateOne","Message.updateMany","Message.updateManyAndReturn","create","update","Message.upsertOne","Message.deleteOne","Message.deleteMany","having","_min","_max","Message.groupBy","Message.aggregate","Room.findUnique","Room.findUniqueOrThrow","Room.findFirst","Room.findFirstOrThrow","Room.findMany","Room.createOne","Room.createMany","Room.createManyAndReturn","Room.updateOne","Room.updateMany","Room.updateManyAndReturn","Room.upsertOne","Room.deleteOne","Room.deleteMany","Room.groupBy","Room.aggregate","AND","OR","NOT","id","title","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","author","text","roomId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany"]'),
  graph: "bRIgCQUAAEsAICwAAEkAMC0AAAUAEC4AAEkAMC8BAAAAATFAAEIAIUABAEEAIUEBAEEAIUIBAEoAIQEAAAABACAHAwAAQwAgLAAAQAAwLQAAAwAQLgAAQAAwLwEAQQAhMAEAQQAhMUAAQgAhAQAAAAMAIAkFAABLACAsAABJADAtAAAFABAuAABJADAvAQBBACExQABCACFAAQBBACFBAQBBACFCAQBKACECBQAAZwAgQgAAYAAgAwAAAAUAIAEAAAYAMAIAAAEAIAEAAAAFACABAAAAAQAgAwAAAAUAIAEAAAYAMAIAAAEAIAMAAAAFACABAAAGADACAAABACADAAAABQAgAQAABgAwAgAAAQAgBgUAAGYAIC8BAAAAATFAAAAAAUABAAAAAUEBAAAAAUIBAAAAAQELAAANACAFLwEAAAABMUAAAAABQAEAAAABQQEAAAABQgEAAAABAQsAAA8AMAELAAAPADABAAAAAwAgBgUAAGUAIC8BAE8AITFAAFAAIUABAE8AIUEBAE8AIUIBAGQAIQIAAAABACALAAATACAFLwEATwAhMUAAUAAhQAEATwAhQQEATwAhQgEAZAAhAgAAAAUAIAsAABUAIAIAAAAFACALAAAVACABAAAAAwAgAwAAAAEAIBIAAA0AIBMAABMAIAEAAAABACABAAAABQAgBAQAAGEAIBgAAGMAIBkAAGIAIEIAAGAAIAgsAABEADAtAAAdABAuAABEADAvAQA5ACExQAA6ACFAAQA5ACFBAQA5ACFCAQBFACEDAAAABQAgAQAAHAAwFwAAHQAgAwAAAAUAIAEAAAYAMAIAAAEAIAcDAABDACAsAABAADAtAAADABAuAABAADAvAQAAAAEwAQBBACExQABCACEBAAAAIAAgAQAAACAAIAEDAABfACADAAAAAwAgAQAAIwAwAgAAIAAgAwAAAAMAIAEAACMAMAIAACAAIAMAAAADACABAAAjADACAAAgACAEAwAAXgAgLwEAAAABMAEAAAABMUAAAAABAQsAACcAIAMvAQAAAAEwAQAAAAExQAAAAAEBCwAAKQAwAQsAACkAMAQDAABRACAvAQBPACEwAQBPACExQABQACECAAAAIAAgCwAALAAgAy8BAE8AITABAE8AITFAAFAAIQIAAAADACALAAAuACACAAAAAwAgCwAALgAgAwAAACAAIBIAACcAIBMAACwAIAEAAAAgACABAAAAAwAgAwQAAEwAIBgAAE4AIBkAAE0AIAYsAAA4ADAtAAA1ABAuAAA4ADAvAQA5ACEwAQA5ACExQAA6ACEDAAAAAwAgAQAANAAwFwAANQAgAwAAAAMAIAEAACMAMAIAACAAIAYsAAA4ADAtAAA1ABAuAAA4ADAvAQA5ACEwAQA5ACExQAA6ACEOBAAAPAAgGAAAPwAgGQAAPwAgMgEAAAABMwEAAAAENAEAAAAENQEAAAABNgEAAAABNwEAAAABOAEAAAABOQEAPgAhOgEAAAABOwEAAAABPAEAAAABCwQAADwAIBgAAD0AIBkAAD0AIDJAAAAAATNAAAAABDRAAAAABDVAAAAAATZAAAAAATdAAAAAAThAAAAAATlAADsAIQsEAAA8ACAYAAA9ACAZAAA9ACAyQAAAAAEzQAAAAAQ0QAAAAAQ1QAAAAAE2QAAAAAE3QAAAAAE4QAAAAAE5QAA7ACEIMgIAAAABMwIAAAAENAIAAAAENQIAAAABNgIAAAABNwIAAAABOAIAAAABOQIAPAAhCDJAAAAAATNAAAAABDRAAAAABDVAAAAAATZAAAAAATdAAAAAAThAAAAAATlAAD0AIQ4EAAA8ACAYAAA_ACAZAAA_ACAyAQAAAAEzAQAAAAQ0AQAAAAQ1AQAAAAE2AQAAAAE3AQAAAAE4AQAAAAE5AQA-ACE6AQAAAAE7AQAAAAE8AQAAAAELMgEAAAABMwEAAAAENAEAAAAENQEAAAABNgEAAAABNwEAAAABOAEAAAABOQEAPwAhOgEAAAABOwEAAAABPAEAAAABBwMAAEMAICwAAEAAMC0AAAMAEC4AAEAAMC8BAEEAITABAEEAITFAAEIAIQsyAQAAAAEzAQAAAAQ0AQAAAAQ1AQAAAAE2AQAAAAE3AQAAAAE4AQAAAAE5AQA_ACE6AQAAAAE7AQAAAAE8AQAAAAEIMkAAAAABM0AAAAAENEAAAAAENUAAAAABNkAAAAABN0AAAAABOEAAAAABOUAAPQAhAz0AAAUAID4AAAUAID8AAAUAIAgsAABEADAtAAAdABAuAABEADAvAQA5ACExQAA6ACFAAQA5ACFBAQA5ACFCAQBFACEOBAAARwAgGAAASAAgGQAASAAgMgEAAAABMwEAAAAFNAEAAAAFNQEAAAABNgEAAAABNwEAAAABOAEAAAABOQEARgAhOgEAAAABOwEAAAABPAEAAAABDgQAAEcAIBgAAEgAIBkAAEgAIDIBAAAAATMBAAAABTQBAAAABTUBAAAAATYBAAAAATcBAAAAATgBAAAAATkBAEYAIToBAAAAATsBAAAAATwBAAAAAQgyAgAAAAEzAgAAAAU0AgAAAAU1AgAAAAE2AgAAAAE3AgAAAAE4AgAAAAE5AgBHACELMgEAAAABMwEAAAAFNAEAAAAFNQEAAAABNgEAAAABNwEAAAABOAEAAAABOQEASAAhOgEAAAABOwEAAAABPAEAAAABCQUAAEsAICwAAEkAMC0AAAUAEC4AAEkAMC8BAEEAITFAAEIAIUABAEEAIUEBAEEAIUIBAEoAIQsyAQAAAAEzAQAAAAU0AQAAAAU1AQAAAAE2AQAAAAE3AQAAAAE4AQAAAAE5AQBIACE6AQAAAAE7AQAAAAE8AQAAAAEJAwAAQwAgLAAAQAAwLQAAAwAQLgAAQAAwLwEAQQAhMAEAQQAhMUAAQgAhQwAAAwAgRAAAAwAgAAAAAUgBAAAAAQFIQAAAAAELEgAAUgAwEwAAVwAwRQAAUwAwRgAAVAAwRwAAVQAgSAAAVgAwSQAAVgAwSgAAVgAwSwAAVgAwTAAAWAAwTQAAWQAwBC8BAAAAATFAAAAAAUABAAAAAUEBAAAAAQIAAAABACASAABdACADAAAAAQAgEgAAXQAgEwAAXAAgAQsAAG0AMAkFAABLACAsAABJADAtAAAFABAuAABJADAvAQAAAAExQABCACFAAQBBACFBAQBBACFCAQBKACECAAAAAQAgCwAAXAAgAgAAAFoAIAsAAFsAIAgsAABZADAtAABaABAuAABZADAvAQBBACExQABCACFAAQBBACFBAQBBACFCAQBKACEILAAAWQAwLQAAWgAQLgAAWQAwLwEAQQAhMUAAQgAhQAEAQQAhQQEAQQAhQgEASgAhBC8BAE8AITFAAFAAIUABAE8AIUEBAE8AIQQvAQBPACExQABQACFAAQBPACFBAQBPACEELwEAAAABMUAAAAABQAEAAAABQQEAAAABBBIAAFIAMEUAAFMAMEcAAFUAIEsAAFYAMAAAAAAAAUgBAAAAAQcSAABoACATAABrACBFAABpACBGAABqACBJAAADACBKAAADACBLAAAgACADEgAAaAAgRQAAaQAgSwAAIAAgAQMAAF8AIAMvAQAAAAEwAQAAAAExQAAAAAECAAAAIAAgEgAAaAAgAwAAAAMAIBIAAGgAIBMAAGwAIAUAAAADACALAABsACAvAQBPACEwAQBPACExQABQACEDLwEATwAhMAEATwAhMUAAUAAhBC8BAAAAATFAAAAAAUABAAAAAUEBAAAAAQEFBAICAwcBBAADAQMIAAABBRICAQUYAgMEAAgYAAkZAAoAAAADBAAIGAAJGQAKAAADBAAPGAAQGQARAAAAAwQADxgAEBkAEQYCAQcJAQgKAQkLAQoMAQwOAQ0QBA4RBQ8UARAWBBEXBhQZARUaARYbBBoeBxsfCxwhAh0iAh4kAh8lAiAmAiEoAiIqBCMrDCQtAiUvBCYwDScxAigyAikzBCo2Dis3Eg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/db.ts
var connectionString = `${process.env.DATABASE_URL || ""}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/repository/message.repository.ts
var getMessages = () => {
  return prisma.message.findMany();
};
var getRoomMessages = (roomId) => {
  return prisma.message.findMany({ where: { roomId } });
};
var create = (rawMessage) => {
  return prisma.message.create({
    data: rawMessage
  });
};
var deleteMessage = (messageId) => {
  return prisma.message.delete({
    where: {
      id: messageId
    }
  });
};
var deleteMany = (roomId) => {
  return prisma.message.deleteMany({ where: { roomId } });
};
var message_repository_default = {
  getMessages,
  getRoomMessages,
  create,
  deleteMessage,
  deleteMany
};

// src/repository/room.repository.ts
var getById = (id) => {
  return prisma.room.findFirst({
    where: {
      id
    }
  });
};
var get = () => {
  return prisma.room.findMany();
};
var create2 = (rawRoom) => {
  return prisma.room.create({
    data: rawRoom
  });
};
var deleteRoom = (roomId) => {
  return prisma.room.delete({ where: { id: roomId } });
};
var change = (id, toChange) => {
  return prisma.room.update({
    where: {
      id
    },
    data: toChange
  });
};
var room_repository_default = {
  get,
  getById,
  create: create2,
  deleteRoom,
  change
};

// src/utils/ApiError.ts
var ApiError = class _ApiError extends Error {
  status;
  errors;
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
  static badRequest(messages) {
    return new _ApiError("Bad request", 400, { errors: messages });
  }
  static notFound(messages) {
    return new _ApiError("Not found", 404, { errors: messages });
  }
};

// src/controllers/message.controllers.ts
var getMessages2 = async (req, res) => {
  const messages = await message_repository_default.getMessages();
  if (!messages) {
    throw Error("Internal server error");
  }
  res.status(200).send(messages);
};
var create3 = async (req, res) => {
  const { author, text, roomId } = req.body;
  if (!author || !text) {
    throw ApiError.badRequest([{ message: "Author and text is required" }]);
  }
  const rawMessage = { author, text };
  if (roomId) {
    if (!await room_repository_default.getById(roomId)) {
      throw ApiError.notFound([{ message: "Room not found" }]);
    }
    rawMessage["roomId"] = roomId;
  }
  const message = await message_repository_default.create(rawMessage);
  if (!message) {
    throw Error("Internal server error");
  }
  emitter.emit("message", {
    type: "new",
    to: "messages",
    data: message
  });
  res.status(201).send(message);
};
var deleteMessage2 = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw ApiError.badRequest([{ message: "Bad request, id not found" }]);
  }
  const deleted = await message_repository_default.deleteMessage(id);
  if (!deleted) {
    throw ApiError.notFound([{ message: "Message not found" }]);
  }
  res.sendStatus(204);
};
var getUpdates = async (req, res) => {
  res.setHeader("content-type", "text/event-stream");
  res.setHeader("connection", "keep-alive");
  res.setHeader("cache-control", "no-store");
  const cb = (update) => {
    res.write(`data: ${JSON.stringify(update)}
`);
  };
  emitter.on("message", cb);
  res.on("close", () => {
    emitter.off("message", cb);
  });
};
var message_controllers_default = {
  getMessages: getMessages2,
  create: create3,
  deleteMessage: deleteMessage2,
  getUpdates
};

// src/routes/message.routes.ts
var router = Router();
router.get("/", catchAsync(message_controllers_default.getMessages));
router.post("/", catchAsync(message_controllers_default.create));
router.delete("/", catchAsync(message_controllers_default.deleteMessage));
router.get("/updates", catchAsync(message_controllers_default.getUpdates));

// src/createServer.ts
import cors from "cors";

// src/middlewares/ErrorMiddleware.ts
var ErrorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.statusCode = error.status;
    res.statusMessage = error.message;
    res.send(error.errors);
    return;
  }
  res.statusCode = 500;
  res.send({
    errors: [
      {
        message: "Internal server error"
      }
    ]
  });
};

// src/routes/room.routes.ts
import { Router as Router2 } from "express";

// src/utils/filterToUpdate.ts
var keysToChange = ["title"];
var filter = (rawToChange) => {
  const newObj = {};
  Object.entries(rawToChange).forEach(([key, value]) => {
    if (!keysToChange.includes(key) || !value) {
      return;
    }
    newObj[key] = value;
  });
  return newObj;
};

// src/controllers/room.controller.ts
var create4 = async (req, res) => {
  const { title } = req.body;
  if (!title.trim()) {
    throw ApiError.badRequest([{ message: "Title is required" }]);
  }
  const rawRoom = {
    title
  };
  const room = await room_repository_default.create(rawRoom);
  if (!room) {
    throw Error;
  }
  emitter.emit("message", {
    type: "new",
    to: "room",
    data: room
  });
  res.status(201).send(room);
};
var deleteRoom2 = async (req, res) => {
  const { id } = req.body;
  if (!id || typeof id !== "string" || !await room_repository_default.getById(id)) {
    throw ApiError.badRequest([{ message: "Id is required" }]);
  }
  const messages = await message_repository_default.deleteMany(id);
  const room = await room_repository_default.deleteRoom(id);
  emitter.emit("message", {
    type: "delete",
    to: "room",
    data: room
  });
  res.sendStatus(204);
};
var getMessages3 = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    throw ApiError.badRequest([{ message: "Room id required" }]);
  }
  const messages = await message_repository_default.getRoomMessages(id);
  res.status(200).send(messages);
};
var change2 = async (req, res) => {
  const { id } = req.params;
  const rawToChange = req.body;
  if (!id || typeof id !== "string") {
    throw ApiError.badRequest([{ message: "Room is required" }]);
  }
  if (!rawToChange) {
    throw ApiError.badRequest([{ message: "Changes is required" }]);
  }
  const toChange = filter(rawToChange);
  const updatedRoom = await room_repository_default.change(id, toChange);
  emitter.emit("message", {
    type: "update",
    to: "room",
    data: updatedRoom
  });
  res.sendStatus(204);
};
var get2 = async (req, res) => {
  const rooms = await room_repository_default.get();
  res.status(200).send(rooms);
};
var room_controller_default = {
  create: create4,
  deleteRoom: deleteRoom2,
  getMessages: getMessages3,
  get: get2,
  change: change2
};

// src/routes/room.routes.ts
var router2 = Router2();
router2.get("/", room_controller_default.get);
router2.get("/:id", room_controller_default.getMessages);
router2.post("/", room_controller_default.create);
router2.delete("/", room_controller_default.deleteRoom);
router2.patch("/:id", room_controller_default.change);

// src/createServer.ts
var createServer = () => {
  const app = express();
  app.use(
    cors({
      origin: "*",
      credentials: true
    })
  );
  app.use(express.json());
  app.use("/messages", router);
  app.use("/rooms", router2);
  app.use(ErrorMiddleware);
  return app;
};

// src/index.ts
import { WebSocketServer } from "ws";
var emitter = new EventEmitter();
var server = createServer().listen(3005, () => {
  console.log("Server is working on 3005");
});
var wss = new WebSocketServer({ server });
emitter.on("message", (data) => {
  console.log(wss.listenerCount);
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
});
export {
  emitter
};
