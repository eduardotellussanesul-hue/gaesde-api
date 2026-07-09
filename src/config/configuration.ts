function resolveDatabaseUri(): string {
  const databaseUri = process.env.MONGODB_URI;
  const isServerlessRuntime =
    process.env.NETLIFY === 'true' ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT);

  if (databaseUri) {
    return databaseUri;
  }

  if (isServerlessRuntime || process.env.NODE_ENV === 'production') {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  return 'mongodb://localhost:27017/gaesde';
}

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  database: {
    uri: resolveDatabaseUri(),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
});
