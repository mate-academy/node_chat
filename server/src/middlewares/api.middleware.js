/**
 * @param { ('delete' | 'update') } action
 * @returns {import('../types/func.type.js').TyFuncController} */
export const isAction = (action) => {
  return (req, res, next) => {
    if (req.query.action === action) {
      next();// call next handler in a chain
      return;
    } else {
      next('route');// call next route
    }
  };
};
