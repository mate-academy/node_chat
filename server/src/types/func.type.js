import { } from 'express';

/**
 * @callback TyFuncController
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {void | Promise<void>}
 */

/**
 * @callback TyFuncErrorMiddleware
 * @param {import('../exceptions/api.error').ApiError} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {void | Promise<void>}
 */

/**
 * @callback TyFuncSendAuth
 * @param {import('express').Response} res
 * @param {import('sequelize').Model} user
 * @return {Promise<void>}
 */
