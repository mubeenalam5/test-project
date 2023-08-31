export const jwt_config = {
    secret: process.env.JWT_SECRET || 'topSecret',
    signOptions: {
        expiresIn: +process.env.JWT_EXPIRE_IN || 864000,
    }
};
