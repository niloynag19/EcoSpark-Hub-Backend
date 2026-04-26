# EcoSpark Hub

Hey there! Welcome to **EcoSpark Hub**, a platform I built to connect people who are passionate about sustainability with actionable, eco-friendly innovations. It's a place where you can share your green ideas, get feedback from the community, and even monetize your best solutions!

## 🌍 Live Demos

Check out the live applications here:
- **Frontend (Client)**: [https://eco-spark-hub-frontend-mu.vercel.app](https://eco-spark-hub-frontend-mu.vercel.app)
- **Backend (Server)**: [https://ecospark-hub-backend.onrender.com](https://ecospark-hub-backend.onrender.com)

---

## ✨ Features

I've packed this project with a bunch of cool features for both regular users and admins:

### For Users:
- **Share Ideas**: Easily submit your eco-friendly ideas with a problem statement, your proposed solution, and some images to showcase it.
- **Community Engagement**: You can upvote or downvote ideas and dive into discussions through nested comments (sort of like Reddit!).
- **Monetize**: Got a really premium idea? You can lock it behind a paywall and sell access using our secure payment system.
- **Dashboard & Profile**: Keep track of all your submitted ideas, see their status (draft, review, approved), and manage your public profile.

### For Admins:
- **Moderation Tools**: Admins review all submitted ideas. They can approve them for the public or reject them with feedback so the user can improve.
- **User Management**: Keep the community safe by managing user accounts and roles.
- **Analytics Overview**: A dashboard to see how the platform is growing—tracking users, ideas, and engagement.

---

## 💻 Technologies Used

This project is split into a **Client** (Frontend) and a **Server** (Backend). Here is the tech stack I used to bring it all to life:

### Client (Frontend)
- **Framework**: Next.js (App Router) for a snappy, SEO-friendly React application.
- **Language**: TypeScript for solid, bug-free code.
- **Styling**: Tailwind CSS to make everything look beautiful and responsive.
- **State & Data Fetching**: React Context and Axios.

### Server (Backend)
- **Environment**: Node.js with Express.js for a fast and scalable API.
- **Language**: TypeScript.
- **Database**: PostgreSQL (hosted on Neon) managed via **Prisma ORM**.
- **Authentication**: JWT (JSON Web Tokens) for secure login sessions.
- **Payments**: Stripe API to handle the monetization of premium ideas.
- **File Storage**: Cloudinary for uploading and optimizing images.

---

## 🚀 Setup Instructions

Want to run this locally on your own machine? Awesome! Here's how to get both the client and server up and running.

### Prerequisites
Make sure you have Node.js installed, along with an account for PostgreSQL (like Neon), Stripe (for test keys), and Cloudinary.

### 1. Clone the repository
First, grab the code:
```bash
git clone https://github.com/yourusername/ecospark-hub.git
cd ecospark-hub
```

### 2. Setting up the Server (Backend)
The backend powers the API, database connections, and authentication.

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add your environment variables:
```env
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_super_secret_key"
STRIPE_SECRET_KEY="your_stripe_secret"
CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_key"
CLOUDINARY_API_SECRET="your_cloudinary_secret"
```

Then, set up the database and start the server:
```bash
npx prisma db push
npx prisma generate
npm run dev
```
The server should now be running on `http://localhost:5000`.

### 3. Setting up the Client (Frontend)
Open a new terminal window and navigate to the client folder.

```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
```

Start the frontend development server:
```bash
npm run dev
```
You can now view the app in your browser at `http://localhost:3000`!

---

Thanks for checking out EcoSpark Hub! Let's build a greener future together. 🌱
