import { Controller, Post } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  // API để test chạy đối soát thủ công qua Postman/REST Client
  @Post('trigger-manual')
  async triggerManual() {
    return await this.reconciliationService.triggerManualReconciliation();
  }
}