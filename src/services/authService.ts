import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IUser, UserRole, AuthProvider } from '../types/IUser';
import { RegisterInput, LoginInput } from '../types/auth';
import { AppError } from '../types/IError';
import { AuthTokens } from '../types/express';

export const registerUser = async (input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const { email, password, name } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create({
    email,
    password,
    name,
    role: UserRole.USER,
    provider: AuthProvider.LOCAL,
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { user, tokens: { accessToken, refreshToken } };
};

export const loginUser = async (input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { user, tokens: { accessToken, refreshToken } };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as { userId: string };

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    return user.generateAccessToken();
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { refreshToken: undefined });
};
