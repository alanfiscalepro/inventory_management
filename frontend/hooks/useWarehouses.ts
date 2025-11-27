import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { warehouseApi, Warehouse } from '@/lib/api';

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await warehouseApi.getAll();
      return response.data;
    },
  });
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const response = await warehouseApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Warehouse>) => {
      const response = await warehouseApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Warehouse> }) => {
      const response = await warehouseApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', variables.id] });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await warehouseApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}
