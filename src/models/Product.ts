import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    required: false,
  },
  price: {
    type: Number,
    required: [true, 'Le prix du produit est requis'],
    min: [0, 'Le prix ne peut pas être négatif'],
  },
  image: {
    type: String,
    required: [true, 'L\'image du produit est requise'],
  },
  category: {
    type: String,
    required: [true, 'La catégorie du produit est requise'],
  },
  stock: {
    type: Number,
    required: [true, 'Le stock du produit est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
  },
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