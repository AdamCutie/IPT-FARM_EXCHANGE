# FarmExchange ASP.NET MVC Setup Instructions

This is a complete ASP.NET MVC conversion of the FarmExchange React application. Follow these steps to set up and run the application.

## Prerequisites

1. Visual Studio 2022 or later (Community, Professional, or Enterprise)
2. .NET 8.0 SDK
3. SQL Server 2019 or later (Express, Standard, or Enterprise)
4. SQL Server Management Studio (SSMS)

## Database Setup

### Step 1: Create Database in SSMS

1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Open a new query window
4. Run the following command to create the database:

```sql
CREATE DATABASE FarmExchangeDB;
GO
```

### Step 2: Execute Database Schema Script

1. In SSMS, make sure you're connected to your SQL Server instance
2. Open the file `SQL/CreateDatabase.sql`
3. Make sure the database `FarmExchangeDB` is selected in the dropdown
4. Execute the script (F5 or click Execute)
5. Verify all tables were created:
   - Profiles
   - Harvests
   - Messages
   - Transactions

## Application Setup

### Step 3: Configure Connection String

1. Open `appsettings.json`
2. Update the connection string if needed:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=FarmExchangeDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

**Connection String Options:**

- For local SQL Server: `Server=localhost` or `Server=(localdb)\\mssqllocaldb`
- For SQL Server Express: `Server=.\\SQLEXPRESS`
- For SQL Server with authentication: Replace `Trusted_Connection=True` with `User Id=yourUsername;Password=yourPassword`

### Step 4: Build and Run the Application

1. Open the solution in Visual Studio
2. Restore NuGet packages (right-click solution → Restore NuGet Packages)
3. Build the solution (Ctrl+Shift+B)
4. Run the application (F5 or click Start)

## Testing the Application

### Create Test Accounts

