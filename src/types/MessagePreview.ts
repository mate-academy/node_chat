import { NormalizedUser } from './NormalizedUser';
import { NormalizedMessage } from './NormalizedMessage';

export type MessagePreview = NormalizedMessage & { author: NormalizedUser };
