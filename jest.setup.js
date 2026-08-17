// jest.setup.js
const structuredClonePolyfill = (obj) => {
  if (obj === undefined) return undefined;
  return JSON.parse(JSON.stringify(obj));
};

global.structuredClone = global.structuredClone || structuredClonePolyfill;
globalThis.structuredClone = globalThis.structuredClone || structuredClonePolyfill;

global.__ExpoImportMetaRegistry = {};
globalThis.__ExpoImportMetaRegistry = {};

if (!global.fetch) {
  global.fetch = jest.fn();
}
