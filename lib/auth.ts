import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const DEFAULT_POST_LOGIN_REDIRECT = "/onboarding";

export function getSpotifySignInUrl(callbackUrl = DEFAULT_POST_LOGIN_REDIRECT) {
  return `/api/auth/signin/spotify?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

interface SpotifyProfile {
  id: string;
  display_name?: string;
  email?: string;
  images?: Array<{ url: string }>;
}

interface GoogleProfile {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "user-read-email user-read-private user-read-currently-playing user-read-playback-state user-top-read",
          show_dialog: true,
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: process.env.NODE_ENV === "development" || true,
  callbacks: {
    async signIn({ profile, account }) {
      if (!profile || !account) {
        return false;
      }

      try {
        if (account.provider === "google") {
          const googleProfile = profile as unknown as GoogleProfile;
          const googleId = googleProfile.sub;
          const email = googleProfile.email || null;
          const name = googleProfile.name || null;
          const avatarUrl = googleProfile.picture || null;

          const existingUser = await db.query.users.findFirst({
            where: email
              ? or(eq(users.googleId, googleId), eq(users.email, email))
              : eq(users.googleId, googleId),
          });

          if (existingUser) {
            await db
              .update(users)
              .set({
                googleId,
                email: existingUser.email || email,
                name: existingUser.name || name,
                avatarUrl: existingUser.avatarUrl || avatarUrl,
                authProvider: existingUser.authProvider || "google",
                updatedAt: new Date(),
              })
              .where(eq(users.id, existingUser.id));
          } else {
            await db.insert(users).values({
              googleId,
              email,
              name,
              avatarUrl,
              authProvider: "google",
            });
          }

          return true;
        }

        const spotifyProfile = profile as unknown as SpotifyProfile;
        const spotifyId = spotifyProfile.id;
        const email = spotifyProfile.email || null;
        const name = spotifyProfile.display_name;
        const avatarUrl = spotifyProfile.images?.[0]?.url || null;

        const accessToken = account.access_token;
        const refreshToken = account.refresh_token;
        const expiresAt = account.expires_at;

        if (!accessToken || expiresAt === undefined) {
          return false;
        }

        const tokenExpiresAt = new Date(expiresAt * 1000);

        const existingUser = await db.query.users.findFirst({
          where: email
            ? or(eq(users.spotifyId, spotifyId), eq(users.email, email))
            : eq(users.spotifyId, spotifyId),
        });

        if (existingUser) {
          await db
            .update(users)
            .set({
              spotifyId,
              accessToken,
              refreshToken: refreshToken || existingUser.refreshToken,
              tokenExpiresAt,
              email: existingUser.email || email,
              name: name || existingUser.name,
              avatarUrl: avatarUrl || existingUser.avatarUrl,
              authProvider: existingUser.authProvider || "spotify",
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id));
        } else {
          if (!refreshToken) {
            console.error("Novo usuário efetuando login sem refresh_token.");
            return false;
          }

          await db.insert(users).values({
            spotifyId,
            email,
            name: name || null,
            avatarUrl,
            accessToken,
            refreshToken,
            tokenExpiresAt,
            authProvider: "spotify",
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
          where:
            account.provider === "google"
              ? eq(users.googleId, account.providerAccountId)
              : eq(users.spotifyId, account.providerAccountId),
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.username = dbUser.username;
          token.spotifyId = dbUser.spotifyId;
          token.hasSpotify = !!dbUser.spotifyId;
          token.provider = dbUser.authProvider;
        }
      } else if (token.userId) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.userId as string),
        });

        if (dbUser) {
          token.username = dbUser.username;
          token.spotifyId = dbUser.spotifyId;
          token.hasSpotify = !!dbUser.spotifyId;
          token.provider = dbUser.authProvider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string | null;
        session.user.spotifyId = (token.spotifyId as string | null) ?? null;
        session.user.hasSpotify = !!token.hasSpotify;
        session.user.provider = (token.provider as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
