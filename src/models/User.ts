import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserRole, AuthProvider } from '../types/IUser';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    providerId: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ provider: 1, providerId: 1 });

// Hash password before saving (only for local auth)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error; // Re-throw the error for Mongoose to catch
    }
    throw new Error('An unknown error occurred during password hashing'); // Throw a new error for unknown types
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function (): string {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'access_secret', {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  } as jwt.SignOptions);
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    userId: this._id.toString(),
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  } as jwt.SignOptions);
};

export const User = mongoose.model<IUser>('User', userSchema);
