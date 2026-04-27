"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client with Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function uploadAvatar(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;
    const file = formData.get("file") as File;
    
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase Admin Upload Error:", error);
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new URL
    await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl: publicUrl }
    });

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Upload avatar error:", error);
    return { success: false, error: "Internal server error" };
  }
}

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
