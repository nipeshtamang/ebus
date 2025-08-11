export interface Schedule {
    id: number;
    routeId: number;
    busId: number;
    departure: string;
    isReturn: boolean;
    fare: number;
}
