declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DYNAMODB_TABLE: string;
      DYNAMODB_REGION: string;
      DYNAMODB_ACCESS_KEY_ID: string;
      DYNAMODB_SECRET_ACCESS_KEY: string;
    }
  }
}
export {};
