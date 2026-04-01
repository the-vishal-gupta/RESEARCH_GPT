export interface User {
  id: string;
  email: string;
  name: string;
  affiliation?: string;
  createdAt: string;
  preferences: {
    theme: 'light' | 'dark';
    defaultSearchFilter: string;
  };
}

export const authService = {
  signup: async (email: string, password: string, name: string, affiliation?: string): Promise<User> => {
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: User) => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Create user (password stored as-is for MVP)
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      email,
      name,
      affiliation,
      password,
      createdAt: new Date().toISOString(),
      preferences: { theme: 'light', defaultSearchFilter: 'relevance' }
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Initialize user profile for settings
    const userProfile = {
      email,
      name,
      affiliation,
      passwordLastChanged: new Date().toISOString(),
      twoFactorEnabled: false
    };
    localStorage.setItem(`user_${newUser.id}`, JSON.stringify(userProfile));

    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword as User;
  },

  login: async (email: string, password: string): Promise<User> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (!user) throw new Error('User not found');
    if (user.password !== password) throw new Error('Invalid password');

    // Initialize user profile if it doesn't exist
    const profileKey = `user_${user.id}`;
    if (!localStorage.getItem(profileKey)) {
      const userProfile = {
        email: user.email,
        name: user.name,
        affiliation: user.affiliation,
        passwordLastChanged: user.createdAt,
        twoFactorEnabled: false
      };
      localStorage.setItem(profileKey, JSON.stringify(userProfile));
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword as User;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('currentUser') !== null;
  }
};
