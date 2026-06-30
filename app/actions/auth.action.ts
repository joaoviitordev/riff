"use server";

import { redirect } from "next/navigation";
import { getSpotifySignInUrl } from "@/lib/auth";

export async function loginWithSpotify() {
  redirect(getSpotifySignInUrl());
}

export async function logout() {
  redirect("/api/auth/signout");
}
