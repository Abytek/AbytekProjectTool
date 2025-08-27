import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ProjectData {
    name: string;
    label: string;
    entryFile: string;
    entryDirectory: string;
    components: {
        type: string;
        data: any;
    }[];
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
    entryFile: string;
    gitDetails?: {
        RemoteURL: string;
        Branch: string;
        Commit: string;
    };
}

export interface ResolvedProjectLink {
    entryFile: string;
    type: string;
}

export interface ProjectLinkResolution {
    success: boolean;
    projectLink?: ResolvedProjectLink;
    error?: string;
}

export interface APTService {
    getProject(projectPath: string): Promise<ProjectResponse>;
    getCache(): Promise<Record<string, any>>;
    updateCache(key: string, value: any): Promise<void>;
    deleteCache(key: string): Promise<void>;
    getProjectLinks(): Promise<ProjectLink[]>;
    resolveProjectLink(dependency: Record<string, any>): Promise<ProjectLinkResolution>;
}

const aptService: APTService = {
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
    }
};

export default aptService;