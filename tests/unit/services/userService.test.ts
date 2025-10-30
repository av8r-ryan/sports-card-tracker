import { userService } from '../../../src/services/userService';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initialization', () => {
    it('initializes with default admin user when no users exist', () => {
      const users = userService.getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('admin');
      expect(users[0].email).toBe('admin@sportscard.local');
      expect(users[0].role).toBe('admin');
    });

    it('loads existing users from localStorage', () => {
      const existingUsers = [
        {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUsers));

      // Create new instance to test loading
      const { UserService } = require('../../../src/services/userService');
      const newUserService = new UserService();
      const users = newUserService.getAllUsers();
      
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('testuser');
    });

    it('handles invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      // Should not throw error and should initialize with default admin
      const users = userService.getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('admin');
    });
  });

  describe('User Authentication', () => {
    it('authenticates valid user with correct credentials', () => {
      const result = userService.authenticateUser('admin@sportscard.local', 'admin123');
      
      expect(result).toBeTruthy();
      expect(result?.username).toBe('admin');
      expect(result?.email).toBe('admin@sportscard.local');
      expect(result?.password).toBeUndefined(); // Password should not be exposed
    });

    it('rejects invalid email', () => {
      const result = userService.authenticateUser('invalid@example.com', 'admin123');
      expect(result).toBeNull();
    });

    it('rejects invalid password', () => {
      const result = userService.authenticateUser('admin@sportscard.local', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('rejects inactive user', () => {
      // Create an inactive user
      const inactiveUser = userService.createUser({
        username: 'inactive',
        email: 'inactive@example.com',
        password: 'password',
        role: 'user',
        isActive: false
      });

      const result = userService.authenticateUser('inactive@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('User Creation', () => {
    it('creates new user successfully', () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'user' as const,
        isActive: true
      };

      const newUser = userService.createUser(userData);
      
      expect(newUser).toBeTruthy();
      expect(newUser.username).toBe('newuser');
      expect(newUser.email).toBe('new@example.com');
      expect(newUser.role).toBe('user');
      expect(newUser.isActive).toBe(true);
      expect(newUser.id).toMatch(/^user-/);
      expect(newUser.password).toBeUndefined(); // Password should not be exposed
      expect(newUser.createdAt).toBeInstanceOf(Date);
      expect(newUser.updatedAt).toBeInstanceOf(Date);
    });

    it('generates unique IDs for new users', () => {
      const user1 = userService.createUser({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const user2 = userService.createUser({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      expect(user1.id).not.toBe(user2.id);
    });

    it('saves users to localStorage', () => {
      userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2); // Default admin + new user
    });
  });

  describe('User Retrieval', () => {
    it('gets user by ID', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const retrievedUser = userService.getUserById(newUser.id);
      
      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser?.username).toBe('testuser');
      expect(retrievedUser?.password).toBeUndefined();
    });

    it('returns null for non-existent user ID', () => {
      const result = userService.getUserById('non-existent-id');
      expect(result).toBeNull();
    });

    it('gets all users without passwords', () => {
      userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const users = userService.getAllUsers();
      
      expect(users).toHaveLength(2); // Default admin + new user
      users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('User Updates', () => {
    it('updates user information', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const updatedUser = userService.updateUser(newUser.id, {
        username: 'updateduser',
        email: 'updated@example.com'
      });

      expect(updatedUser).toBeTruthy();
      expect(updatedUser?.username).toBe('updateduser');
      expect(updatedUser?.email).toBe('updated@example.com');
      expect(updatedUser?.id).toBe(newUser.id); // ID should not change
      expect(updatedUser?.createdAt).toEqual(newUser.createdAt); // Created date should not change
      expect(updatedUser?.updatedAt).not.toEqual(newUser.updatedAt); // Updated date should change
    });

    it('returns null for non-existent user update', () => {
      const result = userService.updateUser('non-existent-id', {
        username: 'updated'
      });
      expect(result).toBeNull();
    });

    it('preserves password when updating other fields', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'originalpassword',
        role: 'user',
        isActive: true
      });

      // Get the internal user data to check password
      const internalUsers = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      const internalUser = internalUsers.find((u: any) => u.id === newUser.id);
      expect(internalUser.password).toBe('originalpassword');

      userService.updateUser(newUser.id, {
        username: 'updateduser'
      });

      // Check that password is still there
      const updatedInternalUsers = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
      const updatedInternalUser = updatedInternalUsers.find((u: any) => u.id === newUser.id);
      expect(updatedInternalUser.password).toBe('originalpassword');
    });
  });

  describe('User Deletion', () => {
    it('deletes user successfully', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const result = userService.deleteUser(newUser.id);
      expect(result).toBe(true);

      const retrievedUser = userService.getUserById(newUser.id);
      expect(retrievedUser).toBeNull();
    });

    it('prevents deleting the last admin', () => {
      const adminUser = userService.getAllUsers().find(u => u.role === 'admin');
      expect(adminUser).toBeTruthy();

      expect(() => {
        userService.deleteUser(adminUser!.id);
      }).toThrow('Cannot delete the last active admin user');
    });

    it('allows deleting admin when multiple admins exist', () => {
      // Create another admin
      const secondAdmin = userService.createUser({
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'password',
        role: 'admin',
        isActive: true
      });

      const firstAdmin = userService.getAllUsers().find(u => u.role === 'admin' && u.id !== secondAdmin.id);
      expect(firstAdmin).toBeTruthy();

      const result = userService.deleteUser(firstAdmin!.id);
      expect(result).toBe(true);
    });

    it('returns false for non-existent user deletion', () => {
      const result = userService.deleteUser('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('User Status Management', () => {
    it('toggles user active status', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const toggledUser = userService.toggleUserStatus(newUser.id);
      expect(toggledUser?.isActive).toBe(false);

      const toggledAgain = userService.toggleUserStatus(newUser.id);
      expect(toggledAgain?.isActive).toBe(true);
    });

    it('prevents disabling the last active admin', () => {
      const adminUser = userService.getAllUsers().find(u => u.role === 'admin');
      expect(adminUser).toBeTruthy();

      expect(() => {
        userService.toggleUserStatus(adminUser!.id);
      }).toThrow('Cannot disable the last active admin user');
    });

    it('allows disabling admin when multiple admins exist', () => {
      // Create another admin
      const secondAdmin = userService.createUser({
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'password',
        role: 'admin',
        isActive: true
      });

      const firstAdmin = userService.getAllUsers().find(u => u.role === 'admin' && u.id !== secondAdmin.id);
      expect(firstAdmin).toBeTruthy();

      const toggledUser = userService.toggleUserStatus(firstAdmin!.id);
      expect(toggledUser?.isActive).toBe(false);
    });
  });

  describe('Role Management', () => {
    it('changes user role', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      const updatedUser = userService.changeUserRole(newUser.id, 'admin');
      expect(updatedUser?.role).toBe('admin');
    });

    it('prevents demoting the last admin', () => {
      const adminUser = userService.getAllUsers().find(u => u.role === 'admin');
      expect(adminUser).toBeTruthy();

      expect(() => {
        userService.changeUserRole(adminUser!.id, 'user');
      }).toThrow('Cannot demote the last active admin user');
    });

    it('allows demoting admin when multiple admins exist', () => {
      // Create another admin
      const secondAdmin = userService.createUser({
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'password',
        role: 'admin',
        isActive: true
      });

      const firstAdmin = userService.getAllUsers().find(u => u.role === 'admin' && u.id !== secondAdmin.id);
      expect(firstAdmin).toBeTruthy();

      const updatedUser = userService.changeUserRole(firstAdmin!.id, 'user');
      expect(updatedUser?.role).toBe('user');
    });
  });

  describe('Password Management', () => {
    it('resets user password', () => {
      const newUser = userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'oldpassword',
        role: 'user',
        isActive: true
      });

      const result = userService.resetUserPassword(newUser.id, 'newpassword');
      expect(result).toBe(true);

      // Verify password was changed by checking authentication
      const authResult = userService.authenticateUser('test@example.com', 'newpassword');
      expect(authResult).toBeTruthy();

      const oldAuthResult = userService.authenticateUser('test@example.com', 'oldpassword');
      expect(oldAuthResult).toBeNull();
    });

    it('returns false for non-existent user password reset', () => {
      const result = userService.resetUserPassword('non-existent-id', 'newpassword');
      expect(result).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('provides accurate user statistics', () => {
      // Create some test users
      userService.createUser({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });

      userService.createUser({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password',
        role: 'user',
        isActive: false
      });

      userService.createUser({
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'password',
        role: 'admin',
        isActive: true
      });

      const stats = userService.getUserStatistics();

      expect(stats.totalUsers).toBe(4); // Default admin + 3 new users
      expect(stats.activeUsers).toBe(3); // Default admin + user1 + admin2
      expect(stats.adminUsers).toBe(2); // Default admin + admin2
      expect(stats.regularUsers).toBe(2); // user1 + user2
      expect(stats.disabledUsers).toBe(1); // user2
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw error
      expect(() => {
        userService.createUser({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          role: 'user',
          isActive: true
        });
      }).not.toThrow();
    });

    it('handles localStorage getItem errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage read error');
      });

      // Should initialize with default admin
      const users = userService.getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('admin');
    });
  });
});
