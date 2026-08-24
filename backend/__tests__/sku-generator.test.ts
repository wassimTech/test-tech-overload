import type { Core } from '@strapi/strapi';
import { generateSku } from '@/api/sellable-unit/services/sku-generator';
import sellableUnitLifecycles from '@/api/sellable-unit/content-types/sellable-unit/lifecycles';

interface MockStrapiInstance {
  db: {
    connection: {
      raw: jest.Mock;
    };
  };
}

describe('SKU Generator Service & Lifecycles (T-08)', () => {
  let mockRaw: jest.Mock;
  let mockStrapi: MockStrapiInstance;

  beforeEach(() => {
    mockRaw = jest.fn();
    mockStrapi = {
      db: {
        connection: {
          raw: mockRaw,
        },
      },
    };
  });

  describe('generateSku', () => {
    it('should query PostgreSQL sequence sku_seq and format as VIN-000001 for nextval 1', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: '1' }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(mockRaw).toHaveBeenCalledTimes(1);
      expect(mockRaw).toHaveBeenCalledWith("SELECT nextval('sku_seq');");
      expect(sku).toBe('VIN-000001');
    });

    it('should format correctly for nextval 2 -> VIN-000002', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: 2 }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(sku).toBe('VIN-000002');
    });

    it('should format large sequence numbers with zero-padding (e.g. 1234 -> VIN-001234)', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: '1234' }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(sku).toBe('VIN-001234');
    });

    it('should format numbers with padding on different values (e.g. 42 -> VIN-000042)', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: 42 }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(sku).toBe('VIN-000042');
    });

    it('should format 999999 -> VIN-999999 (boundary 6-digit value)', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: '999999' }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(sku).toBe('VIN-999999');
    });

    it('should format numbers with 6 or more digits without losing precision (e.g. 1000000 -> VIN-1000000)', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: 1000000 }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(sku).toBe('VIN-1000000');
    });

    it('should support alternative row shape like uppercase NEXTVAL or direct array', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ NEXTVAL: '5' }],
      });

      const sku = await generateSku(mockStrapi as unknown as Core.Strapi);

      expect(sku).toBe('VIN-000005');
    });

    it('should throw an error if database query fails', async () => {
      mockRaw.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(generateSku(mockStrapi as unknown as Core.Strapi)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should throw an error if sequence returns empty or invalid value', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [],
      });

      await expect(generateSku(mockStrapi as unknown as Core.Strapi)).rejects.toThrow(
        'Failed to retrieve next sequence value from sku_seq'
      );
    });
  });

  describe('SellableUnit Lifecycle Hook (beforeCreate)', () => {
    it('should auto-generate SKU and assign it to data.sku when creating a SellableUnit', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: '1' }],
      });

      const event = {
        params: {
          data: {
            price: 25.0,
            currency: 'EUR',
          } as Record<string, unknown>,
        },
      };

      // Set global strapi for lifecycle context if strapi instance is accessed globally
      (global as unknown as { strapi: Core.Strapi }).strapi = mockStrapi as unknown as Core.Strapi;

      await sellableUnitLifecycles.beforeCreate(event);

      expect(event.params.data.sku).toBe('VIN-000001');
    });

    it('should ignore any manual SKU provided in the request payload and overwrite it with auto-generated SKU', async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [{ nextval: '2' }],
      });

      const event = {
        params: {
          data: {
            sku: 'MANUAL-SKU-999',
            price: 30.0,
          } as Record<string, unknown>,
        },
      };

      (global as unknown as { strapi: Core.Strapi }).strapi = mockStrapi as unknown as Core.Strapi;

      await sellableUnitLifecycles.beforeCreate(event);

      expect(event.params.data.sku).toBe('VIN-000002');
    });
  });
});
