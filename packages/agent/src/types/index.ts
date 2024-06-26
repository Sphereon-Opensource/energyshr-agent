import {
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IDIDManagerCreateArgs,
  IIdentifier,
  IKeyManager,
  IResolver,
} from "@veramo/core";

export const DID_PREFIX = "did";

/**
 * SSI SDK modules supported by this agent. This type is used to expose available agent methods in the IDE
 */
export type TAgentTypes = IDIDManager &
  IResolver &
  IKeyManager &
  IDataStore &
  IDataStoreORM;

/**
 * The Key Management System (name) to use. Currently, there is only one KMS
 */
export enum KMS {
  LOCAL = "local",
}

/**
 * Predefined DID methods. In case more DID methods should be support, you will also have to import SSI-SDK modules
 */
export enum DIDMethods {
  DID_ION = "ion",
  DID_JWK = "jwk",
  DID_WEB = "web",
}

/**
 * Options for creating DIDs from configuration files. These files are imported into the agent database during startup
 */
export interface IDIDOpts {
  did?: string; // The DID to import
  createArgs?: IDIDManagerCreateArgs;
  // importArgs?: IImportX509DIDArg
  privateKeyHex?: string; // The private key. Can be removed once the DID is created in the agent DB
}

/**
 * DID creation result, which contains an identifier
 */
export interface IDIDResult extends IDIDOpts {
  identifier?: IIdentifier; // The identifier that was created
}
