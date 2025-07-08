const jwt = require('../utils/jwt');
const ApiError = require('../exceptions/ApiError');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(ApiError.Unauthorized('Authorization header is missing.'));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(
      ApiError.Unauthorized(
        'Invalid Authorization header format. Expected "Bearer <token>".',
      ),
    );
  }

  const accessToken = parts[1];

  if (!accessToken) {
    return next(ApiError.Unauthorized('Access token is missing.'));
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    return next(ApiError.Unauthorized('Invalid or expired access token.'));
  }

  req.user = userData;
  next();
}

module.exports = {
  authMiddleware,
};
