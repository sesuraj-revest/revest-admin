import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authApi from "@/core/service/auth/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          console.log("first");

          const response = await authApi.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });
          console.log(response, "responseresponse");

          if (response?.accessToken) {
            // Return user with token attached for JWT callback
            return {
              ...response.user,
              name: response.user?.full_name,
              accessToken: response.accessToken,
              refreshToken: response.accessToken,
            };
          }
          return null;
        } catch (error) {
          console.log(error, "at nextauth");
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.roleId = (user as any).role_id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        // Add other user properties to the token if needed
        token.modules = (user as any).modules;
        token.outlets = (user as any).outlets;
        token.currentOutletId = (user as any).currentOutletId;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Sessionupdate", session);
      if (token && session.user) {
        // session.user.id = token.id as string;
        // Add other properties to the session
        (session.user as any).roleId = token.roleId;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
        (session.user as any).modules = token.modules;
        (session.user as any).outlets = token.outlets;
        (session.user as any).currentOutletId = token.currentOutletId;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || "sdfsdafvg",
});
