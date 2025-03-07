-- PostgreSQL Database Creation Script for Government Service Management System

-- Start a transaction and set a savepoint
BEGIN;

-- Add error handling - wrap the script in a DO block
DO $$
BEGIN

-- Drop all tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS StaffRefreshToken;
DROP TABLE IF EXISTS CitizenRefreshToken;
DROP TABLE IF EXISTS MediaPostFiles;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS PostCategories;
DROP TABLE IF EXISTS MediaFiles;
DROP TABLE IF EXISTS PublicNotifications;
DROP TABLE IF EXISTS AgencyDelays;
DROP TABLE IF EXISTS ProcessingHistory;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Applications;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Agencies;
DROP TABLE IF EXISTS SpecialApplicationTypes;
DROP TABLE IF EXISTS ApplicationTypes;
DROP TABLE IF EXISTS Citizens;
DROP TABLE IF EXISTS Areas;

-- Create Tables in order of dependencies

-- Table: Areas (Khu vực)
CREATE TABLE Areas (
    AreaCode INT PRIMARY KEY,
    AreaName VARCHAR(255) NOT NULL,
    ParentAreaCode INT REFERENCES Areas(AreaCode),
    Level INT NOT NULL -- 1: Tỉnh/TP, 2: Quận/Huyện, 3: Phường/Xã
);

-- Table: Citizens (Công dân)
CREATE TABLE Citizens (
    CitizenID SERIAL PRIMARY KEY,
    FullName VARCHAR(255) NOT NULL,
    IdentificationNumber VARCHAR(20) UNIQUE NOT NULL,
    Address VARCHAR(500) NOT NULL,
    PhoneNumber VARCHAR(15),
    Email VARCHAR(255),
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    AreaCode INT REFERENCES Areas(AreaCode)
);

-- Table: ApplicationTypes (Loại hồ sơ)
CREATE TABLE ApplicationTypes (
    ApplicationTypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(255) NOT NULL,
    Description TEXT,
    ProcessingTimeLimit INT
);

-- Table: SpecialApplicationTypes (Loại hồ sơ đặc biệt)
CREATE TABLE SpecialApplicationTypes (
    SpecialApplicationTypeID SERIAL PRIMARY KEY,
    ApplicationTypeID INT REFERENCES ApplicationTypes(ApplicationTypeID) NOT NULL,
    TypeName VARCHAR(255) NOT NULL,
    ProcessingTimeLimit INT NOT NULL,
    Description TEXT
);

-- Table: Agencies (Cơ quan)
CREATE TABLE Agencies (
    AgencyID SERIAL PRIMARY KEY,
    AgencyName VARCHAR(255) NOT NULL,
    Address VARCHAR(500) NOT NULL,
    PhoneNumber VARCHAR(15),
    Email VARCHAR(255),
    SpecializedFields TEXT,
    AreaCode INT REFERENCES Areas(AreaCode) NOT NULL
);

-- Table: Staff (Nhân viên)
CREATE TABLE Staff (
    StaffID SERIAL PRIMARY KEY,
    AgencyID INT REFERENCES Agencies(AgencyID) NOT NULL,
    FullName VARCHAR(255) NOT NULL,
    EmployeeCode VARCHAR(50) UNIQUE NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL
);

-- Table: Applications (Hồ sơ)
CREATE TABLE Applications (
    ApplicationID SERIAL PRIMARY KEY,
    CitizenID INT REFERENCES Citizens(CitizenID) NOT NULL,
    ApplicationTypeID INT REFERENCES ApplicationTypes(ApplicationTypeID) NOT NULL,
    SpecialApplicationTypeID INT REFERENCES SpecialApplicationTypes(SpecialApplicationTypeID),
    Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    SubmissionDate DATE NOT NULL,
    Status VARCHAR(50) NOT NULL,
    CurrentAgencyID INT REFERENCES Agencies(AgencyID),
    LastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DueDate DATE NOT NULL,
    IsOverdue BOOLEAN NOT NULL DEFAULT FALSE,
    HasMedia BOOLEAN NOT NULL DEFAULT FALSE,
    EventDate DATE,
    Location VARCHAR(500)
);

