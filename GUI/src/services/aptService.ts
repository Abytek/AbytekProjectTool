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

export interface APTService {
    getProject(projectPath: string): Promise<ProjectResponse>;
    getCache(): Promise<Record<string, any>>;
    updateCache(key: string, value: any): Promise<void>;
    deleteCache(key: string): Promise<void>;
    getProjectLinks(): Promise<ProjectLink[]>;
}

const aptService: APTService = {
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