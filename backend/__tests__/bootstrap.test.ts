import type { Core } from '@strapi/strapi';
import indexExport from '../src/index';

interface MockStrapiInstance {
  db: {
    connection: {
      raw: jest.Mock;
    };
  };
  documents: jest.Mock;
}

describe('Strapi Bootstrap & Seed', () => {
  let mockRaw: jest.Mock;
  let mockFindFirst: jest.Mock;
  let mockCreate: jest.Mock;
  let mockStrapi: MockStrapiInstance;

  beforeEach(() => {
    mockRaw = jest.fn().mockResolvedValue(undefined);
    mockFindFirst = jest.fn();
    mockCreate = jest.fn().mockResolvedValue({
      id: 1,
      documentId: 'doc-vinyl-store-1',
      name: 'Vinyl Store',
      slug: 'vinyl-store',
      isActive: true,
    });

    mockStrapi = {
      db: {
        connection: {
          raw: mockRaw,
        },
      },
      documents: jest.fn((uid: string) => {
        if (uid === 'api::tenant.tenant') {
          return {
            findFirst: mockFindFirst,
            create: mockCreate,
          };
        }
        throw new Error(`Unexpected document uid: ${uid}`);
      }),
    };
  });

  it('should export register and bootstrap functions', () => {
    expect(indexExport).toBeDefined();
    expect(typeof indexExport.register).toBe('function');
    expect(typeof indexExport.bootstrap).toBe('function');
  });

  it('should create PostgreSQL sequence sku_seq if not exists', async () => {
    mockFindFirst.mockResolvedValue({ id: 1, slug: 'vinyl-store' });

    await indexExport.bootstrap({ strapi: mockStrapi as unknown as Core.Strapi });

    expect(mockRaw).toHaveBeenCalledTimes(1);
    expect(mockRaw).toHaveBeenCalledWith('CREATE SEQUENCE IF NOT EXISTS sku_seq START 1;');
  });

  it('should create default test tenant "Vinyl Store" when it does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    await indexExport.bootstrap({ strapi: mockStrapi as unknown as Core.Strapi });

    expect(mockStrapi.documents).toHaveBeenCalledWith('api::tenant.tenant');
    expect(mockFindFirst).toHaveBeenCalledWith({
      filters: { slug: 'vinyl-store' },
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: 'Vinyl Store',
        slug: 'vinyl-store',
        isActive: true,
      },
    });
  });

  it('should be idempotent and not recreate tenant if "vinyl-store" already exists', async () => {
    mockFindFirst.mockResolvedValue({
      id: 1,
      documentId: 'doc-vinyl-store-1',
      name: 'Vinyl Store',
      slug: 'vinyl-store',
      isActive: true,
    });

    await indexExport.bootstrap({ strapi: mockStrapi as unknown as Core.Strapi });

    expect(mockFindFirst).toHaveBeenCalledWith({
      filters: { slug: 'vinyl-store' },
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
