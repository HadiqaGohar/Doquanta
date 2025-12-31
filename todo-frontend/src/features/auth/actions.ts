"use server";

import { auth } from "@/lib/auth/server";
import {
  ChangePasswordFormData,
  ForgotPasswordFormData,
  ProfileFormData,
  ResetPasswordFormData,
  SignInFormData,
  SignUpFormData
} from "./schema";
import { headers } from "next/headers";
import { env } from "@/utils/env";


export async function signUpAction({ name, email, password, confirmPassword }: SignUpFormData) {
  return await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      rememberMe: true
    }
  })
}


export async function signInAction({ email, password }: SignInFormData) {
  return await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
}

export async function signOutAction() {
  return await auth.api.signOut({
    headers: await headers(),
  });
}

export async function forgotPasswordAction({ email }: ForgotPasswordFormData) {
  return await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: env.NEXT_PUBLIC_BASE_URL + "/reset-password",
    },
    headers: await headers(),
  })
}

export async function resetPasswordAction(
  { password, token }: ResetPasswordFormData & { token: string }
) {
  return await auth.api.resetPassword({
    body: {
      newPassword: password,
      token
    },
    headers: await headers(),
  })
}

export async function updateUserAction({ name }: ProfileFormData) {
  return await auth.api.updateUser({
    body: { name },
    headers: await headers(),
  })
}

export async function changePasswordAction({ currentPassword, newPassword }: ChangePasswordFormData) {
  return await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: await headers(),
  })
}
