export interface APTData {
  cache: CacheData;
  projectLinks: ProjectLink[];
}

export interface CacheData {
  [key: string]: any;
}

export interface ProjectLink {
  path: string;
  name: string;
  type: string;
}

export interface EnvironmentConfig {
  name: string;
  data: Record<string, any>;
}
