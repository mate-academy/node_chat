const format = (args) =>
  args.map((a) => (a instanceof Error ? a.stack : String(a))).join(' ');

const info = (...args) => process.stdout.write(`${format(args)}\n`);
const error = (...args) => process.stderr.write(`${format(args)}\n`);

module.exports = { info, error };
