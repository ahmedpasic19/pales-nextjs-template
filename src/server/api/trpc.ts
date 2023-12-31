import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session } from 'next-auth'

import { getServerAuthSession } from '../auth'
import { prisma } from '../db'

type CreateContextOptions = {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  }
}

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res })

  return createInnerTRPCContext({
    session,
  })
}

import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  // define youre admin logic
  const isAdmin = !ctx.session?.user

  if (!ctx.session || !ctx.session.user || !isAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(adminMiddleware)
