import mongoose, { Schema } from 'mongoose';

const FlowSchema = new Schema(
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

export default mongoose.models.Flow || mongoose.model('Flow', FlowSchema);
