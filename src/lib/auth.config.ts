import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isOnLogin = path === "/admin/login";
      const isOnAdmin = path.startsWith("/admin");

      if (isOnAdmin && !isOnLogin) {
        return isLoggedIn;
      }
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
