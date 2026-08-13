export interface OuvindoFeed {
  trackName: string | null;
  artist: string | null;
  albumArt: string | null;
  isPlaying: boolean;
  updatedAt: string;
}

export interface ItemFeed {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  temSpotify: boolean;
  ouvindo: OuvindoFeed | null;
}
