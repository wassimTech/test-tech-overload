import tenantSchema from '@/api/tenant/content-types/tenant/schema.json';
import tenantController from '@/api/tenant/controllers/tenant';
import tenantService from '@/api/tenant/services/tenant';
import tenantRoutes from '@/api/tenant/routes/tenant';

describe('Tenant Content Type', () => {
  describe('Schema Definition', () => {
    it('should have correct kind, collectionName, and info', () => {
      expect(tenantSchema.kind).toBe('collectionType');
      expect(tenantSchema.collectionName).toBe('tenants');
      expect(tenantSchema.info.singularName).toBe('tenant');
      expect(tenantSchema.info.pluralName).toBe('tenants');
      expect(tenantSchema.info.displayName).toBe('Tenant');
    });

    it('should have draftAndPublish disabled', () => {
      expect(tenantSchema.options.draftAndPublish).toBe(false);
    });

    it('should define "name" as a required string', () => {
      const nameAttr = tenantSchema.attributes.name;
      expect(nameAttr).toBeDefined();
      expect(nameAttr.type).toBe('string');
      expect(nameAttr.required).toBe(true);
    });

    it('should define "slug" as a required and unique string', () => {
      const slugAttr = tenantSchema.attributes.slug;
      expect(slugAttr).toBeDefined();
      expect(slugAttr.type).toBe('string');
      expect(slugAttr.required).toBe(true);
      expect(slugAttr.unique).toBe(true);
    });

    it('should define "isActive" as a boolean with default true', () => {
      const isActiveAttr = tenantSchema.attributes.isActive;
      expect(isActiveAttr).toBeDefined();
      expect(isActiveAttr.type).toBe('boolean');
      expect(isActiveAttr.default).toBe(true);
    });
  });

  describe('API Controllers, Services, and Routes', () => {
    it('should export Strapi core controller factory wrapper', () => {
      expect(tenantController).toBeDefined();
    });

    it('should export Strapi core service factory wrapper', () => {
      expect(tenantService).toBeDefined();
    });

    it('should export Strapi core router factory wrapper', () => {
      expect(tenantRoutes).toBeDefined();
    });
  });
});
