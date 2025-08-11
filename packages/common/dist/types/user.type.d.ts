import { Role } from "./role.enum";
export interface User {
    id: number;
    name: string;
    phoneNumber: string;
    role: Role;
}
