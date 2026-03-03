# Auth System - Modern Authentication & Profile Management

A comprehensive authentication system with profile management, social media integration, and real-time features.

## 🚀 Features

### 🔐 Authentication
- **User Registration** with automatic username generation
- **Secure Login** with JWT tokens
- **Password Reset** functionality
- **Token Management** with automatic expiration handling
- **Protected Routes** with authentication guards

### 👤 Profile Management
- **Profile Photo Upload** with image validation
- **Auto-Generated Username** from name/email
- **Profile Editing** with validation
- **Online Status** tracking and display
- **Social Media Links** (GitHub, Twitter, LinkedIn, Website)
- **Location & Bio** management
- **User ID Management** with change history

### 🎨 UI/UX Features
- **Modern Dashboard** with glass morphism design
- **Responsive Design** for mobile and desktop
- **Real-time Updates** without page refresh
- **Loading States** with proper error handling
- **Smooth Animations** and transitions

### � Mobile Responsive
- **Mobile Menu** with hamburger navigation
- **Touch-Friendly** interface
- **Adaptive Layout** for all screen sizes

### Frontend (Client)
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend (Server)
- **Node.js** + **Express.js**
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** for authentication
- **bcrypt** for password hashing
- **dotenv** for environment variables
- **express-validator** for input validation

## 📁 Project Structure

```
Auth/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   └── index.js        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── .env               # Environment variables
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### 1. Database Setup

1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE authdb;
   ```
3. Create a user (optional but recommended):
   ```sql
   CREATE USER authuser WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE authdb TO authuser;
   ```

### 2. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://authuser:yourpassword@localhost:5432/authdb?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## 🎯 Features

### Authentication System
- ✅ User Registration with validation
- ✅ User Login with remember me
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ Automatic logout on token expiration

### Frontend Features
- ✅ Modern glass morphism UI design
- ✅ Responsive layout (mobile & desktop)
- ✅ Dark mode toggle
- ✅ Form validation with error messages
- ✅ Loading states and spinners
- ✅ Toast notifications
- ✅ Password visibility toggle
- ✅ Protected dashboard with user info

### Backend Features
- ✅ RESTful API endpoints
- ✅ Input validation and sanitization
- ✅ Error handling
- ✅ CORS configuration
- ✅ Security middleware
- ✅ Database migrations

## 📡 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx123...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security Features

- **Password Hashing**: Using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation with express-validator
- **CORS Protection**: Configured for specific frontend URL
- **Error Handling**: Proper error responses without sensitive information
- **Token Expiration**: Configurable JWT expiration time

## 🎨 UI/UX Features

- **Glass Morphism Design**: Modern, elegant UI with backdrop blur effects
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works perfectly on all device sizes
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Visual feedback during API calls
- **Toast Notifications**: Non-intrusive success/error messages
- **Form Validation**: Real-time validation feedback

## 🚀 Deployment

### Backend Deployment (Heroku Example)

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set DATABASE_URL="your-production-db-url"
   heroku config:set JWT_SECRET="your-production-jwt-secret"
   heroku config:set NODE_ENV=production
   ```
5. Deploy: `git push heroku main`
6. Run migrations: `heroku run npm run prisma:migrate`

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables for API URL

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/authdb?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## 🧪 Testing

### API Testing with Postman/cURL

1. **Register User**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'
   ```

2. **Login User**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"john@example.com","password":"Password123"}'
   ```

3. **Get User Info**:
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
   -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database exists

2. **Prisma Migration Error**:
   - Run `npx prisma generate`
   - Check database connection
   - Reset database if needed: `npx prisma migrate reset`

3. **CORS Error**:
   - Verify FRONTEND_URL in .env
   - Check both servers are running

4. **JWT Token Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser localStorage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the development team.

---

**Happy Coding! 🎉**
