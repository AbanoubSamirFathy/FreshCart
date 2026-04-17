import { apiServices } from "@/app/services/api";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: {
          label: "Name",
          type: "text",
          placeholder: "John Smith",
        },
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "**********",
        },
        rePassword: {
          label: "Confirm Password",
          type: "password",
          placeholder: "**********",
        },
        phone: {
          label: "Phone Number",
          type: "text",
          placeholder: "123-456-7890",
        },
      },
      async authorize(credentials) {
        const response = await apiServices.signin(
          credentials?.email ?? "",
          credentials?.password ?? "",
        );
        if (response.message == "success") {
          return {
            id: response.user.email,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
            token: response.token,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.user.role = token.role as string;
      session.user.token = token.token as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
