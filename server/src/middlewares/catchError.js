/**
 *  @param {import('../types/func.type').TyFuncController} action
 * @returns {import('../types/func.type').TyFuncController} */
export function catchError(action) {
  return async(req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
