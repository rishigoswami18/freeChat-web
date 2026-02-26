# freeChat Backend

The backend engine for freeChat, providing REST APIs, authentication, and integration with third-party services.

## 🚀 Key Features

- **Auth**: JWT-based authentication with secure cookie management and Firebase sync.
- **REST APIs**: Complete CRUD for Users, Posts, Stories, Couples, and Memberships.
- **Third-party Integrations**:
  - [Cloudinary](https://cloudinary.com/): Image and media management.
  - [Stream](https://getstream.io/): Real-time chat and video SDK support.
  - [Razorpay](https://razorpay.com/): Payment gateway for member subscriptions.
- **Machine Learning Integration**: Proxied requests to the ML service for emotion detection and translation.
- **Static Hosting**: Automatically serves the React frontend when running in production mode (`NODE_ENV=production`).

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file with:
   - `PORT`: (default 5001)
   - `MONGO_URI`: MongoDB connection string.
   - `JWT_SECRET_KEY`: Secret for JWT.
   - `STREAM_API_KEY`, `STREAM_API_SECRET`: Stream chat/video keys.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary config.
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Razorpay keys.
   - `ML_API_URL`: URL to the FastAPI service.

3. **Development**:
   ```bash
   npm start
   ```

## 🧱 Structure

- `src/controllers`: Core business logic for each route.
- `src/models`: Mongoose schemas for MongoDB.
- `src/routes`: Express route definitions.
- `src/middleware`: Auth and validation middleware.
- `src/lib`: External library wrappers (Cloudinary, Stream).
- `src/utils`: Helper functions (Translation, Emotions, Usernames).
