import mongoose, { Schema } from 'mongoose';

const PatientSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    ci: {
      type: String,
      trim: true,
      maxlength: [20, 'Plate cannot be more than 20 characters'],
      unique: true,
    },
    birthDate: {
      type: String,
      trim: true,
      maxlength: [20, 'Plate cannot be more than 20 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [10, 'Phone cannot be more than 10 characters'],
      unique: true,
    },
    dryWeight: {
      type: Number,
      required: true,
    },
    attended: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export default mongoose.models.Patient ||
  mongoose.model('Patient', PatientSchema);
