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
}

const aptService = {
    async getProject(projectPath: string): Promise<ProjectResponse> {
        const response = await axios.get(`${API_BASE_URL}/project/${encodeURIComponent(projectPath)}`);
        return response.data;
    },

    async getCache(): Promise<Record<string, any>> {
        const response = await axios.get(`${API_BASE_URL}/cache`);
        return response.data;
    },

    async getProjectLinks(): Promise<ProjectLink[]> {
        const response = await axios.get(`${API_BASE_URL}/project-links`);
        return response.data;
    }
};

export default aptService;