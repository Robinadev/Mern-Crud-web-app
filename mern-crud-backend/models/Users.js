import mongoose from 'mongoose';
//import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    // validate: {
    //   validator: validator.isEmail,
    //   message: 'Please provide a valid email address'
    // }
  },
  age: {
    type: Number,
    min: [18, 'Age must be at least 18'],
    max: [120, 'Age must be less than 120'],
    default: 18
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true,
      maxlength: [100, 'Street cannot exceed 100 characters']
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      default: 'USA',
      trim: true
    },
    zipCode: {
      type: String,
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid zip code']
    }
  },
  phone: {
    type: String,
    trim: true,
    // validate: {
    //   validator: function(v) {
    //     return /^[\+]?[1-9][\d]{0,15}$/.test(v);
    //   },
    //   message: 'Please provide a valid phone number'
    // }
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=Unknown&background=random'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state || ''} ${this.address.zipCode || ''}, ${this.address.country}`.trim();
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Instance method
userSchema.methods.getUserInfo = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    status: this.status,
    role: this.role,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;