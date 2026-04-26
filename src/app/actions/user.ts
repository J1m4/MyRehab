"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  height?: number;
  weight?: number;
  birthday?: string;
  gender?: string;
  location?: string;
  timezone?: string;
  profilePictureUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      height: true,
      weight: true,
      birthday: true,
      gender: true,
      location: true,
      timezone: true,
      profilePictureUrl: true,
      role: true,
      email: true,
      name: true,
    }
  });
}
