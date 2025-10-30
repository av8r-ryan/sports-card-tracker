// Utility to reset admin credentials
import { userService } from '../services/userService';

export function resetAdminCredentials() {
  console.log('=== RESET ADMIN CREDENTIALS ===');

  try {
    // Clear all users first
    localStorage.removeItem('sports-card-tracker-users');

    // Force reload of user service to recreate default admin
    const newUserService = new (userService.constructor as any)();

    console.log('Admin user has been reset!');
    console.log('');
    console.log('Admin credentials:');
    console.log('Email: admin@sportscard.local');
    console.log('Password: admin123');
    console.log('');
    console.log('Please refresh the page and try logging in again.');

    return true;
  } catch (error) {
    console.error('Failed to reset admin credentials:', error);
    return false;
  }
}

export function listAllUsers() {
  console.log('=== ALL USERS IN SYSTEM ===');

  const usersStr = localStorage.getItem('sports-card-tracker-users');
  if (!usersStr) {
    console.log('No users found in localStorage');
    console.log('Default admin should be created on next page refresh');
    return;
  }

  try {
    const users = JSON.parse(usersStr);
    console.log(`Found ${users.length} users:`);
    console.log('');

    users.forEach((user: any, index: number) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Password: ${user.password || '(hidden)'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to parse users:', error);
  }
}

export function promoteUserToAdmin(username: string) {
  console.log(`=== PROMOTING USER "${username}" TO ADMIN ===`);

  const usersStr = localStorage.getItem('sports-card-tracker-users');
  if (!usersStr) {
    console.error('No users found in system');
    return false;
  }

  try {
    const users = JSON.parse(usersStr);
    const userIndex = users.findIndex(
      (u: any) =>
        u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );

    if (userIndex === -1) {
      console.error(`User "${username}" not found`);
      console.log('Available users:');
      users.forEach((u: any) => console.log(`  - ${u.username} (${u.email})`));
      return false;
    }

    // Update user role to admin
    users[userIndex].role = 'admin';
    users[userIndex].updatedAt = new Date().toISOString();

    // Save back to localStorage
    localStorage.setItem('sports-card-tracker-users', JSON.stringify(users));

    console.log(`✅ User "${users[userIndex].username}" (${users[userIndex].email}) has been promoted to admin!`);
    console.log('');
    console.log('Please refresh the page to see admin features.');

    // Also update current user if they're logged in
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === users[userIndex].id) {
        currentUser.role = 'admin';
        localStorage.setItem('user', JSON.stringify(currentUser));
        console.log('Current session updated to admin role.');
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to promote user:', error);
    return false;
  }
}

// Make functions available globally
(window as any).resetAdminCredentials = resetAdminCredentials;
(window as any).listAllUsers = listAllUsers;
(window as any).promoteUserToAdmin = promoteUserToAdmin;
