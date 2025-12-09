
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (credentials.password === process.env.NEXTAUTH_SECRET) { // Simple "admin" password check against secret
                    return { id: '1', name: 'Admin', email: 'admin@example.com' };
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    }
});
