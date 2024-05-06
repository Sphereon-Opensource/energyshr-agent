import {config as dotenvConfig} from "dotenv-flow";
import {resolve} from "path";
import {loadJsonFiles} from "./utils";
import {IDIDOpts} from "./types";
import {env} from "@sphereon/ssi-express-support/dist/functions";
import {eventLoggerAuditMethods} from "@sphereon/ssi-sdk.event-logger";

await dotenvConfig();

/**
 * Please see .env.example for an explanation of the different environment variables available
 *
 * This file takes all environment variables and assigns them to constants, with default values,
 * so the rest of the code doesn't have to know the exact environment values
 */
export const ENV_VAR_PREFIX = process.env.ENV_VAR_PREFIX ?? "";

export const DB_TYPE = env("DB_TYPE", ENV_VAR_PREFIX) ?? "sqlite";

export const MEMORY_DB = DB_TYPE.toLowerCase().includes("mem");
export const DB_URL =
  env("DB_URL", ENV_VAR_PREFIX) ??
  (MEMORY_DB ? ":memory:" : "database/agent_default.sqlite");

if (MEMORY_DB) {
  if (!DB_URL.includes(":memory:")) {
    throw Error(
      `DB_TYPE is set to ${DB_TYPE}, but the DB_URL (${DB_URL}) does not contain ':memory:"`,
    );
  }
  console.log(
    "An in Memory Database is being used. All created DIDs and keys will be discarded on restart",
  );
}
export const DB_HOST = env("DB_HOST", ENV_VAR_PREFIX);
export const DB_PORT = env("DB_PORT", ENV_VAR_PREFIX);
export const DB_USERNAME = env("DB_USERNAME", ENV_VAR_PREFIX);
export const DB_PASSWORD = env("DB_PASSWORD", ENV_VAR_PREFIX);
export const DB_USE_SSL = env("DB_USE_SSL", ENV_VAR_PREFIX);
export const DB_SSL_CA = env("DB_SSL_CA", ENV_VAR_PREFIX);
export const DB_SSL_ALLOW_SELF_SIGNED =
  env("DB_SSL_ALLOW_SELF_SIGNED", ENV_VAR_PREFIX) ?? true;
export const DB_CONNECTION_NAME =
  env("DB_CONNECTION_NAME", ENV_VAR_PREFIX) ?? "default";
export const DB_DATABASE_NAME =
  env("DB_DATABASE_NAME", ENV_VAR_PREFIX) ?? "web-wallet-agent";
export const DB_CACHE_ENABLED =
  env("DB_CACHE_ENABLED", ENV_VAR_PREFIX) ?? "true";
export const DB_ENCRYPTION_KEY =
  env("DB_ENCRYPTION_KEY", ENV_VAR_PREFIX) ??
  "29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c";
export const INTERNAL_HOSTNAME_OR_IP =
  env("INTERNAL_HOSTNAME_OR_IP", ENV_VAR_PREFIX) ??
  env("HOSTNAME", ENV_VAR_PREFIX) ??
  "0.0.0.0";
export const INTERNAL_PORT = env("PORT", ENV_VAR_PREFIX)
  ? Number.parseInt(env("PORT", ENV_VAR_PREFIX)!)
  : 5000;
export const EXTERNAL_HOSTNAME =
  env("EXTERNAL_HOSTNAME", ENV_VAR_PREFIX) ?? "localhost";
export const DEFAULT_DID = env("DEFAULT_DID", ENV_VAR_PREFIX);
export const DEFAULT_KID = env("DEFAULT_KID", ENV_VAR_PREFIX);
export const CONF_PATH = env("CONF_PATH", ENV_VAR_PREFIX)
  ? resolve(env("CONF_PATH", ENV_VAR_PREFIX)!)
  : resolve("../../conf");

export const REMOTE_SERVER_API_FEATURES: string[] = env(
  "REMOTE_SERVER_API_FEATURES",
  ENV_VAR_PREFIX,
)
  ? (env("REMOTE_SERVER_API_FEATURES", ENV_VAR_PREFIX)?.split(",") as string[])
  : eventLoggerAuditMethods;


export const DID_API_BASE_PATH =
  env("DID_API_BASE_PATH", ENV_VAR_PREFIX) ?? "/did";
export const ASSET_DEFAULT_DID_METHOD =
  env("ASSET_DEFAULT_DID_METHOD", ENV_VAR_PREFIX) ?? "jwk";

export const DID_API_RESOLVE_MODE =
  env("DID_API_RESOLVE_MODE", ENV_VAR_PREFIX) ?? "hybrid";
export const DID_OPTIONS_PATH =
  env("DID_OPTIONS_PATH", ENV_VAR_PREFIX) ?? `${CONF_PATH}/dids`;

export const DID_IMPORT_MODE =
  env("DID_IMPORT_MODE", ENV_VAR_PREFIX) ?? "filesystem,environment";
export const DID_WEB_DID = env("DID_WEB_DID", ENV_VAR_PREFIX);
export const DID_WEB_KID = env("DID_WEB_KID", ENV_VAR_PREFIX);
export const DID_WEB_CERT_PEM = env("DID_WEB_CERT_PEM", ENV_VAR_PREFIX);
export const DID_WEB_PRIVATE_KEY_PEM = env(
  "DID_WEB_PRIVATE_KEY_PEM",
  ENV_VAR_PREFIX,
);
export const DID_WEB_CERT_CHAIN_PEM = env(
  "DID_WEB_CERT_CHAIN_PEM",
  ENV_VAR_PREFIX,
);

export const AUTHENTICATION_ENABLED =
  env("AUTHENTICATION_ENABLED", ENV_VAR_PREFIX) === "false";
export const AUTHENTICATION_STRATEGY = env(
  "AUTHENTICATION_STRATEGY",
  ENV_VAR_PREFIX,
);
export const AUTHORIZATION_ENABLED =
  env("AUTHORIZATION_ENABLED", ENV_VAR_PREFIX) === "false";
export const AUTHORIZATION_GLOBAL_REQUIRE_USER_IN_ROLES = env(
  "AUTHORIZATION_GLOBAL_REQUIRE_USER_IN_ROLES",
  ENV_VAR_PREFIX,
);
export const didOptConfigs = loadJsonFiles<IDIDOpts>({
  path: DID_OPTIONS_PATH,
});
