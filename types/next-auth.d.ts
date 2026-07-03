import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      spotifyId: string | null;
      hasSpotify: boolean;
      provider: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username: string | null;
    spotifyId: string | null;
    hasSpotify: boolean;
    provider: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    username: string | null;
    spotifyId: string | null;
    hasSpotify: boolean;
    provider: string | null;
  }
}
