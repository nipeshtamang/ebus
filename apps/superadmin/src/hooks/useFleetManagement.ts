import { useState, useCallback, useRef } from "react";
import { fleetAPI, Bus, Route, Schedule } from "@/services/superadminApi";
import { toast } from "sonner";

export function useFleetManagement() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Individual loading states for better UX
  const [busesLoading, setBusesLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // Operation loading states
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // Cache for optimistic updates
  const previousData = useRef<{
    buses: Bus[];
    routes: Route[];
    schedules: Schedule[];
  }>({ buses: [], routes: [], schedules: [] });

  // Generic error handler
  const handleError = useCallback((error: unknown, operation: string) => {
    const errorMessage =
      error instanceof Error ? error.message : `Failed to ${operation}`;
    setError(errorMessage);
    toast.error(errorMessage);
    console.error(`Error in ${operation}:`, error);
  }, []);

  // Generic success handler
  const handleSuccess = useCallback((message: string) => {
    setError(null);
    toast.success(message);
  }, []);

  // Buses
  const fetchBuses = useCallback(async () => {
    setBusesLoading(true);
    setError(null);
    try {
      const res = await fleetAPI.getAllBuses();
      previousData.current.buses = res.data;
      setBuses(res.data);
    } catch (err) {
      handleError(err, "load buses");
    } finally {
      setBusesLoading(false);
    }
  }, [handleError]);

  const createBus = useCallback(
    async (data: { name: string; layoutType: string; seatCount: number }) => {
      setOperationLoading("createBus");
      try {
        // Optimistic update
        const optimisticBus: Bus = {
          id: Date.now(), // Temporary ID
          name: data.name,
          layoutType: data.layoutType,
          seatCount: data.seatCount,
          schedules: [],
        };

        setBuses((prev) => [...prev, optimisticBus]);

        // Actual API call
        const response = await fleetAPI.createBus(data);

        // Replace optimistic data with real data
        setBuses((prev) =>
          prev.map((bus) => (bus.id === optimisticBus.id ? response.data : bus))
        );

        handleSuccess("Bus created successfully!");
      } catch (err) {
        // Revert optimistic update on error
        setBuses((prev) => prev.filter((bus) => bus.id !== Date.now()));
        handleError(err, "create bus");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [handleError, handleSuccess]
  );

  const updateBus = useCallback(
    async (id: number, data: Partial<Bus>) => {
      setOperationLoading(`updateBus_${id}`);
      try {
        // Optimistic update
        setBuses((prev) =>
          prev.map((bus) => (bus.id === id ? { ...bus, ...data } : bus))
        );

        // Actual API call
        const response = await fleetAPI.updateBus(id, data);

        // Update with real data
        setBuses((prev) =>
          prev.map((bus) => (bus.id === id ? response.data : bus))
        );

        handleSuccess("Bus updated successfully!");
      } catch (err) {
        // Revert optimistic update on error
        setBuses((prev) =>
          prev.map((bus) =>
            bus.id === id
              ? previousData.current.buses.find((b) => b.id === id) || bus
              : bus
          )
        );
        handleError(err, "update bus");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [handleError, handleSuccess]
  );

  const deleteBus = useCallback(
    async (id: number) => {
      setOperationLoading(`deleteBus_${id}`);
      try {
        // Optimistic update
        setBuses((prev) => prev.filter((bus) => bus.id !== id));

        // Actual API call
        await fleetAPI.deleteBus(id);

        handleSuccess("Bus deleted successfully!");
      } catch (err) {
        // Revert optimistic update on error
        const busToDelete = buses.find((bus) => bus.id === id);
        if (busToDelete) {
          setBuses((prev) => [...prev, busToDelete]);
        }
        handleError(err, "delete bus");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [buses, handleError, handleSuccess]
  );

  // Routes
  const fetchRoutes = useCallback(async () => {
    setRoutesLoading(true);
    setError(null);
    try {
      const res = await fleetAPI.getAllRoutes();
      previousData.current.routes = res.data;
      setRoutes(res.data);
    } catch (err) {
      handleError(err, "load routes");
    } finally {
      setRoutesLoading(false);
    }
  }, [handleError]);

  const createRoute = useCallback(
    async (data: { name: string; origin: string; destination: string }) => {
      setOperationLoading("createRoute");
      try {
        // Optimistic update
        const optimisticRoute: Route = {
          id: Date.now(),
          name: data.name,
          origin: data.origin,
          destination: data.destination,
        };

        setRoutes((prev) => [...prev, optimisticRoute]);

        // Actual API call
        const response = await fleetAPI.createRoute(data);

        // Replace optimistic data with real data
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === optimisticRoute.id ? response.data : route
          )
        );

        handleSuccess("Route created successfully!");
      } catch (err) {
        // Revert optimistic update on error
        setRoutes((prev) => prev.filter((route) => route.id !== Date.now()));
        handleError(err, "create route");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [handleError, handleSuccess]
  );

  const updateRoute = useCallback(
    async (id: number, data: Partial<Route>) => {
      setOperationLoading(`updateRoute_${id}`);
      try {
        // Optimistic update
        setRoutes((prev) =>
          prev.map((route) => (route.id === id ? { ...route, ...data } : route))
        );

        // Actual API call
        const response = await fleetAPI.updateRoute(id, data);

        // Update with real data
        setRoutes((prev) =>
          prev.map((route) => (route.id === id ? response.data : route))
        );

        handleSuccess("Route updated successfully!");
      } catch (err) {
        // Revert optimistic update on error
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === id
              ? previousData.current.routes.find((r) => r.id === id) || route
              : route
          )
        );
        handleError(err, "update route");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [handleError, handleSuccess]
  );

  const deleteRoute = useCallback(
    async (id: number) => {
      setOperationLoading(`deleteRoute_${id}`);
      try {
        // Optimistic update
        setRoutes((prev) => prev.filter((route) => route.id !== id));

        // Actual API call
        await fleetAPI.deleteRoute(id);

        handleSuccess("Route deleted successfully!");
      } catch (err) {
        // Revert optimistic update on error
        const routeToDelete = routes.find((route) => route.id === id);
        if (routeToDelete) {
          setRoutes((prev) => [...prev, routeToDelete]);
        }
        handleError(err, "delete route");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [routes, handleError, handleSuccess]
  );

  // Schedules
  const fetchSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    setError(null);
    try {
      const res = await fleetAPI.getAllSchedules();
      previousData.current.schedules = res.data;
      setSchedules(res.data);
    } catch (err) {
      handleError(err, "load schedules");
    } finally {
      setSchedulesLoading(false);
    }
  }, [handleError]);

  const createSchedule = useCallback(
    async (data: Omit<Schedule, "id">) => {
      setOperationLoading("createSchedule");
      try {
        // Debug logging
        console.log("Creating schedule with data:", data);

        // Optimistic update
        const optimisticSchedule: Schedule = {
          id: Date.now(),
          ...data,
        };

        setSchedules((prev) => [...prev, optimisticSchedule]);

        // Actual API call
        const response = await fleetAPI.createSchedule(data);
        console.log("Schedule creation response:", response);

        // Replace optimistic data with real data
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === optimisticSchedule.id ? response.data : schedule
          )
        );

        handleSuccess("Schedule created successfully!");
      } catch (err) {
        // Detailed error logging
        console.error("Schedule creation error details:", {
          error: err,
          response: (err as { response?: { data?: unknown; status?: number } })
            ?.response?.data,
          status: (err as { response?: { status?: number } })?.response?.status,
          message: (err as { message?: string })?.message,
        });

        
        // Revert optimistic update on error
        setSchedules((prev) =>
          prev.filter((schedule) => schedule.id !== Date.now())
        );
        handleError(err, "create schedule");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [handleError, handleSuccess]
  );

  const updateSchedule = useCallback(
    async (id: number, data: Partial<Schedule>) => {
      setOperationLoading(`updateSchedule_${id}`);
      try {
        // Optimistic update
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === id ? { ...schedule, ...data } : schedule
          )
        );

        // Actual API call
        const response = await fleetAPI.updateSchedule(id, data);

        // Update with real data
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === id ? response.data : schedule
          )
        );

        handleSuccess("Schedule updated successfully!");
      } catch (err) {
        // Revert optimistic update on error
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === id
              ? previousData.current.schedules.find((s) => s.id === id) ||
                schedule
              : schedule
          )
        );
        handleError(err, "update schedule");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [handleError, handleSuccess]
  );

  const deleteSchedule = useCallback(
    async (id: number) => {
      setOperationLoading(`deleteSchedule_${id}`);
      try {
        // Optimistic update
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));

        // Actual API call
        await fleetAPI.deleteSchedule(id);

        handleSuccess("Schedule deleted successfully!");
      } catch (err) {
        // Revert optimistic update on error
        const scheduleToDelete = schedules.find(
          (schedule) => schedule.id === id
        );
        if (scheduleToDelete) {
          setSchedules((prev) => [...prev, scheduleToDelete]);
        }
        handleError(err, "delete schedule");
        throw err;
      } finally {
        setOperationLoading(null);
      }
    },
    [schedules, handleError, handleSuccess]
  );

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchBuses(), fetchRoutes(), fetchSchedules()]);
      handleSuccess("Data refreshed successfully!");
    } catch (err) {
      handleError(err, "refresh data");
    } finally {
      setLoading(false);
    }
  }, [fetchBuses, fetchRoutes, fetchSchedules, handleError, handleSuccess]);

  return {
    // Data
    buses,
    routes,
    schedules,

    // Loading states
    loading,
    busesLoading,
    routesLoading,
    schedulesLoading,
    operationLoading,

    // Error state
    error,

    // Actions
    fetchBuses,
    createBus,
    updateBus,
    deleteBus,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refreshAll,

    // Utility
    clearError: () => setError(null),
  };
}
