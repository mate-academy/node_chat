'use strict';

const _require = require('../sql_structure/user.model');
const User = _require.User;

const normalizeUser = function normalizeUser(_ref) {
  const name = _ref.name;

  return {
    name: name,
  };
};

const login = function login(req, res, next) {
  let _ref2, name, errors, normalName, existingUser;

  return regeneratorRuntime.async(
    function login$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.prev = 0;
            (_ref2 = req.body || {}), (name = _ref2.name);
            errors = '';
            normalName = name.trim();

            if (!(normalName === '')) {
              _context.next = 8;
              break;
            }

            errors += ' name is not typed';

            res.status(401).send({
              errors: errors,
            });

            return _context.abrupt('return');

          case 8:
            _context.next = 11;

            return regeneratorRuntime.awrap(
              User.findOne({
                where: {
                  name: normalName,
                },
              }),
            );

          case 11:
            existingUser = _context.sent;

            if (!existingUser) {
              _context.next = 16;
              break;
            }

            errors = ' this User already exists';

            res.status(409).send({
              errors: errors,
            });

            return _context.abrupt('return');

          case 16:
            _context.next = 18;

            return regeneratorRuntime.awrap(
              User.create({
                name: name.trim(),
              }),
            );

          case 18:
            res.status(201).send({
              user: normalizeUser(req.user),
            });
            _context.next = 24;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context['catch'](0);
            next(_context.t0);

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    },
    null,
    null,
    [[0, 21]],
  );
};

module.exports = {
  login: login,
};
