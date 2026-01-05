import { authClient } from "@/lib/auth/client";
import {
  ChangePasswordFormData,
  ForgotPasswordFormData,
  ProfileFormData,
  ResetPasswordFormData,
  SignInFormData,
  SignUpFormData
} from "./schema";
import { env } from "@/utils/env";

export async function signUpQuery(payload: SignUpFormData) {
  const { data, error } = await authClient.signUp.email(payload);
  if (error) throw error;
  return data;
}

export async function signInQuery(payload: SignInFormData) {
  const { data, error } = await authClient.signIn.email(payload);
  if (error) throw error;
  return data;
}

export async function signOutQuery() {
  const { data, error } = await authClient.signOut();
  if (error) throw error;
  return data;
}

export async function forgotPasswordQuery({ email }: ForgotPasswordFormData) {
  const { data, error } = await authClient.requestPasswordReset({
    email,
    redirectTo: env.NEXT_PUBLIC_BASE_URL + "/reset-password",
  });
  if (error) throw error;
  return data;
}

export async function resetPasswordQuery(
  { password, token }: ResetPasswordFormData & { token: string }
) {
  const { data, error } = await authClient.resetPassword({
    newPassword: password,
    token
  });
  if (error) throw error;
  return data;
}

export async function updateUserQuery({ name }: ProfileFormData) {
  const { data, error } = await authClient.updateUser({ name });
  if (error) throw error;
  return data;
}

export async function changePasswordQuery({
  currentPassword,
  newPassword
}: ChangePasswordFormData) {
  const { data, error } = await authClient.changePassword({
    currentPassword,
    newPassword,
    revokeOtherSessions: true
  });
  if (error) throw error;
  return data;
}
