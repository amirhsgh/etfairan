const passport = require('passport');
const googletoken = require('passport-google-plus-token');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const googleConfig = {
    clientID: "xxxx", // Your client id
    clientSecret: "xxxx", // Your client secret
};
console.log("Hello");
const googleStrategy = new googletoken(
    googleConfig,
    async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await prisma.user.findFirst({
            where:{
                "google.id": profile.id
            }
        });
        console.log(user);
        if (!user) {
            const newUser = await prisma.user.create({
            googleid:profile.id,
            email: profile.emails[0].value
        });
        return done(null, newUser);
    }
        return done(null, user);
    } catch (e) {
        return done(e, false);
    }
});

passport.use(googleStrategy);
module.exports = {
    authGoogle:passport.authenticate("google-plus-token", {session: false})
}