import { pgTable, text, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").unique(),
  email: text("email").unique(),
  name: text("name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),

  spotifyId: text("spotify_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),

  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const follows = pgTable("follows", {
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.followerId, table.followingId] })
]);

export const nowPlaying = pgTable("now_playing", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  trackId: text("track_id"),
  trackName: text("track_name"),
  artist: text("artist"),
  albumArt: text("album_art"),
  isPlaying: boolean("is_playing").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  nowPlaying: one(nowPlaying, {
    fields: [users.id],
    references: [nowPlaying.userId],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const nowPlayingRelations = relations(nowPlaying, ({ one }) => ({
  user: one(users, {
    fields: [nowPlaying.userId],
    references: [users.id],
  }),
}));
