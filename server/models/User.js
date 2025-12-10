const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
      // Embedded favorites data. Denormalization for performance
    favorites: [
      {
        cityName: {
          type: String,
          required: true,
        },
        country: String,
        lat: {
          type: Number,
          required: true,
        },
        lon: {
          type: Number,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    // Automatic timestamps (createdAt, updatedAt)
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
