import { Injectable, OnModuleInit } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { join } from 'path';

interface BrowserService {
  getDocument({
    url,
  }: {
    url: string;
  }): Observable<{ content: string; error: boolean; errorMessage: string }>;
}

@Injectable()
export class CrawlerService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'browser_proto',
      protoPath: join(__dirname, '..', '..', 'proto', 'browser.proto'),
      url: 'feedz-crawler:50051',
    },
  })
  client: ClientGrpc;

  private browserService: BrowserService;

  onModuleInit() {
    this.browserService =
      this.client.getService<BrowserService>('BrowserService');
  }

  getDocument({ url }: { url: string }) {
    console.log('CrawlerService.getDocument', url);
    return this.browserService.getDocument({ url });
  }
}
