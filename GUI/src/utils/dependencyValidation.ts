import { DependencyDetails } from '../services/aptService';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateDependencyName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'Dependency name is required' };
  }

  // Check for valid characters in name (alphanumeric, dash, underscore)
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return {
      isValid: false,
      error: 'Dependency name can only contain letters, numbers, dashes, and underscores'
    };
  }

  return { isValid: true };
};

export const validateGitDetails = (details: DependencyDetails): ValidationResult => {
  if (!details.GitDetails) {
    return { isValid: false, error: 'Git details are required for Git dependencies' };
  }

  const { RemoteURL, Branch } = details.GitDetails;

  if (!RemoteURL?.trim()) {
    return { isValid: false, error: 'Git URL is required' };
  }

  if (!Branch?.trim()) {
    return { isValid: false, error: 'Git branch is required' };
  }

  // Validate Git URL format
  const gitUrlPatterns = [
    /^git@github\.com:.+\/.+\.git$/, // SSH format
    /^https:\/\/github\.com\/.+\/.+\.git$/, // HTTPS format
    /^https:\/\/github\.com\/.+\/.+$/ // HTTPS format without .git
  ];

  const isValidGitUrl = gitUrlPatterns.some(pattern => pattern.test(RemoteURL.trim()));
  if (!isValidGitUrl) {
    return {
      isValid: false,
      error: 'Invalid Git URL format. Must be a valid GitHub URL (HTTPS or SSH format)'
    };
  }

  return { isValid: true };
};

export const validateLocalDependency = (details: DependencyDetails): ValidationResult => {
  if (!details.EntryDirectory) {
    return { isValid: false, error: 'Project directory path is required for local dependencies' };
  }

  const projectDirectory = details.EntryDirectory.trim();

  if (!projectDirectory) {
    return { isValid: false, error: 'Project directory path is required' };
  }

  // Basic path validation - should be a valid directory path
  if (!projectDirectory || projectDirectory.includes('..') || projectDirectory.includes('*')) {
    return {
      isValid: false,
      error: 'Invalid project directory path'
    };
  }

  return { isValid: true };
};

export const validateDependency = (
  name: string,
  details: DependencyDetails,
  isGitDependency: boolean
): ValidationResult => {
  // Validate name first
  const nameValidation = validateDependencyName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Validate details based on dependency type
  return isGitDependency
    ? validateGitDetails(details)
    : validateLocalDependency(details);
};
