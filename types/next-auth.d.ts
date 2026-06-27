import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      spotifyId: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username: string | null;
    spotifyId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    username: string | null;
    spotifyId: string;
  }
}
