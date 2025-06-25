import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, {
  timestamps: true,
  versionKey: false,
  collection: 'categories',
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category; 