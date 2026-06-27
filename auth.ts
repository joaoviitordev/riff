import NextAuth, { NextAuthConfig } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SpotifyProfile {
  id: string;
  display_name?: string;
  email?: string;
  images?: Array<{ url: string }>;
}

export const authConfig: NextAuthConfig = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private,user-read-currently-playing,user-read-playback-state,user-top-read&show_dialog=true",
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (!profile || !account) {
        return false;
      }

      const spotifyProfile = profile as unknown as SpotifyProfile;
      const spotifyId = spotifyProfile.id;
      const email = spotifyProfile.email;
      const name = spotifyProfile.display_name;
      const avatarUrl = spotifyProfile.images?.[0]?.url || null;

      const accessToken = account.access_token;
      const refreshToken = account.refresh_token;
      const expiresAt = account.expires_at;

      if (!accessToken || expiresAt === undefined) {
        return false;
      }

      const tokenExpiresAt = new Date(expiresAt * 1000);

      try {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.spotifyId, spotifyId),
        });

        if (existingUser) {
          await db
            .update(users)
            .set({
              accessToken,
              refreshToken: refreshToken || existingUser.refreshToken,
              tokenExpiresAt,
              name: name || existingUser.name,
              avatarUrl: avatarUrl || existingUser.avatarUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.spotifyId, spotifyId));
        } else {
          if (!refreshToken) {
            console.error("Novo usuário efetuando login sem refresh_token.");
            return false;
          }

          await db.insert(users).values({
            spotifyId,
            email: email || null,
            name: name || null,
            avatarUrl,
            accessToken,
            refreshToken,
            tokenExpiresAt,
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.spotifyId, account.providerAccountId),
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.username = dbUser.username;
          token.spotifyId = dbUser.spotifyId;
        }
      } else if (token.spotifyId) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.spotifyId, token.spotifyId as string),
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.username = dbUser.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.spotifyId = token.spotifyId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
