import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🌿 ================================================
  🌿  EcoSpark Hub API Server
  🌿  Running on: http://localhost:${PORT}
  🌿  Environment: ${process.env.NODE_ENV || 'development'}
  🌿 ================================================
  `);
});
