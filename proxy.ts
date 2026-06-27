import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const username = req.auth?.user?.username;
  const nextUrl = req.nextUrl;

  const isProfilePage = nextUrl.pathname.startsWith("/profile");
  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding");
  const isLoginPage = nextUrl.pathname.startsWith("/login");

  if (!isLoggedIn && (isProfilePage || isOnboardingPage)) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && !username && !isOnboardingPage && !isLoginPage) {
    return Response.redirect(new URL("/onboarding", nextUrl));
  }

  if (isLoggedIn && username && (isLoginPage || isOnboardingPage)) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)"],
};
