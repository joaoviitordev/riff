import {
  authOptions,
  DEFAULT_POST_LOGIN_REDIRECT,
  getSpotifySignInUrl,
} from "../lib/auth";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import assert from "assert";
import type { Account, User, Profile } from "next-auth";

const TEST_SPOTIFY_ID = "test_spotify_id_unique_12345";

async function runTests() {
  console.log("🚀 Iniciando testes de integração de Autenticação...\n");

  const signInCallback = authOptions.callbacks?.signIn;
  if (!signInCallback) {
    throw new Error("Callback signIn não encontrada no authOptions");
  }

  const cleanUp = async () => {
    await db.delete(users).where(eq(users.spotifyId, TEST_SPOTIFY_ID));
  };

  try {
    // Garantir ambiente limpo
    await cleanUp();

    // ----------------------------------------------------
    // Caso de Teste 1: Novo usuário logando com dados completos (deve ter sucesso)
    // ----------------------------------------------------
    console.log("1. Testando login de novo usuário com dados completos...");
    const profileNewUser = {
      id: TEST_SPOTIFY_ID,
      display_name: "Usuário de Teste",
      email: "teste@riff.com",
      images: [{ url: "https://example.com/avatar.jpg" }],
    };

    const accountNewUser = {
      provider: "spotify",
      type: "oauth" as const,
      providerAccountId: TEST_SPOTIFY_ID,
      access_token: "mock_access_token_1",
      refresh_token: "mock_refresh_token_1",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    const signInNewUserResult = await signInCallback({
      profile: profileNewUser as unknown as Profile,
      account: accountNewUser as unknown as Account,
      user: {} as unknown as User,
      credentials: {},
    });

    assert.strictEqual(
      signInNewUserResult,
      true,
      "Novo login de usuário deveria retornar true",
    );

    // Verificar se o usuário foi persistido no banco
    const userInDb = await db.query.users.findFirst({
      where: eq(users.spotifyId, TEST_SPOTIFY_ID),
    });

    assert.ok(userInDb, "O usuário deveria ter sido persistido no banco");
    assert.strictEqual(userInDb.name, "Usuário de Teste");
    assert.strictEqual(userInDb.accessToken, "mock_access_token_1");
    assert.strictEqual(userInDb.refreshToken, "mock_refresh_token_1");
    console.log("✅ Sucesso: Novo usuário logado e persistido corretamente.");

    // ----------------------------------------------------
    // Caso de Teste 2: Novo usuário logando SEM refresh_token (deve falhar)
    // ----------------------------------------------------
    console.log("\n2. Testando login de novo usuário sem refresh_token...");
    // Deletar o usuário primeiro para fingir que ele é novo de novo
    await cleanUp();

    const accountNoRefreshToken = {
      ...accountNewUser,
      refresh_token: undefined,
    };

    const signInNoRefreshResult = await signInCallback({
      profile: profileNewUser as unknown as Profile,
      account: accountNoRefreshToken as unknown as Account,
      user: {} as unknown as User,
      credentials: {},
    });

    assert.strictEqual(
      signInNoRefreshResult,
      false,
      "Login de novo usuário sem refresh_token deveria retornar false",
    );

    const userInDbNoRefresh = await db.query.users.findFirst({
      where: eq(users.spotifyId, TEST_SPOTIFY_ID),
    });
    assert.strictEqual(
      userInDbNoRefresh,
      undefined,
      "O usuário sem refresh_token não deveria ser inserido no banco",
    );
    console.log(
      "✅ Sucesso: Login rejeitado como esperado quando falta refresh_token.",
    );

    // ----------------------------------------------------
    // Caso de Teste 3: Usuário existente logando SEM refresh_token (deve reutilizar o anterior)
    // ----------------------------------------------------
    console.log(
      "\n3. Testando login de usuário existente sem fornecer novo refresh_token...",
    );
    // 3a. Criar o usuário novamente
    await signInCallback({
      profile: profileNewUser as unknown as Profile,
      account: accountNewUser as unknown as Account,
      user: {} as unknown as User,
      credentials: {},
    });

    // 3b. Logar de novo simulando retorno sem refresh_token do Spotify
    const accountExistingNoRefresh = {
      ...accountNewUser,
      access_token: "mock_access_token_atualizado",
      refresh_token: undefined, // Sem fornecer refresh_token
      expires_at: Math.floor(Date.now() / 1000) + 7200,
    };

    const signInExistingResult = await signInCallback({
      profile: profileNewUser as unknown as Profile,
      account: accountExistingNoRefresh as unknown as Account,
      user: {} as unknown as User,
      credentials: {},
    });

    assert.strictEqual(
      signInExistingResult,
      true,
      "Login de usuário existente sem refresh_token deveria retornar true",
    );

    const updatedUserInDb = await db.query.users.findFirst({
      where: eq(users.spotifyId, TEST_SPOTIFY_ID),
    });

    assert.ok(updatedUserInDb, "O usuário deveria continuar existindo");
    assert.strictEqual(
      updatedUserInDb.accessToken,
      "mock_access_token_atualizado",
      "O access token deveria ter sido atualizado",
    );
    assert.strictEqual(
      updatedUserInDb.refreshToken,
      "mock_refresh_token_1",
      "O refresh token antigo deveria ter sido mantido",
    );
    console.log(
      "✅ Sucesso: Usuário existente logado com sucesso reutilizando o refresh_token anterior.",
    );

    assert.strictEqual(
      DEFAULT_POST_LOGIN_REDIRECT,
      "/onboarding",
      "A rota pós-login padrão deve levar para onboarding",
    );
    assert.strictEqual(
      getSpotifySignInUrl(),
      "/api/auth/signin/spotify?callbackUrl=%2Fonboarding",
      "A URL de login do Spotify deve incluir callbackUrl para onboarding",
    );

    console.log("\n🎉 Todos os testes de autenticação passaram com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro durante a execução dos testes:");
    console.error(error);
    process.exit(1);
  } finally {
    // Limpeza final do banco
    await cleanUp();
    process.exit(0);
  }
}

runTests();
