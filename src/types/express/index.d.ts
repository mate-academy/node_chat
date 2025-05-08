import { NormalizedUser } from '../NormalizedUser';

declare global {
  namespace Express {
    interface Request {
      user?: NormalizedUser;
    }
  }
}
