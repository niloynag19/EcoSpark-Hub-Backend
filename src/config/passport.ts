import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import prisma from './db';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
