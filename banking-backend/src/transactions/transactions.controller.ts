import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ==================== MAKER (TELLER) ====================

  @Post('transfer/maker')
  createMakerTransfer(
    @Body('makerId') makerId: string,
    @Body('fromAccountId') fromAccountId: string,
    @Body('toAccountId') toAccountId: string,
    @Body('amount') amount: number | string,
  ) {
    return this.transactionsService.createMakerTransfer(makerId, fromAccountId, toAccountId, amount);
  }

  @Post('deposit/maker')
  createMakerDeposit(
    @Body('makerId') makerId: string,
    @Body('customerAccountId') customerAccountId: string,
    @Body('vaultAccountId') vaultAccountId: string,
    @Body('amount') amount: number | string,
  ) {
    return this.transactionsService.createMakerDeposit(makerId, customerAccountId, vaultAccountId, amount);
  }

  @Post('withdrawal/maker')
  createMakerWithdrawal(
    @Body('makerId') makerId: string,
    @Body('customerAccountId') customerAccountId: string,
    @Body('vaultAccountId') vaultAccountId: string,
    @Body('amount') amount: number | string,
  ) {
    return this.transactionsService.createMakerWithdrawal(makerId, customerAccountId, vaultAccountId, amount);
  }
  @Get('history')
  getCustomerHistory(@Body('userId') userId: string) {  // Hoặc dùng từ JWT sau này
    return this.transactionsService.getCustomerTransactionHistory(userId);
  }

  // ==================== CHECKER (MANAGER) ====================

  @Put('transfer/checker/:transactionId')
  reviewMakerTransfer(
    @Param('transactionId') transactionId: string,
    @Body('checkerId') checkerId: string,
    @Body('action') action: 'APPROVE' | 'REJECT',
  ) {
    return this.transactionsService.reviewMakerTransfer(checkerId, transactionId, action);
  }
    // Lấy danh sách lệnh đang chờ duyệt (dùng cho Manager)
  @Get('pending')
  async getPendingTransactions() {
    return this.transactionsService.getPendingTransactions();
  }
}