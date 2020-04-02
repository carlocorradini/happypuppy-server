export default interface Configuration {
  NODE: {
    ENV: string;
    PORT: number;
  };
  DATABASE: {
    TYPE: string;
    URL: string;
    SSL: boolean;
    SYNCHRONIZE: boolean;
    ENTITIES: string;
    MIGRATIONS: string;
    SUBSCRIBERS: string;
  };
  SECURITY: {
    BCRYPT: {
      SALT_ROUNS: number;
    };
    JWT: {
      SECRET: string;
      EXPIRES_IN: string;
    };
  };
}
