import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
    },
    ci: {
      type: String,
      trim: true,
      maxlength: [20, 'Plate cannot be more than 20 characters'],
      unique: true,
    },
    profession: {
      type: String,
      trim: true,
      maxlength: [100, 'Profession cannot be more than 100 characters'],
      unique: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [10, 'Phone cannot be more than 10 characters'],
      unique: true,
    },
    user: {
      type: String,
      trim: true,
      maxlength: [40, 'User cannot be more than 40 characters'],
      unique: true,
    },
    password: {
      type: String,
      maxlength: [60, 'Plate cannot be more than 40 characters'],
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
