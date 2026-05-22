import { Environment } from "./environment.types";
import { environment as ghEnvironment } from "./gh-pages.environment";

export const environment: Environment = {
  ...ghEnvironment,
  apiUrl: process.env.REACT_APP_API_URL || ghEnvironment.apiUrl,
};
