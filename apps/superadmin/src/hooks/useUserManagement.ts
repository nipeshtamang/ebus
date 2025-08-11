import { useState, useCallback } from "react";
import {
  superAdminAPI,
  User,
  CreateUserData,
  UpdateUserData,
} from "../services/superadminApi";

interface UseUserManagementReturn {
  users: User[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchUsers: (page?: number, search?: string, role?: string) => Promise<void>;
  createUser: (data: CreateUserData) => Promise<boolean>;
  updateUser: (id: number, data: UpdateUserData) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export function useUserManagement(): UseUserManagementReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(
    async (page: number = 1, search: string = "", role?: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminAPI.getAllUsers(
          page,
          10,
          search,
          role
        );
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      } catch (err: unknown) {
        console.error("Error fetching users:", err);
        let message = "Failed to load users";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createUser = useCallback(
    async (data: CreateUserData): Promise<boolean> => {
      try {
        setCreating(true);
        setError(null);
        await superAdminAPI.createUser(data);
        // Refresh the users list
        await fetchUsers(currentPage, searchTerm);
        return true;
      } catch (err: unknown) {
        console.error("Error creating user:", err);
        let message = "Failed to create user";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [fetchUsers, currentPage, searchTerm]
  );

  const updateUser = useCallback(
    async (id: number, data: UpdateUserData): Promise<boolean> => {
      try {
        setUpdating(true);
        setError(null);
        await superAdminAPI.updateUser(id, data);
        // Refresh the users list
        await fetchUsers(currentPage, searchTerm);
        return true;
      } catch (err: unknown) {
        console.error("Error updating user:", err);
        let message = "Failed to update user";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [fetchUsers, currentPage, searchTerm]
  );

  const deleteUser = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setDeleting(true);
        setError(null);
        await superAdminAPI.deleteUser(id);
        // Refresh the users list
        await fetchUsers(currentPage, searchTerm);
        return true;
      } catch (err: unknown) {
        console.error("Error deleting user:", err);
        let message = "Failed to delete user";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [fetchUsers, currentPage, searchTerm]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    users,
    totalUsers,
    totalPages,
    currentPage,
    loading,
    error,
    creating,
    updating,
    deleting,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
}
