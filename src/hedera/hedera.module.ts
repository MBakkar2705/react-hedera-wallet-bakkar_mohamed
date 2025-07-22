import { Global, Module } from '@nestjs/common';
import { Client } from '@hashgraph/sdk';

@Global()
@Module({
  providers: [
    {
      provide: 'HEDERA_CLIENT',
      useFactory: () =>
        Client.forTestnet().setOperator(
          process.env.OPERATOR_ID!,
          process.env.OPERATOR_KEY!
        ),
    },
  ],
  exports: ['HEDERA_CLIENT'],
})
export class HederaModule {}
