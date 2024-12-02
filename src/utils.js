const generateId = (array) => {
  if (array.length > 0) {
    return array[array.length - 1].id + 1;
  }

  return 1;
};

const tryCatch = (controller) => async (req, res, next) => {
  try {
    await controller(req, res);
  } catch (error) {
    next(error);
  }
};

const errorHandler = (handler) => {
  const handleError = (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  };

  return (...args) => {
    try {
      const ret = handler.apply(this, args);

      if (ret && typeof ret.catch === 'function') {
        // async handler
        ret.catch(handleError);
      }
    } catch (e) {
      // sync handler
      handleError(e);
    }
  };
};

module.exports = { generateId, tryCatch, errorHandler };
