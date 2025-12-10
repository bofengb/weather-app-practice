import mongoose, { Schema, Model } from 'mongoose';
import type { ISearchHistoryDocument } from '../types/index.js';

const SearchHistorySchema = new Schema<ISearchHistoryDocument>(
  {
    // Referenced relationship with User
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries by user
    },
    // Embedded city data. Denormalization for performance
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
    // Weather data snapshot at time of search
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    weatherCondition: String,
    weatherIcon: String,
  },
  {
    // Automatic timestamps (createdAt, updatedAt)
    timestamps: true,
  }
);

// Compound index for efficient querying by user and date
SearchHistorySchema.index({ userId: 1, createdAt: -1 });

// Virtual property
SearchHistorySchema.virtual('searchAge').get(function (
  this: ISearchHistoryDocument
) {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return diffHours;
});

// Ensure virtuals are included in JSON
SearchHistorySchema.set('toJSON', { virtuals: true });

const SearchHistoryModel: Model<ISearchHistoryDocument> =
  mongoose.model<ISearchHistoryDocument>('SearchHistory', SearchHistorySchema);

export default SearchHistoryModel;
