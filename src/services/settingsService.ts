export interface UserSettings {
  // Notifications
  emailNotifications: boolean;
  citationAlerts: boolean;
  newPaperAlerts: boolean;
  weeklyDigest: boolean;
  
  // Privacy
  publicProfile: boolean;
  showCitations: boolean;
  
  // Appearance
  darkMode: boolean;
  autoSave: boolean;
  language: string;
}

export interface UserProfile {
  email: string;
  name: string;
  affiliation?: string;
  passwordLastChanged?: string;
  twoFactorEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  citationAlerts: true,
  newPaperAlerts: false,
  weeklyDigest: true,
  publicProfile: true,
  showCitations: true,
  darkMode: false,
  autoSave: true,
  language: 'en'
};

export const settingsService = {
  // Get user settings
  getSettings: (userId: string): UserSettings => {
    const key = `settings_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_SETTINGS;
  },

  // Save user settings
  saveSettings: (userId: string, settings: UserSettings): void => {
    const key = `settings_${userId}`;
    localStorage.setItem(key, JSON.stringify(settings));
  },

  // Update specific setting
  updateSetting: <K extends keyof UserSettings>(
    userId: string,
    key: K,
    value: UserSettings[K]
  ): void => {
    const settings = settingsService.getSettings(userId);
    settings[key] = value;
    settingsService.saveSettings(userId, settings);
  },

  // Get user profile
  getUserProfile: (userId: string): UserProfile | null => {
    const key = `user_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  },

  // Update user profile
  updateUserProfile: (userId: string, updates: Partial<UserProfile>): void => {
    const key = `user_${userId}`;
    const current = settingsService.getUserProfile(userId);
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem(key, JSON.stringify(updated));
    }
  },

  // Update email
  updateEmail: (userId: string, newEmail: string): boolean => {
    // Check if email is already taken
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const emailExists = users.some((u: any) => u.email === newEmail && u.id !== userId);
    
    if (emailExists) {
      return false;
    }

    // Update user profile
    settingsService.updateUserProfile(userId, { email: newEmail });

    // Update in users array
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex >= 0) {
      users[userIndex].email = newEmail;
      localStorage.setItem('users', JSON.stringify(users));
    }

    return true;
  },

  // Update password
  updatePassword: (userId: string, currentPassword: string, newPassword: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.id === userId);

    if (!user || user.password !== currentPassword) {
      return false;
    }

    // Update password
    user.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    // Update last changed date
    settingsService.updateUserProfile(userId, {
      passwordLastChanged: new Date().toISOString()
    });

    return true;
  },

  // Enable/disable 2FA
  toggle2FA: (userId: string, enabled: boolean): void => {
    settingsService.updateUserProfile(userId, { twoFactorEnabled: enabled });
  },

  // Update language
  updateLanguage: (userId: string, language: string): void => {
    settingsService.updateSetting(userId, 'language', language);
  },

  // Reset settings to default
  resetSettings: (userId: string): void => {
    settingsService.saveSettings(userId, DEFAULT_SETTINGS);
  },

  // Export settings
  exportSettings: (userId: string): string => {
    const settings = settingsService.getSettings(userId);
    return JSON.stringify(settings, null, 2);
  },

  // Import settings
  importSettings: (userId: string, settingsJson: string): boolean => {
    try {
      const settings = JSON.parse(settingsJson);
      settingsService.saveSettings(userId, settings);
      return true;
    } catch {
      return false;
    }
  }
};
