import { type GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/src/app/api/auth/[...nextauth]/route'

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return await getServerSession(ctx.req, ctx.res, authOptions)
}
