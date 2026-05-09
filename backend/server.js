const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const tmdbRoutes = require('./routes/tmdb');

const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/community');
const playlistRoutes = require('./routes/playlists');

const app = express();

app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tmdb', tmdbRoutes);

app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/playlists', playlistRoutes);

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/filmybro';

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(`DB Connection Error: ${err.message}. Retrying in 3 seconds...`);
    setTimeout(connectDB, 3000);
  }
};
connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
