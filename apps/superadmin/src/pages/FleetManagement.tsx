import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useFleetManagement } from "@/hooks/useFleetManagement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { superAdminAPI } from "@/services/superadminApi";

const FleetManagement: React.FC = () => {
  const {
    buses,
    routes,
    schedules,
    loading,
    busesLoading,
    routesLoading,
    schedulesLoading,
    operationLoading,
    error,
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
    clearError,
  } = useFleetManagement();
  const [showBusForm, setShowBusForm] = useState(false);
  const [newBus, setNewBus] = useState({
    name: "",
    layoutType: "Standard",
    seatCount: 40,
  });
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [newRoute, setNewRoute] = useState({
    name: "",
    origin: "",
    destination: "",
  });
  const [activeTab, setActiveTab] = useState("buses");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    routeId: 0,
    busId: 0,
    departure: "",
    fare: 0,
    isReturn: false,
  });
  // Edit modal state
  const [editBus, setEditBus] = useState<null | typeof newBus>(null);
  const [editBusId, setEditBusId] = useState<number | null>(null);
  const [editRoute, setEditRoute] = useState<null | typeof newRoute>(null);
  const [editRouteId, setEditRouteId] = useState<number | null>(null);
  // Delete dialog state
  const [deleteType, setDeleteType] = useState<
    null | "bus" | "route" | "schedule"
  >(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  // Add local error state for each form
  const [busFormErrors, setBusFormErrors] = useState<{
    name?: string;
    layoutType?: string;
    seatCount?: string;
  }>({});
  const [routeFormErrors, setRouteFormErrors] = useState<{
    name?: string;
    origin?: string;
    destination?: string;
  }>({});
  const [scheduleFormErrors, setScheduleFormErrors] = useState<{
    routeId?: string;
    busId?: string;
    departure?: string;
    fare?: string;
  }>({});
  // 1. Add editSchedule and editScheduleId state
  const [editSchedule, setEditSchedule] = useState<null | typeof newSchedule>(
    null
  );
  const [editScheduleId, setEditScheduleId] = useState<number | null>(null);
  // 1. Add filter state for each table
  const [busLayoutFilter, setBusLayoutFilter] = useState<string>("");
  const [busSeatMin, setBusSeatMin] = useState<number | "">("");
  const [busSeatMax, setBusSeatMax] = useState<number | "">("");
  const [busRouteFilter, setBusRouteFilter] = useState<string>("");

  const [routeOriginFilter, setRouteOriginFilter] = useState<string>("");
  const [routeDestinationFilter, setRouteDestinationFilter] =
    useState<string>("");

  const [scheduleRouteFilter, setScheduleRouteFilter] = useState<string>("");
  const [scheduleBusFilter, setScheduleBusFilter] = useState<string>("");
  const [scheduleDateFilter, setScheduleDateFilter] = useState<string>("");
  const [scheduleReturnFilter, setScheduleReturnFilter] = useState<string>("");

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchSchedules();
  }, [fetchBuses, fetchRoutes, fetchSchedules]);

  const validateBus = (bus: typeof newBus) => {
    const errors: typeof busFormErrors = {};
    if (!bus.name.trim()) errors.name = "Name is required.";
    if (!bus.layoutType.trim()) errors.layoutType = "Layout type is required.";
    if (!bus.seatCount || bus.seatCount <= 0)
      errors.seatCount = "Seat count must be positive.";
    return errors;
  };
  const validateRoute = (route: typeof newRoute) => {
    const errors: typeof routeFormErrors = {};
    if (!route.name.trim()) errors.name = "Name is required.";
    if (!route.origin.trim()) errors.origin = "Origin is required.";
    if (!route.destination.trim())
      errors.destination = "Destination is required.";
    return errors;
  };
  const validateSchedule = (schedule: typeof newSchedule) => {
    const errors: typeof scheduleFormErrors = {};
    if (!schedule.routeId || schedule.routeId <= 0)
      errors.routeId = "Route is required.";
    if (!schedule.busId || schedule.busId <= 0)
      errors.busId = "Bus is required.";
    if (!schedule.departure) errors.departure = "Departure is required.";
    if (!schedule.fare || schedule.fare <= 0)
      errors.fare = "Fare must be positive.";
    return errors;
  };

  const isScheduleFormValid = () => {
    const errors = validateSchedule(newSchedule);
    return Object.keys(errors).length === 0;
  };

  const handleAddBus = async () => {
    const errors = validateBus(newBus);
    setBusFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      await createBus(newBus);
      setShowBusForm(false);
      setNewBus({ name: "", layoutType: "Standard", seatCount: 40 });
      setBusFormErrors({});
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  const handleAddRoute = async () => {
    const errors = validateRoute(newRoute);
    setRouteFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      await createRoute(newRoute);
      setShowRouteForm(false);
      setNewRoute({ name: "", origin: "", destination: "" });
      setRouteFormErrors({});
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  const handleAddSchedule = async () => {
    const errors = validateSchedule(newSchedule);
    setScheduleFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    // Debug logging
    console.log("Creating schedule with data:", newSchedule);

    // Convert datetime-local to ISO format
    const scheduleData = {
      ...newSchedule,
      departure: new Date(newSchedule.departure).toISOString(),
    };

    console.log("Converted schedule data:", scheduleData);

    try {
      await createSchedule(scheduleData);
      setShowScheduleForm(false);
      setNewSchedule({
        routeId: 0,
        busId: 0,
        departure: "",
        fare: 0,
        isReturn: false,
      });
      setScheduleFormErrors({});
    } catch (err) {
      // Error is already handled by the hook
      console.error("Schedule creation error:", err);
    }
  };

  // Edit handlers
  const handleEditBus = (bus: typeof newBus & { id: number }) => {
    setEditBus({
      name: bus.name,
      layoutType: bus.layoutType,
      seatCount: bus.seatCount,
    });
    setEditBusId(bus.id);
  };
  const handleEditRoute = (route: typeof newRoute & { id: number }) => {
    setEditRoute({
      name: route.name,
      origin: route.origin,
      destination: route.destination,
    });
    setEditRouteId(route.id);
  };
  const handleEditSchedule = (
    schedule: typeof newSchedule & { id: number }
  ) => {
    setEditSchedule({
      routeId: schedule.routeId,
      busId: schedule.busId,
      departure: schedule.departure,
      fare: schedule.fare,
      isReturn: schedule.isReturn,
    });
    setEditScheduleId(schedule.id);
  };

  // Save handlers
  const handleSaveBus = async () => {
    if (!editBus) return;
    const errors = validateBus(editBus);
    setBusFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      await updateBus(editBusId!, editBus);
      setEditBus(null);
      setEditBusId(null);
      setBusFormErrors({});
    } catch (err) {
      // Error is already handled by the hook
    }
  };
  const handleSaveRoute = async () => {
    if (!editRoute) return;
    const errors = validateRoute(editRoute);
    setRouteFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      await updateRoute(editRouteId!, editRoute);
      setEditRoute(null);
      setEditRouteId(null);
      setRouteFormErrors({});
    } catch (err) {
      // Error is already handled by the hook
    }
  };
  const handleSaveSchedule = async () => {
    if (!editSchedule) return;

    const errors = validateSchedule(editSchedule);
    setScheduleFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    // Convert datetime-local to ISO format
    const scheduleData = {
      ...editSchedule,
      departure: new Date(editSchedule.departure).toISOString(),
    };

    try {
      await updateSchedule(editScheduleId!, scheduleData);
      setEditSchedule(null);
      setEditScheduleId(null);
      setScheduleFormErrors({});
    } catch (err) {
      // Error is already handled by the hook
      console.error("Schedule update error:", err);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "bus") {
        await deleteBus(deleteId);
      } else if (deleteType === "route") {
        await deleteRoute(deleteId);
      } else if (deleteType === "schedule") {
        await deleteSchedule(deleteId);
      }
      setDeleteType(null);
      setDeleteId(null);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleRegenerateSeats = async (scheduleId: number) => {
    try {
      await superAdminAPI.regenerateSeats(scheduleId);
      // Refresh schedules to get updated seat data
      await fetchSchedules();
      toast.success("Seats regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating seats:", error);
      toast.error(
        "Failed to regenerate seats. Please check if there are any existing bookings."
      );
    }
  };

  // 2. Add filter UI above each table and filter the displayed data
  // Buses Table Filters
  const filteredBuses = buses.filter((bus) => {
    const matchesLayout =
      !busLayoutFilter || bus.layoutType === busLayoutFilter;
    const matchesSeatMin =
      busSeatMin === "" || bus.seatCount >= Number(busSeatMin);
    const matchesSeatMax =
      busSeatMax === "" || bus.seatCount <= Number(busSeatMax);
    const matchesRoute =
      !busRouteFilter ||
      bus.schedules.some((s) => s.route?.id?.toString() === busRouteFilter);
    return matchesLayout && matchesSeatMin && matchesSeatMax && matchesRoute;
  });
  // Routes Table Filters
  const filteredRoutes = routes.filter((route) => {
    const matchesOrigin =
      !routeOriginFilter || route.origin === routeOriginFilter;
    const matchesDestination =
      !routeDestinationFilter || route.destination === routeDestinationFilter;
    return matchesOrigin && matchesDestination;
  });
  // Schedules Table Filters
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesRoute =
      !scheduleRouteFilter ||
      schedule.routeId.toString() === scheduleRouteFilter;
    const matchesBus =
      !scheduleBusFilter || schedule.busId.toString() === scheduleBusFilter;
    const matchesDate =
      !scheduleDateFilter ||
      schedule.departure.slice(0, 10) === scheduleDateFilter;
    const matchesReturn =
      !scheduleReturnFilter ||
      (scheduleReturnFilter === "return"
        ? schedule.isReturn
        : !schedule.isReturn);
    return matchesRoute && matchesBus && matchesDate && matchesReturn;
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Fleet Management
            </h1>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-medium">Error:</span>
                  <span className="text-red-700">{error}</span>
                  <button
                    onClick={clearError}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <Button
              onClick={refreshAll}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <span>↻</span>
              )}
              Refresh
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowBusForm((v) => !v)}
                    aria-label={showBusForm ? "Cancel add bus" : "Add new bus"}
                    className="w-full sm:w-auto"
                  >
                    {showBusForm ? "Cancel" : "Add Bus"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showBusForm
                    ? "Cancel adding a new bus"
                    : "Add a new bus to the fleet"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowRouteForm((v) => !v)}
                    aria-label={
                      showRouteForm ? "Cancel add route" : "Add new route"
                    }
                    className="w-full sm:w-auto"
                  >
                    {showRouteForm ? "Cancel" : "Add Route"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showRouteForm
                    ? "Cancel adding a new route"
                    : "Add a new route"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>
          <TabsContent value="buses">
            {showBusForm && (
              <Card className="mb-4 transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Add New Bus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                    <input
                      className="border rounded px-2 py-1 flex-1 min-w-0"
                      placeholder="Bus Name"
                      aria-label="Bus Name"
                      value={newBus.name}
                      onChange={(e) =>
                        setNewBus({ ...newBus, name: e.target.value })
                      }
                    />
                    {busFormErrors.name && (
                      <div className="text-xs text-red-500">
                        {busFormErrors.name}
                      </div>
                    )}
                    <select
                      className="border rounded px-2 py-1 flex-1 min-w-0"
                      value={newBus.layoutType}
                      onChange={(e) =>
                        setNewBus({ ...newBus, layoutType: e.target.value })
                      }
                    >
                      <option value="">Select Layout Type</option>
                      <option value="1/2">1/2 (1 Left, 2 Right)</option>
                      <option value="2/1">2/1 (2 Left, 1 Right)</option>
                      <option value="2/2">2/2 (2 Left, 2 Right)</option>
                      <option value="3/2">3/2 (3 Left, 2 Right)</option>
                      <option value="4/2">4/2 (4 Left, 2 Right)</option>
                    </select>
                    {busFormErrors.layoutType && (
                      <div className="text-xs text-red-500">
                        {busFormErrors.layoutType}
                      </div>
                    )}
                    <input
                      className="border rounded px-2 py-1 w-24 flex-shrink-0"
                      type="number"
                      placeholder="Seat Count"
                      aria-label="Seat Count"
                      value={newBus.seatCount}
                      onChange={(e) =>
                        setNewBus({
                          ...newBus,
                          seatCount: Number(e.target.value),
                        })
                      }
                    />
                    {busFormErrors.seatCount && (
                      <div className="text-xs text-red-500">
                        {busFormErrors.seatCount}
                      </div>
                    )}
                    <Button
                      onClick={handleAddBus}
                      aria-label="Confirm add bus"
                      disabled={operationLoading === "createBus"}
                    >
                      {operationLoading === "createBus" ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                      ) : null}{" "}
                      Add
                    </Button>
                    <div className="text-xs text-muted-foreground ml-2 mt-2 md:mt-0">
                      Enter bus name, layout type, and seat count
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Fleets</CardTitle>
              </CardHeader>
              <CardContent>
                {busesLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : buses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No buses found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex flex-wrap gap-4 mb-4 items-end">
                      <select
                        value={busLayoutFilter}
                        onChange={(e) => setBusLayoutFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Layouts</option>
                        {[...new Set(buses.map((b) => b.layoutType))].map(
                          (layout) => (
                            <option key={layout} value={layout}>
                              {layout}
                            </option>
                          )
                        )}
                      </select>
                      <input
                        type="number"
                        value={busSeatMin}
                        onChange={(e) =>
                          setBusSeatMin(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        placeholder="Min Seats"
                        className="border rounded px-2 py-1 w-24"
                      />
                      <input
                        type="number"
                        value={busSeatMax}
                        onChange={(e) =>
                          setBusSeatMax(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        placeholder="Max Seats"
                        className="border rounded px-2 py-1 w-24"
                      />
                      <select
                        value={busRouteFilter}
                        onChange={(e) => setBusRouteFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Routes</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name} ({route.origin} - {route.destination})
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => {
                          setBusLayoutFilter("");
                          setBusSeatMin("");
                          setBusSeatMax("");
                          setBusRouteFilter("");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                    <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Layout
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Seat Count
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Routes
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBuses.map((bus) => (
                          <tr
                            key={bus.id}
                            className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                          >
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {bus.name}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {bus.layoutType}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {bus.seatCount}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {bus.schedules
                                .map(
                                  (s) =>
                                    s.route?.name ||
                                    `${s.route?.origin} - ${s.route?.destination}`
                                )
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="mr-2"
                                onClick={() => handleEditBus(bus)}
                                aria-label={`Edit bus ${bus.name}`}
                              >
                                <span>Edit</span>
                              </Button>
                              <Dialog
                                open={!!editBus && editBusId === bus.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditBus(null);
                                    setEditBusId(null);
                                  }
                                }}
                              >
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Bus</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex flex-col gap-2">
                                    <input
                                      className="border rounded px-2 py-1"
                                      placeholder="Bus Name"
                                      value={editBus?.name || ""}
                                      onChange={(e) =>
                                        setEditBus(
                                          editBus
                                            ? {
                                                ...editBus,
                                                name: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    />
                                    {busFormErrors.name && (
                                      <div className="text-xs text-red-500">
                                        {busFormErrors.name}
                                      </div>
                                    )}
                                    <select
                                      className="border rounded px-2 py-1"
                                      value={editBus?.layoutType || ""}
                                      onChange={(e) =>
                                        setEditBus(
                                          editBus
                                            ? {
                                                ...editBus,
                                                layoutType: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    >
                                      <option value="">
                                        Select Layout Type
                                      </option>
                                      <option value="1/2">
                                        1/2 (1 Left, 2 Right)
                                      </option>
                                      <option value="2/1">
                                        2/1 (2 Left, 1 Right)
                                      </option>
                                      <option value="2/2">
                                        2/2 (2 Left, 2 Right)
                                      </option>
                                      <option value="3/2">
                                        3/2 (3 Left, 2 Right)
                                      </option>
                                      <option value="4/2">
                                        4/2 (4 Left, 2 Right)
                                      </option>
                                    </select>
                                    {busFormErrors.layoutType && (
                                      <div className="text-xs text-red-500">
                                        {busFormErrors.layoutType}
                                      </div>
                                    )}
                                    <input
                                      className="border rounded px-2 py-1"
                                      type="number"
                                      placeholder="Seat Count"
                                      value={editBus?.seatCount || 0}
                                      onChange={(e) =>
                                        setEditBus(
                                          editBus
                                            ? {
                                                ...editBus,
                                                seatCount: Number(
                                                  e.target.value
                                                ),
                                              }
                                            : null
                                        )
                                      }
                                    />
                                    {busFormErrors.seatCount && (
                                      <div className="text-xs text-red-500">
                                        {busFormErrors.seatCount}
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={handleSaveBus}
                                      disabled={
                                        operationLoading ===
                                        `updateBus_${editBusId}`
                                      }
                                    >
                                      {operationLoading ===
                                      `updateBus_${editBusId}` ? (
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                                      ) : null}{" "}
                                      Save
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setDeleteType("bus");
                                  setDeleteId(bus.id);
                                }}
                                disabled={
                                  operationLoading === `deleteBus_${bus.id}`
                                }
                                aria-label={`Delete bus ${bus.name}`}
                              >
                                {operationLoading === `deleteBus_${bus.id}` ? (
                                  <div className="w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin mr-1" />
                                ) : null}
                                <span>Delete</span>
                              </Button>
                              <AlertDialog
                                open={
                                  deleteType === "bus" && deleteId === bus.id
                                }
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setDeleteType(null);
                                    setDeleteId(null);
                                  }
                                }}
                              >
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Bus
                                    </AlertDialogTitle>
                                    <p>
                                      Are you sure you want to delete this bus?
                                    </p>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="routes">
            {showRouteForm && (
              <Card className="mb-4 transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Add New Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                    <input
                      className="border rounded px-2 py-1 flex-1 min-w-0"
                      placeholder="Route Name"
                      aria-label="Route Name"
                      value={newRoute.name}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, name: e.target.value })
                      }
                    />
                    {routeFormErrors.name && (
                      <div className="text-xs text-red-500">
                        {routeFormErrors.name}
                      </div>
                    )}
                    <input
                      className="border rounded px-2 py-1 flex-1 min-w-0"
                      placeholder="Origin"
                      aria-label="Origin"
                      value={newRoute.origin}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, origin: e.target.value })
                      }
                    />
                    {routeFormErrors.origin && (
                      <div className="text-xs text-red-500">
                        {routeFormErrors.origin}
                      </div>
                    )}
                    <input
                      className="border rounded px-2 py-1 flex-1 min-w-0"
                      placeholder="Destination"
                      aria-label="Destination"
                      value={newRoute.destination}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          destination: e.target.value,
                        })
                      }
                    />
                    {routeFormErrors.destination && (
                      <div className="text-xs text-red-500">
                        {routeFormErrors.destination}
                      </div>
                    )}
                    <Button
                      onClick={handleAddRoute}
                      aria-label="Confirm add route"
                      disabled={operationLoading === "createRoute"}
                    >
                      {operationLoading === "createRoute" ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                      ) : null}{" "}
                      Add
                    </Button>
                    <div className="text-xs text-muted-foreground ml-2 mt-2 md:mt-0">
                      Enter route name, origin, and destination
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Routes</CardTitle>
              </CardHeader>
              <CardContent>
                {routesLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : routes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No routes found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex flex-wrap gap-4 mb-4 items-end">
                      <select
                        value={routeOriginFilter}
                        onChange={(e) => setRouteOriginFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Origins</option>
                        {[...new Set(routes.map((r) => r.origin))].map(
                          (origin) => (
                            <option key={origin} value={origin}>
                              {origin}
                            </option>
                          )
                        )}
                      </select>
                      <select
                        value={routeDestinationFilter}
                        onChange={(e) =>
                          setRouteDestinationFilter(e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Destinations</option>
                        {[...new Set(routes.map((r) => r.destination))].map(
                          (dest) => (
                            <option key={dest} value={dest}>
                              {dest}
                            </option>
                          )
                        )}
                      </select>
                      <Button
                        onClick={() => {
                          setRouteOriginFilter("");
                          setRouteDestinationFilter("");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                    <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Origin
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Destination
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoutes.map((route) => (
                          <tr
                            key={route.id}
                            className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                          >
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {route.name}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {route.origin}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                              {route.destination}
                            </td>
                            <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="mr-2"
                                onClick={() => handleEditRoute(route)}
                                aria-label={`Edit route ${route.name}`}
                              >
                                <span>Edit</span>
                              </Button>
                              <Dialog
                                open={!!editRoute && editRouteId === route.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditRoute(null);
                                    setEditRouteId(null);
                                  }
                                }}
                              >
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Route</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex flex-col gap-2">
                                    <input
                                      className="border rounded px-2 py-1"
                                      placeholder="Route Name"
                                      value={editRoute?.name || ""}
                                      onChange={(e) =>
                                        setEditRoute(
                                          editRoute
                                            ? {
                                                ...editRoute,
                                                name: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    />
                                    {routeFormErrors.name && (
                                      <div className="text-xs text-red-500">
                                        {routeFormErrors.name}
                                      </div>
                                    )}
                                    <input
                                      className="border rounded px-2 py-1"
                                      placeholder="Origin"
                                      value={editRoute?.origin || ""}
                                      onChange={(e) =>
                                        setEditRoute(
                                          editRoute
                                            ? {
                                                ...editRoute,
                                                origin: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    />
                                    {routeFormErrors.origin && (
                                      <div className="text-xs text-red-500">
                                        {routeFormErrors.origin}
                                      </div>
                                    )}
                                    <input
                                      className="border rounded px-2 py-1"
                                      placeholder="Destination"
                                      value={editRoute?.destination || ""}
                                      onChange={(e) =>
                                        setEditRoute(
                                          editRoute
                                            ? {
                                                ...editRoute,
                                                destination: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                    />
                                    {routeFormErrors.destination && (
                                      <div className="text-xs text-red-500">
                                        {routeFormErrors.destination}
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={handleSaveRoute}
                                      disabled={
                                        operationLoading ===
                                        `updateRoute_${editRouteId}`
                                      }
                                    >
                                      {operationLoading ===
                                      `updateRoute_${editRouteId}` ? (
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                                      ) : null}{" "}
                                      Save
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setDeleteType("route");
                                  setDeleteId(route.id);
                                }}
                                disabled={
                                  operationLoading === `deleteRoute_${route.id}`
                                }
                                aria-label={`Delete route ${route.name}`}
                              >
                                {operationLoading ===
                                `deleteRoute_${route.id}` ? (
                                  <div className="w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin mr-1" />
                                ) : null}
                                <span>Delete</span>
                              </Button>
                              <AlertDialog
                                open={
                                  deleteType === "route" &&
                                  deleteId === route.id
                                }
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setDeleteType(null);
                                    setDeleteId(null);
                                  }
                                }}
                              >
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Route
                                    </AlertDialogTitle>
                                    <p>
                                      Are you sure you want to delete this
                                      route?
                                    </p>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedules">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Schedules</h2>
              <Button onClick={() => setShowScheduleForm((v) => !v)}>
                {showScheduleForm ? "Cancel" : "Add Schedule"}
              </Button>
            </div>
            {showScheduleForm && (
              <Card className="mb-4 transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Add New Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Route
                        </label>
                        <select
                          className={`border rounded px-3 py-2 w-full ${
                            scheduleFormErrors.routeId
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          value={newSchedule.routeId}
                          onChange={(e) => {
                            const routeId = Number(e.target.value);
                            setNewSchedule({
                              ...newSchedule,
                              routeId,
                            });
                            // Clear error when user selects a valid route
                            if (routeId > 0) {
                              setScheduleFormErrors((prev) => ({
                                ...prev,
                                routeId: undefined,
                              }));
                            }
                          }}
                        >
                          <option value={0}>Select Route</option>
                          {routes.map((route) => (
                            <option key={route.id} value={route.id}>
                              {route.name} ({route.origin} - {route.destination}
                              )
                            </option>
                          ))}
                        </select>
                        {scheduleFormErrors.routeId && (
                          <div className="text-sm text-red-600 font-medium">
                            {scheduleFormErrors.routeId}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Bus
                        </label>
                        <select
                          className={`border rounded px-3 py-2 w-full ${
                            scheduleFormErrors.busId
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          value={newSchedule.busId}
                          onChange={(e) => {
                            const busId = Number(e.target.value);
                            setNewSchedule({
                              ...newSchedule,
                              busId,
                            });
                            // Clear error when user selects a valid bus
                            if (busId > 0) {
                              setScheduleFormErrors((prev) => ({
                                ...prev,
                                busId: undefined,
                              }));
                            }
                          }}
                        >
                          <option value={0}>Select Bus</option>
                          {buses.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                              {bus.name}
                            </option>
                          ))}
                        </select>
                        {scheduleFormErrors.busId && (
                          <div className="text-sm text-red-600 font-medium">
                            {scheduleFormErrors.busId}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Departure
                        </label>
                        <input
                          className={`border rounded px-3 py-2 w-full ${
                            scheduleFormErrors.departure
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          type="datetime-local"
                          value={newSchedule.departure}
                          onChange={(e) => {
                            const departure = e.target.value;
                            setNewSchedule({
                              ...newSchedule,
                              departure,
                            });
                            // Clear error when user enters a departure time
                            if (departure) {
                              setScheduleFormErrors((prev) => ({
                                ...prev,
                                departure: undefined,
                              }));
                            }
                          }}
                        />
                        {scheduleFormErrors.departure && (
                          <div className="text-sm text-red-600 font-medium">
                            {scheduleFormErrors.departure}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Fare
                        </label>
                        <input
                          className={`border rounded px-3 py-2 w-full ${
                            scheduleFormErrors.fare
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          type="number"
                          placeholder="Enter fare amount"
                          value={newSchedule.fare}
                          onChange={(e) => {
                            const fare = Number(e.target.value);
                            setNewSchedule({
                              ...newSchedule,
                              fare,
                            });
                            // Clear error when user enters a valid fare
                            if (fare > 0) {
                              setScheduleFormErrors((prev) => ({
                                ...prev,
                                fare: undefined,
                              }));
                            }
                          }}
                        />
                        {scheduleFormErrors.fare && (
                          <div className="text-sm text-red-600 font-medium">
                            {scheduleFormErrors.fare}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex items-center">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={newSchedule.isReturn}
                            onChange={(e) =>
                              setNewSchedule({
                                ...newSchedule,
                                isReturn: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300"
                          />
                          Return Trip
                        </label>
                      </div>

                      <div className="space-y-2 flex items-end">
                        <Button
                          onClick={handleAddSchedule}
                          disabled={
                            operationLoading === "createSchedule" ||
                            !isScheduleFormValid()
                          }
                          className="w-full"
                        >
                          {operationLoading === "createSchedule" ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                          ) : null}
                          Add Schedule
                        </Button>
                      </div>
                    </div>

                    {/* Show all validation errors at the top */}
                    {Object.keys(scheduleFormErrors).length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm text-red-700 font-medium mb-2">
                          Please fix the following errors:
                        </div>
                        <ul className="text-sm text-red-600 space-y-1">
                          {Object.entries(scheduleFormErrors).map(
                            ([field, error]) => (
                              <li key={field}>• {error}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No schedules found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex flex-wrap gap-4 mb-4 items-end">
                      <select
                        value={scheduleRouteFilter}
                        onChange={(e) => setScheduleRouteFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Routes</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name} ({route.origin} - {route.destination})
                          </option>
                        ))}
                      </select>
                      <select
                        value={scheduleBusFilter}
                        onChange={(e) => setScheduleBusFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Buses</option>
                        {buses.map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={scheduleDateFilter}
                        onChange={(e) => setScheduleDateFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <select
                        value={scheduleReturnFilter}
                        onChange={(e) =>
                          setScheduleReturnFilter(e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="">All Types</option>
                        <option value="return">Return</option>
                        <option value="oneway">One-way</option>
                      </select>
                      <Button
                        onClick={() => {
                          setScheduleRouteFilter("");
                          setScheduleBusFilter("");
                          setScheduleDateFilter("");
                          setScheduleReturnFilter("");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                    <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Route
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Bus
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Layout
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Departure
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Fare
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Return
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSchedules.map(
                          (
                            schedule: import("@/services/superadminApi").Schedule
                          ) => (
                            <tr
                              key={schedule.id}
                              className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                            >
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                                {routes.find((r) => r.id === schedule.routeId)
                                  ?.name || "-"}
                              </td>
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                                {buses.find((b) => b.id === schedule.busId)
                                  ?.name || "-"}
                              </td>
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                                {buses.find((b) => b.id === schedule.busId)
                                  ?.layoutType || "-"}
                              </td>
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                                {schedule.departure
                                  ? new Date(
                                      schedule.departure
                                    ).toLocaleString()
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                                {schedule.fare}
                              </td>
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                                {schedule.isReturn ? "Yes" : "No"}
                              </td>
                              <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mr-2"
                                  onClick={() => handleEditSchedule(schedule)}
                                  aria-label={`Edit schedule ${schedule.id}`}
                                >
                                  <span>Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mr-2"
                                  onClick={() =>
                                    handleRegenerateSeats(schedule.id)
                                  }
                                  aria-label={`Regenerate seats for schedule ${schedule.id}`}
                                >
                                  <span>Regenerate Seats</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteType("schedule");
                                    setDeleteId(schedule.id);
                                  }}
                                  disabled={
                                    operationLoading ===
                                    `deleteSchedule_${schedule.id}`
                                  }
                                >
                                  {operationLoading ===
                                  `deleteSchedule_${schedule.id}` ? (
                                    <div className="w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin mr-1" />
                                  ) : null}
                                  Delete
                                </Button>
                                <AlertDialog
                                  open={
                                    deleteType === "schedule" &&
                                    deleteId === schedule.id
                                  }
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setDeleteType(null);
                                      setDeleteId(null);
                                    }
                                  }}
                                >
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Schedule
                                      </AlertDialogTitle>
                                      <p>
                                        Are you sure you want to delete this
                                        schedule?
                                      </p>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDelete}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Dialog
                                  open={
                                    !!editSchedule &&
                                    editScheduleId === schedule.id
                                  }
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setEditSchedule(null);
                                      setEditScheduleId(null);
                                      setScheduleFormErrors({});
                                    }
                                  }}
                                >
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Schedule</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-2">
                                      <select
                                        className="border rounded px-2 py-1"
                                        value={editSchedule?.routeId || 0}
                                        onChange={(e) =>
                                          setEditSchedule(
                                            editSchedule
                                              ? {
                                                  ...editSchedule,
                                                  routeId: Number(
                                                    e.target.value
                                                  ),
                                                }
                                              : null
                                          )
                                        }
                                      >
                                        <option value={0}>Select Route</option>
                                        {routes.map((route) => (
                                          <option
                                            key={route.id}
                                            value={route.id}
                                          >
                                            {route.name} ({route.origin} -{" "}
                                            {route.destination})
                                          </option>
                                        ))}
                                      </select>
                                      {scheduleFormErrors.routeId && (
                                        <div className="text-xs text-red-500">
                                          {scheduleFormErrors.routeId}
                                        </div>
                                      )}
                                      <select
                                        className="border rounded px-2 py-1"
                                        value={editSchedule?.busId || 0}
                                        onChange={(e) =>
                                          setEditSchedule(
                                            editSchedule
                                              ? {
                                                  ...editSchedule,
                                                  busId: Number(e.target.value),
                                                }
                                              : null
                                          )
                                        }
                                      >
                                        <option value={0}>Select Bus</option>
                                        {buses.map((bus) => (
                                          <option key={bus.id} value={bus.id}>
                                            {bus.name}
                                          </option>
                                        ))}
                                      </select>
                                      {scheduleFormErrors.busId && (
                                        <div className="text-xs text-red-500">
                                          {scheduleFormErrors.busId}
                                        </div>
                                      )}
                                      <input
                                        className="border rounded px-2 py-1"
                                        type="datetime-local"
                                        value={editSchedule?.departure || ""}
                                        onChange={(e) =>
                                          setEditSchedule(
                                            editSchedule
                                              ? {
                                                  ...editSchedule,
                                                  departure: e.target.value,
                                                }
                                              : null
                                          )
                                        }
                                      />
                                      {scheduleFormErrors.departure && (
                                        <div className="text-xs text-red-500">
                                          {scheduleFormErrors.departure}
                                        </div>
                                      )}
                                      <input
                                        className="border rounded px-2 py-1"
                                        type="number"
                                        placeholder="Fare"
                                        value={editSchedule?.fare || 0}
                                        onChange={(e) =>
                                          setEditSchedule(
                                            editSchedule
                                              ? {
                                                  ...editSchedule,
                                                  fare: Number(e.target.value),
                                                }
                                              : null
                                          )
                                        }
                                      />
                                      {scheduleFormErrors.fare && (
                                        <div className="text-xs text-red-500">
                                          {scheduleFormErrors.fare}
                                        </div>
                                      )}
                                      <label className="flex items-center gap-1">
                                        <input
                                          type="checkbox"
                                          checked={
                                            editSchedule?.isReturn || false
                                          }
                                          onChange={(e) =>
                                            setEditSchedule(
                                              editSchedule
                                                ? {
                                                    ...editSchedule,
                                                    isReturn: e.target.checked,
                                                  }
                                                : null
                                            )
                                          }
                                        />
                                        Return
                                      </label>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        onClick={handleSaveSchedule}
                                        disabled={
                                          operationLoading ===
                                          `updateSchedule_${editScheduleId}`
                                        }
                                      >
                                        {operationLoading ===
                                        `updateSchedule_${editScheduleId}` ? (
                                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                                        ) : null}{" "}
                                        Save
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FleetManagement;
