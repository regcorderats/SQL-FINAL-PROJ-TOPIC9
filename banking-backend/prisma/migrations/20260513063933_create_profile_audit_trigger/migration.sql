-- 1. Tạo Function xử lý logic copy dữ liệu
CREATE OR REPLACE FUNCTION log_customer_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Mệnh đề IS DISTINCT FROM giúp bỏ qua các thao tác UPDATE không làm đổi giá trị (tránh rác DB)
    IF OLD.age IS DISTINCT FROM NEW.age OR 
       OLD.gender IS DISTINCT FROM NEW.gender OR 
       OLD.education IS DISTINCT FROM NEW.education OR 
       OLD.income IS DISTINCT FROM NEW.income THEN
       
       INSERT INTO "CustomerProfile_Audit" ("id", "profileId", "userId", "oldAge", "oldGender", "oldEducation", "oldIncome", "changedAt")
       VALUES (
           gen_random_uuid(), 
           OLD.id, 
           OLD."userId", 
           OLD.age, 
           OLD.gender, 
           OLD.education, 
           OLD.income, 
           NOW()
       );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Gắn Trigger vào bảng CustomerProfile
DROP TRIGGER IF EXISTS trg_customer_profile_audit ON "CustomerProfile";

CREATE TRIGGER trg_customer_profile_audit
AFTER UPDATE ON "CustomerProfile"
FOR EACH ROW
EXECUTE FUNCTION log_customer_profile_changes();