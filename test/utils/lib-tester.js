// Invoke as `node ./lib-tester.js ./path/to/lib.js <base64 encoded JS expression>`
// require()s the lib, exposes as `lib` variable, and evals the expression.
// Writes return value as JSON to stdout, or writes `undefined` for undefined

// Base64 encoding to support Windows without needing to understand escaping rules
// TODO is this necessary?  Does shelljs take care of encoding positional CLI args?

/**
 * @exports
 * @typedef JsonArgs {{
 *   libPath: string;
 *   expression: string;
 * }}
 */
(async () => {
  const { libPath, expression } = /** @JsonArgs */ JSON.parse(
    Buffer.from(process.argv[2], 'base64').toString()
  );
  const lib = require(libPath);
  const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  const value = await new AsyncFunction('lib', `return (${expression})`)(lib);
  console.log(JSON.stringify(value));
})();
