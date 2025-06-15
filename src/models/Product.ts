import mongoose from 'mongoose';

const colorVariationSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  hasColorVariations: {
    type: Boolean,
    default: false,
  },
  colorVariations: [colorVariationSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  strict: true,
  versionKey: false,
  collection: 'products' // Explicitly set collection name
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Prevent accidental collection drops
mongoose.set('strictQuery', true);

// Check if model exists before creating a new one
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 