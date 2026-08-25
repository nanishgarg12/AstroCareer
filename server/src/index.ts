import { app } from './app.js';
import { mongoose } from './models/index.js';
import { config, productionConfig } from './config.js';

productionConfig();

const mongoOptions = {
  serverSelectionTimeoutMS: 10000
};

const start = async () => {
  try {
    await mongoose.connect(config.mongo, mongoOptions);

    const server = app.listen(config.port, () => {
      console.log(`AstroCareer API running on port ${config.port}`);
      console.log(`Frontend allowed from: ${config.client}`);
    });

    const shutdown = async () => {
      console.log('Shutting down AstroCareer API...');

      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error('Database connection failed.');
    console.error(message);
    console.error(
      'Check your MongoDB URI, Atlas Network Access and internet connection.'
    );

    process.exit(1);
  }
};

void start();