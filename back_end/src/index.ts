import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import userRoutes from './routes/user.routes';

async function startServer() {
  // Initialize database connection
  await AppDataSource.initialize();
  console.log('Database connection initialized');

  const app = express();
  const httpServer = createServer(app);

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Set up WebSocket server
  const serverCleanup = useServer({ schema }, wsServer);

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Apply middleware
  app.use(cors<cors.CorsRequest>());
  app.use(json());

  // Mount REST API routes
  app.use('/api', userRoutes);

  // Mount GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Add authentication context here if needed
        return {};
      },
    }),
  );

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 REST API ready at http://localhost:${PORT}/api`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
