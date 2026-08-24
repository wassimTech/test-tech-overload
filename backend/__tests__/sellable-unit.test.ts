import sellableUnitSchema from '../src/api/sellable-unit/content-types/sellable-unit/schema.json';
import sellableUnitController from '../src/api/sellable-unit/controllers/sellable-unit';
import sellableUnitService from '../src/api/sellable-unit/services/sellable-unit';
import sellableUnitRoutes from '../src/api/sellable-unit/routes/sellable-unit';
import {
  DiscCondition,
  SleeveCondition,
  SellableUnitStatus,
} from '../src/common/enums';

describe('SellableUnit Content Type', () => {
  describe('Schema Definition', () => {
    it('should have correct kind, collectionName, and info', () => {
      expect(sellableUnitSchema.kind).toBe('collectionType');
      expect(sellableUnitSchema.collectionName).toBe('sellable_units');
      expect(sellableUnitSchema.info.singularName).toBe('sellable-unit');
      expect(sellableUnitSchema.info.pluralName).toBe('sellable-units');
      expect(sellableUnitSchema.info.displayName).toBe('Sellable Unit');
    });

    it('should have draftAndPublish disabled', () => {
      expect(sellableUnitSchema.options.draftAndPublish).toBe(false);
    });

    it('should define "tenant" as a required manyToOne relation to api::tenant.tenant', () => {
      const tenantAttr = sellableUnitSchema.attributes.tenant;
      expect(tenantAttr).toBeDefined();
      expect(tenantAttr.type).toBe('relation');
      expect(tenantAttr.relation).toBe('manyToOne');
      expect(tenantAttr.target).toBe('api::tenant.tenant');
      expect(tenantAttr.required).toBe(true);
    });

    it('should define "product" as a required manyToOne relation to api::product.product', () => {
      const productAttr = sellableUnitSchema.attributes.product;
      expect(productAttr).toBeDefined();
      expect(productAttr.type).toBe('relation');
      expect(productAttr.relation).toBe('manyToOne');
      expect(productAttr.target).toBe('api::product.product');
      expect(productAttr.required).toBe(true);
    });

    it('should define "sku" as a required and unique string', () => {
      const skuAttr = sellableUnitSchema.attributes.sku;
      expect(skuAttr).toBeDefined();
      expect(skuAttr.type).toBe('string');
      expect(skuAttr.required).toBe(true);
      expect(skuAttr.unique).toBe(true);
    });

    it('should define "price" as a required decimal', () => {
      const priceAttr = sellableUnitSchema.attributes.price;
      expect(priceAttr).toBeDefined();
      expect(priceAttr.type).toBe('decimal');
      expect(priceAttr.required).toBe(true);
    });

    it('should define "currency" as a required string with default "EUR"', () => {
      const currencyAttr = sellableUnitSchema.attributes.currency;
      expect(currencyAttr).toBeDefined();
      expect(currencyAttr.type).toBe('string');
      expect(currencyAttr.default).toBe('EUR');
      expect(currencyAttr.required).toBe(true);
    });

    it('should define "discCondition" as a required enum with all DiscCondition values', () => {
      const discConditionAttr = sellableUnitSchema.attributes.discCondition;
      expect(discConditionAttr).toBeDefined();
      expect(discConditionAttr.type).toBe('enumeration');
      expect(discConditionAttr.enum).toEqual(Object.values(DiscCondition));
      expect(discConditionAttr.required).toBe(true);
    });

    it('should define "sleeveCondition" as a required enum with all SleeveCondition values', () => {
      const sleeveConditionAttr = sellableUnitSchema.attributes.sleeveCondition;
      expect(sleeveConditionAttr).toBeDefined();
      expect(sleeveConditionAttr.type).toBe('enumeration');
      expect(sleeveConditionAttr.enum).toEqual(Object.values(SleeveCondition));
      expect(sleeveConditionAttr.required).toBe(true);
    });

    it('should define "sellerNotes" as optional text', () => {
      const sellerNotesAttr = sellableUnitSchema.attributes.sellerNotes;
      expect(sellerNotesAttr).toBeDefined();
      expect(sellerNotesAttr.type).toBe('text');
      expect((sellerNotesAttr as { required?: boolean }).required).toBeUndefined();
    });

    it('should define "status" as a required enum with default "available"', () => {
      const statusAttr = sellableUnitSchema.attributes.status;
      expect(statusAttr).toBeDefined();
      expect(statusAttr.type).toBe('enumeration');
      expect(statusAttr.enum).toEqual(Object.values(SellableUnitStatus));
      expect(statusAttr.default).toBe(SellableUnitStatus.AVAILABLE);
      expect(statusAttr.required).toBe(true);
    });

    it('should define "quantity" as a required integer with default 1', () => {
      const quantityAttr = sellableUnitSchema.attributes.quantity;
      expect(quantityAttr).toBeDefined();
      expect(quantityAttr.type).toBe('integer');
      expect(quantityAttr.default).toBe(1);
      expect(quantityAttr.required).toBe(true);
    });

    it('should define "location" as optional string', () => {
      const locationAttr = sellableUnitSchema.attributes.location;
      expect(locationAttr).toBeDefined();
      expect(locationAttr.type).toBe('string');
      expect((locationAttr as { required?: boolean }).required).toBeUndefined();
    });
  });

  describe('API Controllers, Services, and Routes', () => {
    it('should export Strapi core controller factory wrapper', () => {
      expect(sellableUnitController).toBeDefined();
    });

    it('should export Strapi core service factory wrapper', () => {
      expect(sellableUnitService).toBeDefined();
    });

    it('should export Strapi core router factory wrapper', () => {
      expect(sellableUnitRoutes).toBeDefined();
    });
  });
});
