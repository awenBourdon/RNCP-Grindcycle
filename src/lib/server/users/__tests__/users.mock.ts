import { UserRole } from '@/generated/prisma'

export const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: true,
  role: UserRole.USER,
  image: ['avatar1.jpg'],
  points: 150,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
}

export const mockAdminUser = {
  ...mockUser,
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
  points: 500,
}

export const mockUserWithLowPoints = {
  ...mockUser,
  id: 'user-2',
  name: 'Poor User',
  email: 'poor@example.com',
  points: 10,
}

export const mockUsers = [mockUser, mockAdminUser, mockUserWithLowPoints]