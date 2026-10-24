import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/types";

interface TicketFilterState {
  search: string;
  status: TicketStatus | null;
  category: TicketCategory | null;
  priority: TicketPriority | null;
  assignedTo: string | null;
  dateFrom: string;
  dateTo: string;
  sort: "createdAt" | "updatedAt" | "priority";
  order: "asc" | "desc";
  page: number;

  setSearch: (search: string) => void;
  setStatus: (status: TicketStatus | null) => void;
  setCategory: (category: TicketCategory | null) => void;
  setPriority: (priority: TicketPriority | null) => void;
  setAssignedTo: (assignedTo: string | null) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setSort: (sort: TicketFilterState["sort"]) => void;
  setOrder: (order: TicketFilterState["order"]) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

const defaults = {
  search: "",
  status: null as TicketStatus | null,
  category: null as TicketCategory | null,
  priority: null as TicketPriority | null,
  assignedTo: null as string | null,
  dateFrom: "",
  dateTo: "",
  sort: "createdAt" as const,
  order: "desc" as const,
  page: 1,
};

export const useTicketFilterStore = create<TicketFilterState>()(
  persist(
    (set) => ({
      ...defaults,
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setCategory: (category) => set({ category, page: 1 }),
      setPriority: (priority) => set({ priority, page: 1 }),
      setAssignedTo: (assignedTo) => set({ assignedTo, page: 1 }),
      setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
      setDateTo: (dateTo) => set({ dateTo, page: 1 }),
      setSort: (sort) => set({ sort, page: 1 }),
      setOrder: (order) => set({ order, page: 1 }),
      setPage: (page) => set({ page }),
      reset: () => set({ ...defaults }),
    }),
    {
      name: "bookleaf-ticket-filters",
      partialize: (state) => ({
        sort: state.sort,
        order: state.order,
      }),
    },
  ),
);
