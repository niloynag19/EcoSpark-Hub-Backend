import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import ideaRoutes from './modules/idea/idea.routes';
import voteRoutes from './modules/vote/vote.routes';
import commentRoutes from './modules/comment/comment.routes';
import categoryRoutes from './modules/category/category.routes';
import userRoutes from './modules/user/user.routes';
import paymentRoutes from './modules/payment/payment.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import adminRoutes from './modules/admin/admin.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EcoSpark Hub API is running 🌿', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EcoSpark Hub API 🌿',
    status: 'Operational',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      ideas: '/api/ideas',
      users: '/api/users'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/ideas', voteRoutes);     // Vote routes nested under /api/ideas/:id/vote
app.use('/api', commentRoutes);         // Comment routes: /api/ideas/:id/comments & /api/comments/:id
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

export default app;
