const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Treat short sound effects as bundled assets.
if (!config.resolver.assetExts.includes("wav")) {
  config.resolver.assetExts.push("wav");
}

module.exports = withNativeWind(config, { input: "./src/global.css" });
