/*
  FarmExchange Database Schema for SQL Server

  This script creates the complete database schema for the FarmExchange platform.
  Execute this in SQL Server Management Studio (SSMS).

  Instructions:
  1. Open SQL Server Management Studio
  2. Connect to your SQL Server instance
  3. Create a new database: CREATE DATABASE FarmExchangeDB;
  4. Select FarmExchangeDB as the active database
  5. Execute this script
*/

USE FarmExchangeDB;
GO

-- Drop existing tables if they exist (in correct order due to foreign keys)
IF OBJECT_ID('Transactions', 'U') IS NOT NULL DROP TABLE Transactions;
IF OBJECT_ID('Messages', 'U') IS NOT NULL DROP TABLE Messages;
IF OBJECT_ID('Harvests', 'U') IS NOT NULL DROP TABLE Harvests;
IF OBJECT_ID('Profiles', 'U') IS NOT NULL DROP TABLE Profiles;
GO

-- Create Profiles Table
CREATE TABLE Profiles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    UserType NVARCHAR(50) NOT NULL CHECK (UserType IN ('Buyer', 'Farmer')),
    Location NVARCHAR(255) NULL,
    Phone NVARCHAR(20) NULL,
    Bio NVARCHAR(1000) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Create Harvests Table
CREATE TABLE Harvests (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL DEFAULT 0,
    Unit NVARCHAR(20) NOT NULL DEFAULT 'kg',
    QuantityAvailable DECIMAL(10,2) NOT NULL DEFAULT 0,
    ImageUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'available' CHECK (Status IN ('available', 'sold_out', 'archived')),
    HarvestDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Harvests_Profiles FOREIGN KEY (UserId)
        REFERENCES Profiles(Id) ON DELETE CASCADE
);
GO

-- Create Messages Table
CREATE TABLE Messages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SenderId UNIQUEIDENTIFIER NOT NULL,
    RecipientId UNIQUEIDENTIFIER NOT NULL,
    HarvestId UNIQUEIDENTIFIER NULL,
    Subject NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderId)
        REFERENCES Profiles(Id),
    CONSTRAINT FK_Messages_Recipient FOREIGN KEY (RecipientId)
        REFERENCES Profiles(Id),
    CONSTRAINT FK_Messages_Harvest FOREIGN KEY (HarvestId)
        REFERENCES Harvests(Id) ON DELETE SET NULL
);
GO

-- Create Transactions Table
CREATE TABLE Transactions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    HarvestId UNIQUEIDENTIFIER NOT NULL,
    BuyerId UNIQUEIDENTIFIER NOT NULL,
    SellerId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (Status IN ('pending', 'completed', 'cancelled')),
    TransactionDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_Transactions_Harvest FOREIGN KEY (HarvestId)
        REFERENCES Harvests(Id),
    CONSTRAINT FK_Transactions_Buyer FOREIGN KEY (BuyerId)
        REFERENCES Profiles(Id),
    CONSTRAINT FK_Transactions_Seller FOREIGN KEY (SellerId)
        REFERENCES Profiles(Id)
);
GO

-- Create Indexes for better query performance
CREATE INDEX IX_Profiles_Email ON Profiles(Email);
CREATE INDEX IX_Harvests_UserId ON Harvests(UserId);
CREATE INDEX IX_Harvests_Status ON Harvests(Status);
CREATE INDEX IX_Harvests_Category ON Harvests(Category);
CREATE INDEX IX_Messages_SenderId ON Messages(SenderId);
CREATE INDEX IX_Messages_RecipientId ON Messages(RecipientId);
CREATE INDEX IX_Transactions_BuyerId ON Transactions(BuyerId);
CREATE INDEX IX_Transactions_SellerId ON Transactions(SellerId);
CREATE INDEX IX_Transactions_HarvestId ON Transactions(HarvestId);
GO

-- Create trigger to update UpdatedAt for Profiles
CREATE TRIGGER TR_Profiles_UpdatedAt
ON Profiles
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Profiles
    SET UpdatedAt = GETUTCDATE()
    FROM Profiles p
    INNER JOIN inserted i ON p.Id = i.Id;
END;
GO

-- Create trigger to update UpdatedAt for Harvests
CREATE TRIGGER TR_Harvests_UpdatedAt
ON Harvests
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Harvests
    SET UpdatedAt = GETUTCDATE()
    FROM Harvests h
    INNER JOIN inserted i ON h.Id = i.Id;
END;
GO

PRINT 'FarmExchange database schema created successfully!';
GO