-- Table: Notifications (Thông báo)
CREATE TABLE Notifications (
    NotificationID SERIAL PRIMARY KEY,
    CitizenID INT REFERENCES Citizens(CitizenID) NOT NULL,
    ApplicationID INT REFERENCES Applications(ApplicationID) NOT NULL,
    Content TEXT NOT NULL,
    NotificationType VARCHAR(50) NOT NULL,
    SentDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsRead BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table: ProcessingHistory (Lịch sử xử lý)
CREATE TABLE ProcessingHistory (
    HistoryID SERIAL PRIMARY KEY,
    ApplicationID INT REFERENCES Applications(ApplicationID) NOT NULL,
    StaffID INT REFERENCES Staff(StaffID) NOT NULL,
    ActionTaken VARCHAR(255) NOT NULL,
    ActionDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    IsDelayed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table: AgencyDelays (Chậm trễ xử lý)
CREATE TABLE AgencyDelays (
    DelayID SERIAL PRIMARY KEY,
    AgencyID INT REFERENCES Agencies(AgencyID) NOT NULL,
    ApplicationID INT REFERENCES Applications(ApplicationID) NOT NULL,
    DelayDuration INT NOT NULL,
    Reason TEXT NOT NULL,
    RecordedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: PublicNotifications (Thông báo công khai)
CREATE TABLE PublicNotifications (
    NotificationID SERIAL PRIMARY KEY,
    AgencyID INT REFERENCES Agencies(AgencyID) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    TargetArea INT REFERENCES Areas(AreaCode),
    SentDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiryDate TIMESTAMP
);

-- Table: MediaFiles (Tệp đính kèm hồ sơ)
CREATE TABLE MediaFiles (
    MediaFileID SERIAL PRIMARY KEY,
    ApplicationID INT REFERENCES Applications(ApplicationID) NOT NULL,
    FileType VARCHAR(50) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSize INT NOT NULL,
    UploadDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Description VARCHAR(255)
);

-- Table: PostCategories (Danh mục bài viết)
CREATE TABLE PostCategories (
    CategoryID SERIAL PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description VARCHAR(500),
    ParentCategoryID INT REFERENCES PostCategories(CategoryID)
);

-- Table: Posts (Bài viết)
CREATE TABLE Posts (
    PostID SERIAL PRIMARY KEY,
    CategoryID INT REFERENCES PostCategories(CategoryID) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    AuthorID INT REFERENCES Staff(StaffID) NOT NULL,
    PublishDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsPublished BOOLEAN NOT NULL DEFAULT TRUE,
    ViewCount INT NOT NULL DEFAULT 0
);

-- Table: MediaPostFiles (Tệp đính kèm bài viết)
CREATE TABLE MediaPostFiles (
    MediaPostFileID SERIAL PRIMARY KEY,
    PostID INT REFERENCES Posts(PostID) NOT NULL,
    FileType VARCHAR(50) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSize INT NOT NULL,
    UploadDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DisplayOrder INT NOT NULL DEFAULT 0
);

-- Table: CitizenRefreshToken
CREATE TABLE CitizenRefreshToken (
    RefreshTokenID SERIAL PRIMARY KEY,
    CitizenID INT REFERENCES Citizens(CitizenID) NOT NULL,
    Token VARCHAR(500) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    RevokedAt TIMESTAMP,
    IsRevoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table: StaffRefreshToken
CREATE TABLE StaffRefreshToken (
    RefreshTokenID SERIAL PRIMARY KEY,
    StaffID INT REFERENCES Staff(StaffID) NOT NULL,
    Token VARCHAR(500) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    RevokedAt TIMESTAMP,
    IsRevoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add indexes for performance
CREATE INDEX idx_citizens_area ON Citizens(AreaCode);
CREATE INDEX idx_applications_citizen ON Applications(CitizenID);
CREATE INDEX idx_applications_type ON Applications(ApplicationTypeID);
CREATE INDEX idx_applications_special_type ON Applications(SpecialApplicationTypeID);
CREATE INDEX idx_applications_agency ON Applications(CurrentAgencyID);
CREATE INDEX idx_staff_agency ON Staff(AgencyID);
CREATE INDEX idx_agencies_area ON Agencies(AreaCode);
CREATE INDEX idx_notifications_citizen ON Notifications(CitizenID);
CREATE INDEX idx_notifications_application ON Notifications(ApplicationID);
CREATE INDEX idx_processing_history_application ON ProcessingHistory(ApplicationID);
CREATE INDEX idx_processing_history_staff ON ProcessingHistory(StaffID);
CREATE INDEX idx_public_notifications_agency ON PublicNotifications(AgencyID);
CREATE INDEX idx_public_notifications_area ON PublicNotifications(TargetArea);
CREATE INDEX idx_media_files_application ON MediaFiles(ApplicationID);
CREATE INDEX idx_posts_category ON Posts(CategoryID);
CREATE INDEX idx_posts_author ON Posts(AuthorID);
CREATE INDEX idx_media_post_files_post ON MediaPostFiles(PostID);
CREATE INDEX idx_citizen_refresh_token_citizen ON CitizenRefreshToken(CitizenID);
CREATE INDEX idx_staff_refresh_token_staff ON StaffRefreshToken(StaffID);

-- Comment
COMMENT ON TABLE Areas IS 'Bảng lưu trữ thông tin khu vực địa lý (tỉnh, huyện, xã)';
COMMENT ON TABLE Citizens IS 'Bảng lưu trữ thông tin công dân';
COMMENT ON TABLE ApplicationTypes IS 'Bảng lưu trữ các loại hồ sơ';
COMMENT ON TABLE SpecialApplicationTypes IS 'Bảng lưu trữ các loại hồ sơ đặc biệt';
COMMENT ON TABLE Agencies IS 'Bảng lưu trữ thông tin cơ quan hành chính';
COMMENT ON TABLE Staff IS 'Bảng lưu trữ thông tin nhân viên, cán bộ';
COMMENT ON TABLE Applications IS 'Bảng lưu trữ hồ sơ đăng ký dịch vụ công';
COMMENT ON TABLE Notifications IS 'Bảng lưu trữ thông báo gửi đến công dân';
COMMENT ON TABLE ProcessingHistory IS 'Bảng lưu trữ lịch sử xử lý hồ sơ';
COMMENT ON TABLE AgencyDelays IS 'Bảng ghi nhận các trường hợp chậm trễ xử lý';
COMMENT ON TABLE PublicNotifications IS 'Bảng lưu trữ thông báo công khai';
COMMENT ON TABLE MediaFiles IS 'Bảng lưu trữ tệp đính kèm hồ sơ';
COMMENT ON TABLE PostCategories IS 'Bảng lưu trữ danh mục bài viết';
COMMENT ON TABLE Posts IS 'Bảng lưu trữ bài viết';
COMMENT ON TABLE MediaPostFiles IS 'Bảng lưu trữ tệp đính kèm bài viết';
COMMENT ON TABLE CitizenRefreshToken IS 'Bảng lưu trữ refresh token của công dân';
COMMENT ON TABLE StaffRefreshToken IS 'Bảng lưu trữ refresh token của nhân viên';

-- End the DO block
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'An error occurred: %', SQLERRM;
END;
$$;

-- Commit the transaction if everything is successful
COMMIT; 