"use server";
import { AxiosError } from "axios";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import authApi from "@/core/service/auth/auth";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginAction(credentials: any) {
  try {
    await signIn("credentials", {
      ...credentials,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials", errord: error };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error; // Rethrow redirect error
  }
}

export async function RegisterAction(credentials: any) {
  try {
    const data = await authApi.register(credentials);
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    } else if (error instanceof AxiosError) {
      return {
        error: error?.response?.data?.message || "Something went wrong",
      };
    }
  }
}
