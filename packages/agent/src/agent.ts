import {createAgent, IAgentContext, IAgentPlugin, TAgent,} from "@veramo/core";
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore,} from "@veramo/data-store";
import {DIDManager} from "@veramo/did-manager";
import {DIDResolverPlugin} from "@veramo/did-resolver";
import {SphereonKeyManager} from "@sphereon/ssi-sdk-ext.key-manager";
import {SecretBox} from "@veramo/kms-local";
import {SphereonKeyManagementSystem} from "@sphereon/ssi-sdk-ext.kms-local";
import {getDbConnection} from "./database";
import {createDidProviders, createDidResolver,} from "./utils";
import {DB_CONNECTION_NAME, DB_ENCRYPTION_KEY, MEMORY_DB,} from "./environment";
import {DID_PREFIX, DIDMethods, TAgentTypes} from "./types";
import {MemoryPrivateKeyStore} from "@veramo/key-manager";
import {EventLoggerStore} from "@sphereon/ssi-sdk.data-store";
import {LoggingEventType,} from "@sphereon/ssi-sdk.core";
import {EventLogger} from "@sphereon/ssi-sdk.event-logger";
import {web3WalletsSetup} from "./web3";
import {oidcBackendSetup} from "./oidc";

/**
 * Lets setup supported DID resolvers first
 */
const resolver = createDidResolver();
const dbConnection = getDbConnection(DB_CONNECTION_NAME);

/**
 * Private key store, responsible for storing private keys in the database using encryption
 */
const privateKeyStore: PrivateKeyStore | MemoryPrivateKeyStore = MEMORY_DB
  ? new MemoryPrivateKeyStore()
  : new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY));

/**
 * Define Agent plugins being used. The plugins come from Sphereon's SSI-SDK and Veramo.
 */

const plugins: IAgentPlugin[] = [
  new DataStore(dbConnection),
  new DataStoreORM(dbConnection),
  new SphereonKeyManager({
    store: new KeyStore(dbConnection),
    kms: {
      local: new SphereonKeyManagementSystem(privateKeyStore),
    },
  }),
  new DIDManager({
    store: new DIDStore(dbConnection),
    defaultProvider: `${DID_PREFIX}:${DIDMethods.DID_WEB}`,
    providers: createDidProviders(),
  }),
  new DIDResolverPlugin({
    resolver,
  }),
  new EventLogger({
    eventTypes: [LoggingEventType.AUDIT],
    store: new EventLoggerStore(dbConnection),
  }),
];

/**
 * Create the agent with a context and export it, so it is available for the rest of the code, or code using this module
 */
const agent = createAgent<TAgentTypes>({
  plugins,
}) as TAgent<TAgentTypes>;
export default agent;
export const context: IAgentContext<TAgentTypes> = { agent };


// Enable web3 headless agent
web3WalletsSetup();

// Enable OIDC RP backend
oidcBackendSetup();
