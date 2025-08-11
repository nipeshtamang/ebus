import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { logger } from "../config/logger";
import { Role } from "@ebusewa/common";

const prisma = new PrismaClient();

export interface CreateUserData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Role;
  profileImage?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: Role;
  profileImage?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
  activeRoutes: number;
  totalBuses: number;
  systemHealth: {
    databaseStatus: string;
    apiStatus: string;
    lastBackup: Date | null;
    systemUptime: number;
    errorRate: number;
  };
  recentActivity: Array<{
    id: number;
    action: string;
    entity: string;
    entityId: number;
    createdAt: string;
    user?: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

export interface UserAnalytics {
  userGrowth: { month: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface SystemHealth {
  databaseStatus: string;
  apiStatus: string;
  lastBackup: Date | null;
  systemUptime: number;
  errorRate: number;
}

export class SuperadminService {
  // User Management
  async createUser(data: CreateUserData): Promise<{
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
        },
      });

      if (existingUser) {
        throw new Error("User with this email or phone number already exists");
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          passwordHash,
          role: data.role,
          profileImage: data.profileImage,
        },
      });

      // Log the action
      await this.logAction("CREATE", "User", user.id, null, user);

      logger.info(
        `Superadmin created user: ${user.email} with role: ${user.role}`
      );
      return user;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(
    userId: number,
    data: UpdateUserData
  ): Promise<{
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      const beforeUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!beforeUser) {
        throw new Error("User not found");
      }

      // Check for email/phone conflicts if updating
      if (data.email || data.phoneNumber) {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(data.email ? [{ email: data.email }] : []),
              ...(data.phoneNumber ? [{ phoneNumber: data.phoneNumber }] : []),
            ],
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          throw new Error("Email or phone number already in use");
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
          ...(data.role && { role: data.role }),
          ...(data.profileImage && { profileImage: data.profileImage }),
        },
      });

      // Log the action
      await this.logAction("UPDATE", "User", userId, beforeUser, updatedUser);

      logger.info(`Superadmin updated user: ${updatedUser.email}`);
      return updatedUser;
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }

  async updateProfile(
    userId: number,
    data: {
      name: string;
      email: string;
      phoneNumber: string;
      profileImage?: string;
    }
  ): Promise<{
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      const beforeUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!beforeUser) {
        throw new Error("User not found");
      }

      // Check for email/phone conflicts
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new Error("Email or phone number already in use");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          ...(data.profileImage && { profileImage: data.profileImage }),
        },
      });

      // Log the action
      await this.logAction("UPDATE", "User", userId, beforeUser, updatedUser);

      logger.info(`User updated profile: ${updatedUser.email}`);
      return updatedUser;
    } catch (error) {
      logger.error("Error updating profile:", error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          bookings: true,
          payments: true,
          reservations: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user has active bookings
      const activeBookings = user.bookings.filter(
        (booking: { status: string; deletedAt: Date | null }) =>
          booking.status === "BOOKED" && !booking.deletedAt
      );

      if (activeBookings.length > 0) {
        throw new Error("Cannot delete user with active bookings");
      }

      // Soft delete user and related data
      await prisma.$transaction([
        // Soft delete bookings
        prisma.booking.updateMany({
          where: { userId },
          data: { deletedAt: new Date() },
        }),
        // Soft delete payments
        prisma.payment.updateMany({
          where: { userId },
          data: { deletedAt: new Date() },
        }),
        // Delete reservations
        prisma.reservation.deleteMany({
          where: { userId },
        }),
        // Delete user
        prisma.user.delete({
          where: { id: userId },
        }),
      ]);

      // Log the action
      await this.logAction("DELETE", "User", userId, user, null);

      logger.info(`Superadmin deleted user: ${user.email}`);
    } catch (error) {
      logger.error("Error deleting user:", error);
      throw error;
    }
  }

  async listUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: Role
  ) {
    try {
      const skip = (page - 1) * limit;

      const safeSearch = typeof search === "string" ? search : "";
      const where: {
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
          phoneNumber?: { contains: string };
        }>;
        role?: Role;
      } = {};

      if (safeSearch && safeSearch.trim() !== "") {
        where.OR = [
          { name: { contains: safeSearch, mode: "insensitive" } },
          { email: { contains: safeSearch, mode: "insensitive" } },
          { phoneNumber: { contains: safeSearch } },
        ];
      }

      if (role) {
        where.role = role;
      }

      // Debug log
      console.log("User search:", { search: safeSearch, where });

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                bookings: true,
                payments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error listing users:", error);
      // Print error details to console for debugging
      console.error("Prisma error in listUsers:", error);
      throw error;
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          bookings: {
            include: {
              schedule: {
                include: {
                  route: true,
                  bus: true,
                },
              },
              payment: true,
              order: {
                include: {
                  ticket: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
          reservations: {
            include: {
              schedule: {
                include: {
                  route: true,
                },
              },
            },
            orderBy: { reservedAt: "desc" },
          },
          _count: {
            select: {
              bookings: true,
              payments: true,
              reservations: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      throw error;
    }
  }

  // Dashboard Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalUsers,
        totalAdmins,
        totalClients,
        totalBookings,
        totalRevenue,
        activeRoutes,
        totalBuses,
        systemHealth,
        recentActivity,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "CLIENT" } }),
        prisma.booking.count({ where: { deletedAt: null } }),
        prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
        prisma.route.count(),
        prisma.bus.count(),
        this.getSystemHealth(),
        this.getRecentActivity(),
      ]);

      return {
        totalUsers,
        totalAdmins,
        totalClients,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeRoutes,
        totalBuses,
        systemHealth,
        recentActivity,
      };
    } catch (error) {
      logger.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [newUsersThisMonth, roleDistribution, activeUsers, userGrowth] =
        await Promise.all([
          prisma.user.count({
            where: {
              role: Role.CLIENT,
              createdAt: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          }),
          prisma.user.groupBy({
            by: ["role"],
            _count: {
              role: true,
            },
          }),
          prisma.user.count({
            where: {
              role: Role.CLIENT,
            },
          }),
          // Get user growth for last 6 months
          this.getUserGrowthData(),
        ]);

      return {
        userGrowth,
        roleDistribution: roleDistribution.map(
          (item: { role: string; _count: { role: number } }) => ({
            role: item.role,
            count: item._count.role,
          })
        ),
        activeUsers,
        newUsersThisMonth,
      };
    } catch (error) {
      logger.error("Error getting user analytics:", error);
      throw error;
    }
  }

  private async getUserGrowthData(): Promise<
    { month: string; count: number }[]
  > {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const count = await prisma.user.count({
        where: {
          role: Role.CLIENT,
          createdAt: {
            gte: month,
            lte: endOfMonth,
          },
        },
      });

      months.push({
        month: month.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        count,
      });
    }

    return months;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Check database connection
      let databaseStatus = "healthy";
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        databaseStatus = "unhealthy";
        logger.error("Database health check failed:", error);
      }

      // Check API status (basic check)
      const apiStatus = "healthy"; // In a real app, you'd check actual endpoints

      // Get last backup time (mock data for now)
      const lastBackup = null; // In a real app, you'd check actual backup logs

      // Calculate system uptime (mock data for now)
      const systemUptime = Date.now() - new Date("2024-01-01").getTime();

      // Calculate error rate (mock data for now)
      const errorRate = 0.02; // 2% error rate

      return {
        databaseStatus,
        apiStatus,
        lastBackup,
        systemUptime,
        errorRate,
      };
    } catch (error) {
      logger.error("Error getting system health:", error);
      throw error;
    }
  }

  // System Operations
  async cleanupOrphanedBookings(): Promise<{ cleanedCount: number }> {
    try {
      // Find bookings that don't have associated orders
      const orphanedBookings = await prisma.booking.findMany({
        where: {
          orderId: null,
        },
      });

      if (orphanedBookings.length === 0) {
        return { cleanedCount: 0 };
      }

      // Delete orphaned bookings
      await prisma.booking.deleteMany({
        where: {
          orderId: null,
        },
      });

      // Log the cleanup action
      await this.logAction(
        "CLEANUP",
        "Booking",
        0,
        { count: orphanedBookings.length },
        { cleanedCount: orphanedBookings.length }
      );

      logger.info(`Cleaned up ${orphanedBookings.length} orphaned bookings`);
      return { cleanedCount: orphanedBookings.length };
    } catch (error) {
      logger.error("Error cleaning up orphaned bookings:", error);
      throw error;
    }
  }

  async getRecentActivity(limit: number = 10) {
    try {
      const activities = await prisma.auditLog.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });

      return activities.map(
        (activity: {
          id: number;
          action: string;
          entity: string;
          entityId: number;
          createdAt: Date;
          user?: {
            id: number;
            name: string;
            email: string;
            role: string;
          } | null;
        }) => ({
          id: activity.id,
          action: activity.action,
          entity: activity.entity,
          entityId: activity.entityId,
          createdAt: activity.createdAt.toISOString(),
          user: activity.user
            ? {
                id: activity.user.id,
                name: activity.user.name,
                email: activity.user.email,
                role: activity.user.role,
              }
            : undefined,
        })
      );
    } catch (error) {
      logger.error("Error getting recent activity:", error);
      throw error;
    }
  }

  // Audit Logging
  private async logAction(
    action: string,
    entity: string,
    entityId: number,
    before: unknown,
    after: unknown
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          before: before ? JSON.parse(JSON.stringify(before)) : null,
          after: after ? JSON.parse(JSON.stringify(after)) : null,
        },
      });
    } catch (error) {
      logger.error("Error logging audit action:", error);
    }
  }

  async getSystemLogs({
    page = 1,
    limit = 20,
    dateFrom,
    dateTo,
    action,
    entity,
    userId,
  }: {
    page?: number;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
    action?: string;
    entity?: string;
    userId?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = dateFrom;
      if (dateTo) (where.createdAt as Record<string, Date>).lte = dateTo;
    }
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getTickets({
    page = 1,
    limit = 20,
    dateFrom,
    dateTo,
    routeId: _routeId,
    userId,
    status,
  }: {
    page?: number;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
    routeId?: number;
    userId?: number;
    status?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.issuedAt = {};
      if (dateFrom) (where.issuedAt as Record<string, Date>).gte = dateFrom;
      if (dateTo) (where.issuedAt as Record<string, Date>).lte = dateTo;
    }
    if (userId) where.order = { userId };
    if (status) {
      if (where.order) {
        (where.order as Record<string, unknown>).bookings = {
          some: { status },
        };
      } else {
        where.order = { bookings: { some: { status } } };
      }
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: {
            include: {
              user: true,
              bookings: {
                include: {
                  schedule: {
                    include: {
                      route: true,
                      bus: true,
                    },
                  },
                  seat: true,
                  payment: true,
                },
              },
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    // Flatten tickets to one row per booking (for frontend table display)
    const ticketRows = tickets.flatMap(
      (ticket: {
        id: number;
        ticketNumber: string;
        qrCode: string | null;
        order: {
          user: {
            id: number;
            name: string;
            email: string;
            phoneNumber: string;
          } | null;
          bookings: Array<{
            id: number;
            createdAt: Date;
            status: string;
            seat: {
              seatNumber: string;
            } | null;
            schedule: {
              id: number;
              departure: Date;
              route: {
                id: number;
                origin: string;
                destination: string;
              } | null;
              bus: {
                id: number;
                name: string;
              } | null;
            } | null;
            payment: {
              id: number;
              amount: number;
              method: string;
              status: string;
              transactionId: string | null;
            } | null;
          }>;
        } | null;
      }) => {
        if (!ticket.order || !ticket.order.bookings) return [];
        return ticket.order.bookings.map((booking) => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode
            ? `data:image/png;base64,${ticket.qrCode}`
            : undefined,
          bookings: [
            {
              id: booking.id,
              createdAt: booking.createdAt,
              status: booking.status,
              seat: booking.seat
                ? { seatNumber: booking.seat.seatNumber }
                : undefined,
              user: ticket.order!.user
                ? {
                    id: ticket.order!.user.id,
                    name: ticket.order!.user.name,
                    email: ticket.order!.user.email,
                    phoneNumber: ticket.order!.user.phoneNumber,
                  }
                : undefined,
              schedule: booking.schedule
                ? {
                    id: booking.schedule.id,
                    departure: booking.schedule.departure,
                    route: booking.schedule.route
                      ? {
                          id: booking.schedule.route.id,
                          origin: booking.schedule.route.origin,
                          destination: booking.schedule.route.destination,
                        }
                      : undefined,
                    bus: booking.schedule.bus
                      ? {
                          id: booking.schedule.bus.id,
                          name: booking.schedule.bus.name,
                        }
                      : undefined,
                  }
                : undefined,
              payment: booking.payment
                ? {
                    id: booking.payment.id,
                    amount: booking.payment.amount,
                    method: booking.payment.method,
                    status: booking.payment.status,
                    transactionId: booking.payment.transactionId,
                  }
                : undefined,
            },
          ],
        }));
      }
    );

    return {
      tickets: ticketRows,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getTicketById(ticketId: number) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        order: {
          include: {
            user: true,
            bookings: {
              include: {
                schedule: { include: { route: true, bus: true } },
                seat: true,
                payment: true,
              },
            },
          },
        },
      },
    });

    if (!ticket || !ticket.order || !ticket.order.bookings) {
      return null;
    }

    // Return all bookings (seats) for this ticket
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      qrCode: ticket.qrCode
        ? `data:image/png;base64,${ticket.qrCode}`
        : undefined,
      bookings: ticket.order.bookings.map(
        (booking: {
          id: number;
          createdAt: Date;
          status: string;
          seat: {
            seatNumber: string;
          } | null;
          schedule: {
            id: number;
            departure: Date;
            route: {
              id: number;
              origin: string;
              destination: string;
            } | null;
            bus: {
              id: number;
              name: string;
            } | null;
          } | null;
          payment: {
            id: number;
            amount: number;
            method: string;
            status: string;
            transactionId: string | null;
          } | null;
        }) => ({
          id: booking.id,
          createdAt: booking.createdAt,
          status: booking.status,
          seat: booking.seat
            ? { seatNumber: booking.seat.seatNumber }
            : undefined,
          user: ticket.order.user
            ? {
                id: ticket.order.user.id,
                name: ticket.order.user.name,
                email: ticket.order.user.email,
                phoneNumber: ticket.order.user.phoneNumber,
              }
            : undefined,
          schedule: booking.schedule
            ? {
                id: booking.schedule.id,
                departure: booking.schedule.departure,
                route: booking.schedule.route
                  ? {
                      id: booking.schedule.route.id,
                      origin: booking.schedule.route.origin,
                      destination: booking.schedule.route.destination,
                    }
                  : undefined,
                bus: booking.schedule.bus
                  ? {
                      id: booking.schedule.bus.id,
                      name: booking.schedule.bus.name,
                    }
                  : undefined,
              }
            : undefined,
          payment: booking.payment
            ? {
                id: booking.payment.id,
                amount: booking.payment.amount,
                method: booking.payment.method,
                status: booking.payment.status,
                transactionId: booking.payment.transactionId,
              }
            : undefined,
        })
      ),
    };
  }

  async updateTicket(ticketId: number, data: Partial<{ status: string }>) {
    // Only allow updating status for now
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error("Ticket not found");
    // If status is provided, update the related booking status
    if (data.status && ticket.orderId) {
      await prisma.booking.updateMany({
        where: { orderId: ticket.orderId },
        data: { status: data.status as "BOOKED" | "CANCELLED" | "COMPLETED" },
      });
    }
    // Return the updated ticket with relations
    return this.getTicketById(ticketId);
  }

  async deleteTicket(ticketId: number) {
    // Delete the ticket (optionally, also update/cancel the booking)
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error("Ticket not found");
    await prisma.ticket.delete({ where: { id: ticketId } });
    // Optionally, cancel the booking
    if (ticket.orderId) {
      await prisma.booking.updateMany({
        where: { orderId: ticket.orderId },
        data: { status: "CANCELLED" },
      });
    }
    return;
  }

  async getUserTickets(userId: number) {
    const tickets = await prisma.ticket.findMany({
      where: {
        order: {
          userId,
        },
      },
      include: {
        order: {
          include: {
            user: true,
            bookings: {
              include: {
                schedule: { include: { route: true, bus: true } },
                seat: true,
                payment: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
    // Flatten tickets to one row per booking
    return tickets.flatMap(
      (ticket: {
        id: number;
        ticketNumber: string;
        qrCode: string | null;
        order: {
          user: {
            id: number;
            name: string;
            email: string;
            phoneNumber: string;
          } | null;
          bookings: Array<{
            id: number;
            createdAt: Date;
            status: string;
            seat: {
              seatNumber: string;
            } | null;
            schedule: {
              id: number;
              departure: Date;
              route: {
                id: number;
                origin: string;
                destination: string;
              } | null;
              bus: {
                id: number;
                name: string;
              } | null;
            } | null;
            payment: {
              id: number;
              amount: number;
              method: string;
              status: string;
              transactionId: string | null;
            } | null;
          }>;
        } | null;
      }) => {
        if (!ticket.order || !ticket.order.bookings) return [];
        return ticket.order.bookings.map((booking) => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode
            ? `data:image/png;base64,${ticket.qrCode}`
            : undefined,
          bookings: [
            {
              id: booking.id,
              createdAt: booking.createdAt,
              status: booking.status,
              seat: booking.seat
                ? { seatNumber: booking.seat.seatNumber }
                : undefined,
              user: ticket.order!.user
                ? {
                    id: ticket.order!.user.id,
                    name: ticket.order!.user.name,
                    email: ticket.order!.user.email,
                    phoneNumber: ticket.order!.user.phoneNumber,
                  }
                : undefined,
              schedule: booking.schedule
                ? {
                    id: booking.schedule.id,
                    departure: booking.schedule.departure,
                    route: booking.schedule.route
                      ? {
                          id: booking.schedule.route.id,
                          origin: booking.schedule.route.origin,
                          destination: booking.schedule.route.destination,
                        }
                      : undefined,
                    bus: booking.schedule.bus
                      ? {
                          id: booking.schedule.bus.id,
                          name: booking.schedule.bus.name,
                        }
                      : undefined,
                  }
                : undefined,
              payment: booking.payment
                ? {
                    id: booking.payment.id,
                    amount: booking.payment.amount,
                    method: booking.payment.method,
                    status: booking.payment.status,
                    transactionId: booking.payment.transactionId,
                  }
                : undefined,
            },
          ],
        }));
      }
    );
  }
}

export const superadminService = new SuperadminService();
