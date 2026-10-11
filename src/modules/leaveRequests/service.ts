import { api } from "../../api/axios";
import { ApiError, handleAxiosError } from "../../api/ApiError"; 
import type { CreateLeaveRequest, LeaveRequest } from "./model";

export const LeaveRequestService = {
    async fetchAllAdmin(): Promise<LeaveRequest[]> {
    try {
         const response = await api.get('/leave-requests'); 
    return response.data;
        
    } catch (error) {
        throw handleAxiosError(error);
    }
},

async approve(id: number, admin_comment?: string): Promise<LeaveRequest> {    
    try {
        const response = await api.put(`/leave-requests/${id}/approve`, { admin_comment }); 
    return response.data.request;
    } catch (error) {
        throw handleAxiosError(error);
    }
},

async reject(id: number, admin_comment?: string): Promise<LeaveRequest> {
    
    try {
        const response = await api.put(`/leave-requests/${id}/reject`, { admin_comment }); 
    return response.data.request;
    } catch (error) {
        throw handleAxiosError(error);
    }
},

    async fetchMyLeaves(): Promise<LeaveRequest[]> {
        try {
            const response = await api.get('/me/leave-requests'); 
            return response.data; 
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async create(data: CreateLeaveRequest): Promise<LeaveRequest> {
        try {
            const response = await api.post('/leave-requests', data); 
            return response.data.request;
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await api.delete(`/leave-requests/${id}`); 
        } catch (error) {
            throw handleAxiosError(error);
        }
    }
};

export { ApiError };