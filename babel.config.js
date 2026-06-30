module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo handles Reanimated v4 / worklets and React Compiler
    // (enabled via app.json experiments). NativeWind adds its JSX transform.
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
