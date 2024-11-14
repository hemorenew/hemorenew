import mongoose, { Schema } from 'mongoose';

const UltrasoundSchema = new Schema(
  {
    name: {
      type: String,
    },
    value: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Ultrasound ||
  mongoose.model('Ultrasound', UltrasoundSchema);
