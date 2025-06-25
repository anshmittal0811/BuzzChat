// lib/auth.ts
import { GetServerSidePropsContext } from 'next';

export const requireAuth = (ctx: GetServerSidePropsContext) => {
 const token = ctx.req.cookies.token;
 if (!token) {
   return {
     redirect: {
       destination: '/login',
       permanent: false,
     },
   };
 }
 return { props: {} };
};