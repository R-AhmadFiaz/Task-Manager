const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite's web implementation loads a wa-sqlite.wasm file and runs it in
// a Worker backed by SharedArrayBuffer. Neither works with Metro's defaults:
// .wasm isn't a recognized asset extension (causes "Unable to resolve
// module ... wa-sqlite.wasm"), and SharedArrayBuffer requires the page to be
// cross-origin isolated via COEP/COOP response headers.
config.resolver.assetExts.push("wasm");

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

module.exports = config;
