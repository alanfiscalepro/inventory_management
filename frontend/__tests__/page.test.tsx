import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/app/page';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';

// Mock the hooks
jest.mock('@/hooks/useWarehouses');
jest.mock('@/hooks/useProducts');
jest.mock('framer-motion', () => ({
  motion: {
    header: 'header',
    div: 'div',
  },
}));

const mockUseWarehouses = useWarehouses as jest.MockedFunction<typeof useWarehouses>;
const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;

describe('Dashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render dashboard title', () => {
    mockUseWarehouses.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByText(/WAREHOUSE/i)).toBeInTheDocument();
    expect(screen.getByText(/CONTROL/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseWarehouses.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    mockUseProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<Dashboard />, { wrapper });

    const loadingElements = screen.getAllByText('...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should display warehouse count', () => {
    mockUseWarehouses.mockReturnValue({
      data: [
        { id: 1, name: 'Warehouse 1', location: 'Location 1' },
        { id: 2, name: 'Warehouse 2', location: 'Location 2' },
      ],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Active facilities')).toBeInTheDocument();
  });

  it('should calculate total stock correctly', () => {
    mockUseWarehouses.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [
        { id: 1, sku: 'P1', name: 'Product 1', quantity: 100, reservedQuantity: 10, minStockLevel: 20 },
        { id: 2, sku: 'P2', name: 'Product 2', quantity: 50, reservedQuantity: 5, minStockLevel: 10 },
      ],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Units in inventory')).toBeInTheDocument();
  });

  it('should identify low stock products', () => {
    mockUseWarehouses.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [
        { id: 1, sku: 'P1', name: 'Product 1', quantity: 10, reservedQuantity: 0, minStockLevel: 20 }, // Low stock
        { id: 2, sku: 'P2', name: 'Product 2', quantity: 50, reservedQuantity: 0, minStockLevel: 10 }, // OK
        { id: 3, sku: 'P3', name: 'Product 3', quantity: 5, reservedQuantity: 0, minStockLevel: 30 },  // Low stock
      ],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Products need restocking')).toBeInTheDocument();
  });

  it('should calculate total reserved quantity', () => {
    mockUseWarehouses.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [
        { id: 1, sku: 'P1', name: 'Product 1', quantity: 100, reservedQuantity: 10, minStockLevel: 20 },
        { id: 2, sku: 'P2', name: 'Product 2', quantity: 50, reservedQuantity: 25, minStockLevel: 10 },
      ],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Units reserved')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    mockUseWarehouses.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByRole('link', { name: /Warehouses/i })).toHaveAttribute('href', '/warehouses');
    expect(screen.getByRole('link', { name: /^Products$/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /^Transactions$/i })).toHaveAttribute('href', '/transactions');
    expect(screen.getByRole('link', { name: /^Reservations$/i })).toHaveAttribute('href', '/reservations');
  });

  it('should render quick action buttons', () => {
    mockUseWarehouses.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    mockUseProducts.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper });

    expect(screen.getByText('Add Product')).toBeInTheDocument();
    expect(screen.getByText('New Transaction')).toBeInTheDocument();
    expect(screen.getByText('Create Reservation')).toBeInTheDocument();
  });
});
