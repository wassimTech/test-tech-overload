import productSchema from '@/api/product/content-types/product/schema.json';
import productController from '@/api/product/controllers/product';
import productService from '@/api/product/services/product';
import productRoutes from '@/api/product/routes/product';
import { ProductType } from '@/common/enums';

describe('Product Content Type', () => {
  describe('Schema Definition', () => {
    it('should have correct kind, collectionName, and info', () => {
      expect(productSchema.kind).toBe('collectionType');
      expect(productSchema.collectionName).toBe('products');
      expect(productSchema.info.singularName).toBe('product');
      expect(productSchema.info.pluralName).toBe('products');
      expect(productSchema.info.displayName).toBe('Product');
    });

    it('should have draftAndPublish disabled', () => {
      expect(productSchema.options.draftAndPublish).toBe(false);
    });

    it('should define "tenant" as a required manyToOne relation to api::tenant.tenant', () => {
      const tenantAttr = productSchema.attributes.tenant;
      expect(tenantAttr).toBeDefined();
      expect(tenantAttr.type).toBe('relation');
      expect(tenantAttr.relation).toBe('manyToOne');
      expect(tenantAttr.target).toBe('api::tenant.tenant');
      expect(tenantAttr.required).toBe(true);
    });

    it('should define "productType" as a required enum ["vinyl"] with default "vinyl"', () => {
      const productTypeAttr = productSchema.attributes.productType;
      expect(productTypeAttr).toBeDefined();
      expect(productTypeAttr.type).toBe('enumeration');
      expect(productTypeAttr.enum).toEqual([ProductType.VINYL]);
      expect(productTypeAttr.default).toBe(ProductType.VINYL);
      expect(productTypeAttr.required).toBe(true);
    });

    it('should define "title" as a required string', () => {
      const titleAttr = productSchema.attributes.title;
      expect(titleAttr).toBeDefined();
      expect(titleAttr.type).toBe('string');
      expect(titleAttr.required).toBe(true);
    });

    it('should define "artist" as a required string', () => {
      const artistAttr = productSchema.attributes.artist;
      expect(artistAttr).toBeDefined();
      expect(artistAttr.type).toBe('string');
      expect(artistAttr.required).toBe(true);
    });

    it('should define "description" as optional text', () => {
      const descAttr = productSchema.attributes.description;
      expect(descAttr).toBeDefined();
      expect(descAttr.type).toBe('text');
      expect((descAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "label" as a required string', () => {
      const labelAttr = productSchema.attributes.label;
      expect(labelAttr).toBeDefined();
      expect(labelAttr.type).toBe('string');
      expect(labelAttr.required).toBe(true);
    });

    it('should define "year" as a required integer', () => {
      const yearAttr = productSchema.attributes.year;
      expect(yearAttr).toBeDefined();
      expect(yearAttr.type).toBe('integer');
      expect(yearAttr.required).toBe(true);
    });

    it('should define "country" as a required string', () => {
      const countryAttr = productSchema.attributes.country;
      expect(countryAttr).toBeDefined();
      expect(countryAttr.type).toBe('string');
      expect(countryAttr.required).toBe(true);
    });

    it('should define "format" as a required string', () => {
      const formatAttr = productSchema.attributes.format;
      expect(formatAttr).toBeDefined();
      expect(formatAttr.type).toBe('string');
      expect(formatAttr.required).toBe(true);
    });

    it('should define "barcode" as optional string', () => {
      const barcodeAttr = productSchema.attributes.barcode;
      expect(barcodeAttr).toBeDefined();
      expect(barcodeAttr.type).toBe('string');
      expect((barcodeAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "discogsReleaseId" as optional string', () => {
      const discogsReleaseIdAttr = productSchema.attributes.discogsReleaseId;
      expect(discogsReleaseIdAttr).toBeDefined();
      expect(discogsReleaseIdAttr.type).toBe('string');
      expect((discogsReleaseIdAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "discogsMasterId" as optional string', () => {
      const discogsMasterIdAttr = productSchema.attributes.discogsMasterId;
      expect(discogsMasterIdAttr).toBeDefined();
      expect(discogsMasterIdAttr.type).toBe('string');
      expect((discogsMasterIdAttr as { required?: boolean }).required).toBeUndefined();
    });
  });

  describe('API Controllers, Services, and Routes', () => {
    it('should export Strapi core controller factory wrapper', () => {
      expect(productController).toBeDefined();
    });

    it('should export Strapi core service factory wrapper', () => {
      expect(productService).toBeDefined();
    });

    it('should export Strapi core router factory wrapper', () => {
      expect(productRoutes).toBeDefined();
    });
  });
});