1. Navigate to the application (usually https://localhost:5001)
2. Click "Sign Up"
3. Create a Farmer account:
   - Full Name: John Farmer
   - Email: farmer@test.com
   - Password: Test123!
   - Account Type: Farmer/Gardener
   - Location: Springfield, IL
   - Phone: (555) 123-4567

4. Sign out and create a Buyer account:
   - Full Name: Jane Buyer
   - Email: buyer@test.com
   - Password: Test123!
   - Account Type: Buyer
   - Location: Springfield, IL
   - Phone: (555) 987-6543

### Test Features

#### As Farmer:
1. Login as farmer@test.com
2. Navigate to Dashboard
3. Click "Add New" or go to "Manage Harvests"
4. Create a harvest listing:
   - Title: Fresh Tomatoes
   - Category: Vegetables
   - Price: 5.99
   - Unit: kg
   - Quantity: 50
   - Description: Organic tomatoes freshly picked
5. View your harvest on the dashboard

#### As Buyer:
1. Login as buyer@test.com
2. Navigate to "Browse" from the header
3. Search for harvests
4. Filter by category
5. Click "Buy" on a harvest to make a purchase
6. Click "Message" to send a message to the farmer

#### Messages:
1. Click "Messages" in the header
2. Click "New Message"
3. Select a recipient
4. Enter subject and message
5. Send and view messages

#### Transactions:
1. Click on your profile → View Transactions
2. Filter by status (All, Pending, Completed, Cancelled)
3. (As Farmer) Complete or cancel pending transactions
4. View transaction history and totals

## Project Structure

```
FarmExchange.MVC/
├── Controllers/
│   ├── AccountController.cs       # Authentication (Login, SignUp, Logout)
│   ├── DashboardController.cs     # Main dashboard
│   ├── HarvestController.cs       # Harvest management (Browse, Create, Edit, Delete)
│   ├── MessageController.cs       # Messaging system
│   ├── TransactionController.cs   # Transaction management
│   └── HomeController.cs          # Landing page
├── Models/
│   ├── Profile.cs                 # User profile model
│   ├── Harvest.cs                 # Harvest listing model
│   ├── Message.cs                 # Message model
│   ├── Transaction.cs             # Transaction model
│   └── UserType.cs                # User type enum
├── ViewModels/
│   ├── LoginViewModel.cs          # Login form model
│   └── SignUpViewModel.cs         # Sign up form model
├── Views/
│   ├── Account/                   # Login and SignUp views
│   ├── Dashboard/                 # Dashboard view
│   ├── Harvest/                   # Browse, Manage, Create, Edit views
│   ├── Message/                   # Messages and Details views
│   ├── Transaction/               # Transaction history view
│   ├── Home/                      # Landing page
│   └── Shared/                    # Layout and shared views
├── Data/
│   └── FarmExchangeDbContext.cs   # Entity Framework context
├── SQL/
│   └── CreateDatabase.sql         # Database creation script
├── wwwroot/
│   ├── css/site.css               # Tailwind-inspired styles
│   └── js/site.js                 # Client-side scripts
├── Program.cs                     # Application startup
├── appsettings.json               # Configuration
└── FarmExchange.csproj            # Project file
```

## Features Comparison

This ASP.NET MVC version includes all features from the original React application:

### Authentication
- User registration (Farmer and Buyer accounts)
- Login/Logout
- Session management with cookies
- Password hashing with SHA256

### Dashboard
- Different views for Farmers and Buyers
- Statistics cards (Active Listings, Messages, Transactions)
- Recent harvests/transactions
- Quick actions

### Harvest Management (Farmers)
- Create new harvest listings
- Edit existing harvests
- Delete harvests
- View all harvests in grid layout

### Browse Harvests (All Users)
- Search by title, description, or farmer name
- Filter by category (Vegetables, Fruits, Herbs, Grains, Other)
- View harvest details
- Purchase harvests (Buyers)
- Message sellers

### Messaging
- Send messages to other users
- View inbox with sent and received messages
- Mark messages as read
- Reply to messages
- Compose new messages

### Transactions
- View transaction history
- Filter by status (Pending, Completed, Cancelled)
- Update transaction status (Farmers)
- View transaction statistics
- Calculate totals and revenue

### Styling
- Tailwind-inspired CSS (same look and feel as React version)
- Responsive design (mobile, tablet, desktop)
- Green color scheme matching the original
- Smooth transitions and hover effects

## Troubleshooting

### Database Connection Issues

If you get a connection error:
1. Verify SQL Server is running
2. Check the connection string in appsettings.json
3. Ensure the database exists
4. Test connection in SSMS

### Migration Issues

If you need to recreate the database:
1. Drop the database in SSMS: `DROP DATABASE FarmExchangeDB;`
2. Re-run the CreateDatabase.sql script

### Authentication Issues

If login doesn't work:
1. Clear browser cookies
2. Restart the application
3. Check if the user exists in the Profiles table

## Additional Notes

### Security Considerations
- Passwords are hashed using SHA256 (for production, consider using ASP.NET Identity with bcrypt)
- Cookie authentication with 7-day expiration
- HTTPS enforced in production
- Anti-forgery tokens on all forms

### Database Relationships
- One-to-Many: Profile → Harvests
- One-to-Many: Profile → Messages (as sender)
- One-to-Many: Profile → Messages (as recipient)
- One-to-Many: Harvest → Transactions
- Many-to-One: Transaction → Profile (buyer)
- Many-to-One: Transaction → Profile (seller)

### Future Enhancements
- Email verification
- Password reset functionality
- Profile editing
- Image upload for harvests
- Real-time notifications
- Payment integration
- Reviews and ratings

## Support

For issues or questions, refer to:
- ASP.NET MVC Documentation: https://learn.microsoft.com/en-us/aspnet/mvc/
- Entity Framework Core: https://learn.microsoft.com/en-us/ef/core/
- SQL Server Documentation: https://learn.microsoft.com/en-us/sql/
