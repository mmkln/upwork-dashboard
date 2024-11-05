import { Environment } from "./environment.types";
import { environment as ghEnvironment } from './gh-pages.environment';
import { environment as localEnvironment } from './local.environment';

export const environment: Environment = ghEnvironment;