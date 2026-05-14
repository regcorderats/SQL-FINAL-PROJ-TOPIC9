-- ==========================================
-- MỤC B.7: PARTIAL INDEX (CHỈ ĐÁNH INDEX DÒNG PENDING)
-- ==========================================
-- Khác với Index thường làm phình to DB, Partial Index chỉ đánh dấu những giao dịch
-- có trạng thái PENDING. Vì số lượng lệnh chờ duyệt luôn ít hơn rất nhiều so với
-- tổng lịch sử giao dịch, Index này siêu nhỏ và quét cực nhanh.
CREATE INDEX IF NOT EXISTS idx_pending_tx ON "Transaction" (id) WHERE status = 'PENDING';

-- ==========================================
-- MỤC B.6: MATERIALIZED VIEW (GOM NHÓM DỮ LIỆU SẴN)
-- ==========================================
-- View này tính toán sẵn tổng số lượng và tổng tiền của các lệnh PENDING theo từng ngày.
-- Khi màn hình Dashboard gọi API, DB chỉ cần đọc từ View này thay vì phải GROUP BY hàng triệu dòng Transaction.
CREATE MATERIALIZED VIEW mv_pending_transactions_summary AS
SELECT 
    DATE("createdAt") as tx_date,
    COUNT(*) as total_count,
    SUM(amount) as total_amount
FROM "Transaction"
WHERE status = 'PENDING'
GROUP BY DATE("createdAt");

-- Tạo Unique Index cho View để sau này NestJS có thể gọi lệnh REFRESH CONCURRENTLY 
-- (Làm mới view mà không khóa bảng)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pending_tx_date ON mv_pending_transactions_summary (tx_date);