import NextAuth from 'next-auth'
import type { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import GoogleProvider from 'next-auth/providers/google'

import { env } from '@/src/env/server.mjs'
import { prisma } from '@/src/server/db'

export const authOptions: AuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(prisma),
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
