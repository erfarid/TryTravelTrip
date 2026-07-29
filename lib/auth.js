import NextAuth from "next-auth";
import MongoDBAdapter from "./db/MongoDBAdapter";
import authConfig from "../auth.config";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createOneDoc } from "./db/createOperationDB";
import { getOneDoc } from "./db/getOperationDB";
import { deleteOneDoc } from "./db/deleteOperationDB";
import mongoose from "mongoose";
import { strToObjectId } from "./db/utilsDB";

const hasDatabase = Boolean(MongoDBAdapter && process.env.MONGODB_URI);

const nextAuthOptions = {
  ...authConfig,
  cookies: {
    sessionToken: {
      name: "authjs.session_token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  session: {
    strategy: hasDatabase ? "database" : "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  ...(hasDatabase && { adapter: MongoDBAdapter }),
  providers: [
    FacebookProvider,
    GoogleProvider,
    AppleProvider,
    CredentialProvider(credentialProviderConfig()),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (hasDatabase && account?.provider === "credentials" && user) {
        const expires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
        const sessionToken = randomUUID();
        const session = await createOneDoc("Session", {
          sessionToken,
          userId: new mongoose.Types.ObjectId(user._id),
          expires,
        });

        token.sessionId = session.sessionToken;
      }
      return token;
    },

    async session({ session, user, token }) {
      if (user) {
        session.user = { id: user.id, email: user.email };
      } else if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    async signOut({ session }) {
      if (hasDatabase && session?.sessionToken) {
        await deleteOneDoc("Session", { sessionToken: session.sessionToken });
      }
    },
  },
};

const { handlers, auth, signIn, signOut } = NextAuth(nextAuthOptions);

async function isLoggedIn() {
  return !!(await auth())?.user;
}

function credentialProviderConfig() {
  return {
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!hasDatabase) return null;

      const userDetails = await getOneDoc(
        "User",
        { email: credentials.email.trim() },
        ["userDetails"],
        false,
      );
      if (!userDetails || !Object.keys(userDetails).length) return null;

      const userId = strToObjectId(userDetails._id);
      const account = await getOneDoc(
        "Account",
        { userId, provider: "credentials" },
        ["userAccount"],
        false,
      );
      if (!account?.password) return null;

      return bcrypt.compareSync(credentials.password, account.password)
        ? userDetails
        : null;
    },
  };
}

export { handlers, auth, signIn, signOut, isLoggedIn };
