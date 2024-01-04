import { Request, Response } from 'express';
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from '../constants/httpStatusCodes';
import {
  VALIDATION_ERROR,
  CAST_ERROR,
  UNEXPECTED_ERROR,
} from '../constants/errorMessages';

export default function(err: any, _: Request, res: Response) {
  if (err.name === 'ValidationError') {
    return res.status(BAD_REQUEST).json({ message: VALIDATION_ERROR });
  }

  if (err.name === 'CastError') {
    return res.status(BAD_REQUEST).json({ message: CAST_ERROR });
  }

  res.status(INTERNAL_SERVER_ERROR).json({ message: UNEXPECTED_ERROR });
};
