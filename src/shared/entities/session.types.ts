import { User } from '../../schemas/user.schema';

export interface SessionData {
  user?: User & { _id: string };
  destroy(callback: (err: any) => void): void;
}

export interface RequestWithSession {
  session: SessionData;
  ip: string;
  url: string;
  originalUrl?: string;
}

export interface FastifyLikeResponse {
  status(statusCode: number): FastifyLikeResponse;
  send(payload: any): FastifyLikeResponse;
}
