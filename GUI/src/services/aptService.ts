import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ProjectData {
    name: string;
    label?: string;
    entryDirectory: string;
    components?: {
        type: string;
        data: any;
    }[];
    gitDetails?: {
        remoteUrl: string;
        branch?: string;
        commit?: string;
    };
    templateInfo?: string;
    prototypeInfo?: string;
}

export interface ProjectResponse {
    project: ProjectData;
    environments: {
        [key: string]: any;
    };
}

export interface ProjectLink {
    path: string;
    name: string;
    type: string;
    entryDirectory: string;
    gitDetails?: {
        RemoteURL: string;
        Branch: string;
        Commit: string;
    };
}

export interface ResolvedProjectLink {
    entryDirectory: string;
    type: string;
}

export interface ProjectLinkResolution {
    success: boolean;
    projectLink?: ResolvedProjectLink;
    error?: string;
}

export interface DependencyDetails {
    GitDetails?: {
        RemoteURL: string;
        Branch?: string;
        Commit?: string;
    };
    EntryDirectory?: string;
}

export interface CommandExecutionRequest {
    command: string;
    commandType: string;
    projectPath: string;
}

export interface CommandExecutionResponse {
    output: string;
    exitCode: number;
    command: string;
    commandType: string;
    error?: string;
}

export interface APTService {
    getConfigNames(projectPath: string): Promise<string[]>;
    getConfig(projectPath: string, configName: string): Promise<Record<string, any>>;
    getProject(projectPath: string): Promise<ProjectResponse>;
    getCache(): Promise<Record<string, any>>;
    updateCache(key: string, value: any): Promise<void>;
    deleteCache(key: string): Promise<void>;
    getProjectLinks(): Promise<ProjectLink[]>;
    resolveProjectLink(dependency: Record<string, any>): Promise<ProjectLinkResolution>;

    addConfig(projectPath: string, configName: string, config: Record<string, any>): Promise<void>;
    deleteConfig(projectPath: string, configName: string): Promise<void>;
    executeCommand(request: CommandExecutionRequest): Promise<CommandExecutionResponse>;
}

const aptService: APTService = {
    async getConfigNames(projectPath: string): Promise<string[]> {
        const url = `${API_BASE_URL}/project/${encodeURIComponent(projectPath)}/configs`;
        const response = await axios.get(url);
        return response.data;
    },
    async getConfig(projectPath: string, configName: string): Promise<Record<string, any>> {
        const url = `${API_BASE_URL}/project/${encodeURIComponent(projectPath)}/configs/${encodeURIComponent(configName)}`;
        const response = await axios.get(url);
        return response.data;
    },
    async resolveProjectLink(dependency: Record<string, any>): Promise<ProjectLinkResolution> {
        // Convert nested objects to JSON strings
        const params = new URLSearchParams();
        Object.entries(dependency).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                return;
            }
            if (typeof value === 'object') {
                params.append(key, JSON.stringify(value));
            } else {
                params.append(key, String(value));
            }
        });
        const response = await axios.get(`${API_BASE_URL}/resolve-project-link?${params.toString()}`);
        return response.data;
    },

    async getProject(projectPath: string): Promise<ProjectResponse> {
        const response = await axios.get(`${API_BASE_URL}/project/${encodeURIComponent(projectPath)}`);
        return response.data;
    },

    async getCache(): Promise<Record<string, any>> {
        const response = await axios.get(`${API_BASE_URL}/cache`);
        return response.data;
    },

    async updateCache(key: string, value: any): Promise<void> {
        await axios.put(`${API_BASE_URL}/cache/${encodeURIComponent(key)}`, { value });
    },

    async deleteCache(key: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/cache/${encodeURIComponent(key)}`);
    },

    async getProjectLinks(): Promise<ProjectLink[]> {
        const response = await axios.get(`${API_BASE_URL}/project-links`);
        return response.data;
    },



    async addConfig(projectPath: string, configName: string, config: Record<string, any>): Promise<void> {
        const url = `${API_BASE_URL}/project/${encodeURIComponent(projectPath)}/configs/${encodeURIComponent(configName)}`;
        await axios.post(url, { config });
    },

    async deleteConfig(projectPath: string, configName: string): Promise<void> {
        const url = `${API_BASE_URL}/project/${encodeURIComponent(projectPath)}/configs/${encodeURIComponent(configName)}`;
        await axios.delete(url);
    },

    async executeCommand(request: CommandExecutionRequest): Promise<CommandExecutionResponse> {
        const response = await axios.post(`${API_BASE_URL}/execute-command`, request);
        return response.data;
    }
};

export default aptService;