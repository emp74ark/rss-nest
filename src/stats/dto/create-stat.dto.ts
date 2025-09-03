export class CreateStatDto {
  constructor({
    source,
    timestamp,
    ip,
  }: {
    source: string;
    timestamp?: number;
    ip: string | string[] | undefined;
  }) {
    this.source = source;
    this.localTime = timestamp ? new Date(timestamp) : undefined;
    this.ip = ip?.toString();
  }

  source: string;

  localTime?: Date;

  ip?: string;
}
