"use server";

import { redirect } from "next/navigation";

export async function loginWithSpotify() {
  redirect("/api/auth/signin/spotify");
}

export async function logout() {
  redirect("/api/auth/signout");
}
