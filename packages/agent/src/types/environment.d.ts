declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "local";
      PORT?: string;
      INTERNAL_HOSTNAME_OR_IP?: string;
      EXTERNAL_HOSTNAME?: string;
      DEFAULT_DID?: string;
      DEFAULT_KID?: string;
      DB_CONNECTION_NAME?: string;
      DB_SQLITE_FILE?: string;
      DB_ENCRYPTION_KEY?: string;
      CONF_PATH?: string;
      UNIVERSAL_RESOLVER_RESOLVE_URL?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
