"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function signUp(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: Role;
  token?: string;
}) {
  try {
    const { email: rawEmail, firstName, lastName, password, token, role: selectedRole } = data;
    const email = rawEmail.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let role: Role = selectedRole || Role.THERAPIST; 
    let therapistId: string | null = null;

    if (token) {
      const invite = await prisma.inviteToken.findUnique({
        where: { token },
      });

      if (!invite || invite.expiresAt < new Date()) {
        return { success: false, error: "Invalid or expired token" };
      }

      role = Role.CLIENT;
      therapistId = invite.therapistId;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`, // Maintain name field for backwards compatibility
        firstName,
        lastName,
        passwordHash,
        role,
      },
    });

    if (therapistId) {
      await prisma.clientTherapist.create({
        data: {
          therapistId,
          clientId: user.id,
        },
      });

      // Delete the token after use
      await prisma.inviteToken.delete({
        where: { token },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Internal server error" };
  }
}
