import { Request } from 'express';

export class CreateStatDto {
  constructor({
    source,
    timestamp,
    ip,
    headers,
  }: {
    source: string;
    timestamp?: number;
    ip: string | string[] | undefined;
    headers?: Request['headers'];
  }) {
    this.source = source;
    this.localTime = timestamp ? new Date(timestamp) : undefined;
    this.ip = ip?.toString();
    this.client = {
      origin: headers?.['origin'],
      userAgent: headers?.['user-agent'],
      languages: headers?.['accept-language'],
    };
  }

  source: string;

  localTime?: Date;

  ip?: string;

  client?: object;
}
