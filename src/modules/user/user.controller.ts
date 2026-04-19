import { Request, Response } from 'express';
import prisma from '../../config/db';
import cloudinary from '../../config/cloudinary';
import { hashPassword } from '../../utils/password';
import { sendSuccess, sendError } from '../../utils/response';

// PUT /api/users/profile — Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, bio } = req.body;

    // Upload avatar if provided
    let avatarUrl: string | undefined;
    if (req.file) {
      const result = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ecospark-hub/avatars', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        );
        stream.end(req.file!.buffer);
      });
      avatarUrl = result;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl) updateData.avatar = avatarUrl;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return sendError(res, 'Failed to update profile');
  }
};

// PUT /api/users/change-password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Both current and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('ChangePassword error:', error);
    return sendError(res, 'Failed to change password');
  }
};
