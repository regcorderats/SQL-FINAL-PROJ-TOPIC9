import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, TransactionType, Prisma } from '@prisma/client'; // <-- MỚI: Import Prisma từ đây

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createMakerTransfer(makerId: string, fromAccountId: string, toAccountId: string, inputAmount: number | string) {
    // SỬ DỤNG Prisma.Decimal THAY VÌ import rời
    const amount = new Prisma.Decimal(inputAmount);

    if (amount.lte(0)) throw new BadRequestException('Số tiền chuyển phải lớn hơn 0');

    // Bắt đầu một Transaction đảm bảo chuẩn ACID
    return await this.prisma.$transaction(async (tx) => {
      // 2. LOCK TÀI KHOẢN NGƯỜI GỬI BẰNG RAW SQL
      const senderAcc: any[] = await tx.$queryRaw`
        SELECT id, balance 
        FROM "Account" 
        WHERE id = ${fromAccountId} 
        FOR UPDATE; 
      `;

      if (!senderAcc || senderAcc.length === 0) {
        throw new BadRequestException('Không tìm thấy tài khoản người gửi');
      }

      // Prisma trả về array, đọc balance dưới dạng Decimal
      const currentBalance = new Prisma.Decimal(senderAcc[0].balance);

      // 3. KIỂM TRA SỐ DƯ
      if (currentBalance.lt(amount)) {
        throw new BadRequestException('Số dư không đủ để thực hiện giao dịch');
      }

      // 4. ĐÓNG BĂNG TIỀN (Luồng Maker: Trừ balance khả dụng, cộng vào frozenBalance)
      // Vẫn giữ phong cách Raw SQL của bạn, Prisma sẽ tự parse tham số Decimal an toàn
      await tx.$executeRaw`
        UPDATE "Account" 
        SET balance = balance - ${amount},
            "frozenBalance" = "frozenBalance" + ${amount}
        WHERE id = ${fromAccountId};
      `;

      // 5. GHI LOG VÀO BẢNG TRANSACTIONS 
      const transactionRecord = await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          amount: amount, // Truyền trực tiếp object Decimal
          type: TransactionType.TRANSFER,
          status: TransactionStatus.PENDING, // Maker chỉ tạo PENDING
          makerId: makerId, // Ghi nhận Teller nào tạo lệnh
        },
      });

      // QUAN TRỌNG: KHÔNG GHI EVENT VÀO OUTBOX Ở BƯỚC NÀY
      // Cronjob và Analytics không được quét các giao dịch PENDING

      return { 
        message: 'Lệnh chuyển tiền đã được tạo và đang chờ Quản lý duyệt', 
        transactionId: transactionRecord.id 
      };
    });
  }

  async createMakerDeposit(makerId: string, customerAccountId: string, vaultAccountId: string, inputAmount: number | string) {
    const amount = new Prisma.Decimal(inputAmount);
    if (amount.lte(0)) throw new BadRequestException('Số tiền nạp phải lớn hơn 0');

    return await this.prisma.$transaction(async (tx) => {
      // 1. LOCK TÀI KHOẢN VAULT BẰNG RAW SQL
      const vaultAcc: any[] = await tx.$queryRaw`
        SELECT id, balance, "isVault" 
        FROM "Account" 
        WHERE id = ${vaultAccountId} 
        FOR UPDATE; 
      `;

      if (!vaultAcc || vaultAcc.length === 0 || !vaultAcc[0].isVault) {
        throw new BadRequestException('Tài khoản két sắt (Vault) không hợp lệ');
      }

      const currentBalance = new Prisma.Decimal(vaultAcc[0].balance);
      if (currentBalance.lt(amount)) {
        throw new BadRequestException('Két sắt chi nhánh không đủ hạn mức (Cần điều quỹ)');
      }

      // 2. TRỪ BALANCE CỦA VAULT, CỘNG VÀO FROZEN CỦA VAULT (Chờ Manager duyệt)
      await tx.$executeRaw`
        UPDATE "Account" 
        SET balance = balance - ${amount},
            "frozenBalance" = "frozenBalance" + ${amount}
        WHERE id = ${vaultAccountId};
      `;

      // 3. TẠO LỊCH SỬ GIAO DỊCH
      const transactionRecord = await tx.transaction.create({
        data: {
          fromAccountId: vaultAccountId,
          toAccountId: customerAccountId,
          amount: amount,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.PENDING,
          makerId: makerId,
        },
      });

      return { 
        message: 'Lệnh NẠP TIỀN đã được tạo và đang chờ Quản lý duyệt', 
        transactionId: transactionRecord.id 
      };
    });
  }

  // ==========================================
  // LUỒNG MAKER: RÚT TIỀN MẶT TẠI QUẦY (WITHDRAWAL)
  // Tiền số di chuyển từ: Customer Account -> Vault Account
  // ==========================================
  async createMakerWithdrawal(makerId: string, customerAccountId: string, vaultAccountId: string, inputAmount: number | string) {
    const amount = new Prisma.Decimal(inputAmount);
    if (amount.lte(0)) throw new BadRequestException('Số tiền rút phải lớn hơn 0');

    return await this.prisma.$transaction(async (tx) => {
      // 1. LOCK TÀI KHOẢN KHÁCH HÀNG BẰNG RAW SQL
      const customerAcc: any[] = await tx.$queryRaw`
        SELECT id, balance, status 
        FROM "Account" 
        WHERE id = ${customerAccountId} 
        FOR UPDATE; 
      `;

      if (!customerAcc || customerAcc.length === 0) {
        throw new BadRequestException('Không tìm thấy tài khoản khách hàng');
      }

      if (customerAcc[0].status !== 'ACTIVE') {
        throw new BadRequestException('Tài khoản khách hàng chưa được kích hoạt hoặc đã bị đóng/ngủ đông');
      }

      const currentBalance = new Prisma.Decimal(customerAcc[0].balance);
      if (currentBalance.lt(amount)) {
        throw new BadRequestException('Số dư khách hàng không đủ để rút tiền');
      }

      // 2. ĐÓNG BĂNG TIỀN KHÁCH HÀNG (Trừ balance, cộng frozenBalance)
      await tx.$executeRaw`
        UPDATE "Account" 
        SET balance = balance - ${amount},
            "frozenBalance" = "frozenBalance" + ${amount}
        WHERE id = ${customerAccountId};
      `;

      // 3. TẠO LỊCH SỬ GIAO DỊCH
      const transactionRecord = await tx.transaction.create({
        data: {
          fromAccountId: customerAccountId,
          toAccountId: vaultAccountId,
          amount: amount,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.PENDING,
          makerId: makerId,
        },
      });

      return { 
        message: 'Lệnh RÚT TIỀN đã được tạo và đang chờ Quản lý duyệt', 
        transactionId: transactionRecord.id 
      };
    });
  }
  async getPendingTransactions() {
    return this.prisma.transaction.findMany({
      where: { status: 'PENDING' },
      include: {
        fromAccount: true,
        toAccount: true,
        maker: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  async getCustomerTransactionHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccount: { userId } },   // Giao dịch đi
          { toAccount: { userId } }     // Giao dịch đến
        ]
      },
      include: {
        fromAccount: { select: { id: true, userId: true } },
        toAccount: { select: { id: true, userId: true } },
        maker: { select: { email: true } },
        checker: { select: { email: true } },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50, // Giới hạn 50 giao dịch gần nhất
    });
  }
  // ==========================================
  // LUỒNG CHECKER (MANAGER): DUYỆT HOẶC TỪ CHỐI LỆNH
  // ==========================================
  async reviewMakerTransfer(checkerId: string, transactionId: string, action: 'APPROVE' | 'REJECT') {
    return await this.prisma.$transaction(async (tx) => {
      // 1. LOCK BẢNG TRANSACTION: Chống tình trạng 2 Manager cùng click duyệt 1 lệnh
      const pendingTxs: any[] = await tx.$queryRaw`
        SELECT * FROM "Transaction" 
        WHERE id = ${transactionId} 
        FOR UPDATE;
      `;

      if (!pendingTxs || pendingTxs.length === 0) {
        throw new BadRequestException('Không tìm thấy giao dịch');
      }

      const transaction = pendingTxs[0];

      // 2. Validate trạng thái và quyền hạn
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Giao dịch không ở trạng thái chờ duyệt');
      }

      if (transaction.makerId === checkerId) {
        throw new BadRequestException('Vi phạm quy tắc: Người tạo lệnh không được phép tự duyệt (Maker != Checker)');
      }

      // Chuẩn hóa amount thành Decimal
      const amount = new Prisma.Decimal(transaction.amount);

      if (action === 'APPROVE') {
        // [KỊCH BẢN 1: MANAGER DUYỆT]
        // Trừ frozenBalance của người gửi và Cộng thẳng vào balance của người nhận
        await tx.$executeRaw`
          UPDATE "Account" 
          SET "frozenBalance" = "frozenBalance" - ${amount}
          WHERE id = ${transaction.fromAccountId};
        `;

        await tx.$executeRaw`
          UPDATE "Account" 
          SET balance = balance + ${amount}
          WHERE id = ${transaction.toAccountId};
        `;

        // Cập nhật trạng thái
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.APPROVED,
            checkerId: checkerId,
          },
        });

        // KỶ LUẬT: Chỉ ghi OutboxEvent khi tiền thực sự đã di chuyển
        await tx.outboxEvent.create({
          data: {
            aggregateType: 'TRANSACTION',
            aggregateId: transactionId,
            eventType: 'FUNDS_TRANSFERRED',
            payload: { 
              fromAccountId: transaction.fromAccountId, 
              toAccountId: transaction.toAccountId, 
              amount: amount 
            },
          },
        });

        return { message: 'Đã DUYỆT giao dịch thành công. Tiền đã được chuyển đi.' };

      } else {
        // [KỊCH BẢN 2: MANAGER TỪ CHỐI]
        // Hoàn trả tiền từ frozenBalance về balance cho người gửi
        await tx.$executeRaw`
          UPDATE "Account" 
          SET "frozenBalance" = "frozenBalance" - ${amount},
              balance = balance + ${amount}
          WHERE id = ${transaction.fromAccountId};
        `;

        // Cập nhật trạng thái
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.REJECTED,
            checkerId: checkerId,
          },
        });

        // KỶ LUẬT: Lệnh bị hủy, dòng tiền không di chuyển -> KHÔNG sinh OutboxEvent.

        return { message: 'Đã TỪ CHỐI giao dịch. Hoàn tất việc mở đóng băng tiền.' };
      }
    });
  }
}
