"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const schema_1 = require("@graphql-tools/schema");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const data_source_1 = require("./data-source");
const schema_2 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize database connection
        yield data_source_1.AppDataSource.initialize();
        console.log('Database connection initialized');
        const app = (0, express_1.default)();
        const httpServer = (0, http_1.createServer)(app);
        // Create WebSocket server
        const wsServer = new ws_1.WebSocketServer({
            server: httpServer,
            path: '/graphql',
        });
        // Create GraphQL schema
        const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: schema_2.typeDefs, resolvers: resolvers_1.resolvers });
        // Set up WebSocket server
        const serverCleanup = (0, ws_2.useServer)({ schema }, wsServer);
        // Create Apollo Server
        const server = new server_1.ApolloServer({
            schema,
            plugins: [
                (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
                {
                    serverWillStart() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return {
                                drainServer() {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        yield serverCleanup.dispose();
                                    });
                                },
                            };
                        });
                    },
                },
            ],
        });
        yield server.start();
        // Apply middleware
        app.use((0, cors_1.default)());
        app.use((0, body_parser_1.json)());
        // Mount REST API routes
        app.use('/api', user_routes_1.default);
        // Mount GraphQL middleware
        app.use('/graphql', (0, express4_1.expressMiddleware)(server, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req }) {
                // Add authentication context here if needed
                return {};
            }),
        }));
        const PORT = process.env.PORT || 4000;
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
            console.log(`🚀 REST API ready at http://localhost:${PORT}/api`);
            console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
        });
    });
}
startServer().catch((error) => {
    console.error('Error starting server:', error);
});
//# sourceMappingURL=index.js.map