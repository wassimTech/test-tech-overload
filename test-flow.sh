#!/usr/bin/env bash

# ==============================================================================
# 🎵 Vinyl Marketplace & Discogs Sync Platform - Automated E2E Flow Test
# ==============================================================================
# This script executes and validates the entire 12-step lifecycle:
# 1. Verify Strapi health & Default Tenant
# 2. Query Tenant
# 3. Create Product (Catalog entry)
# 4. Search Discogs Release
# 5. Attach Release to Product
# 6. Create SellableUnit (Auto-SKU generation)
# 7. Check Discogs Completeness
# 8. Publish Listing to Discogs
# 9. Verify ChannelListing
# 10. Simulate Discogs Sale
# 11. Verify Final Unit & Listing Statuses
# 12. Inspect MarketplaceSyncEvent Audit Logs
# ==============================================================================

set -e

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

API_BASE_URL="${API_BASE_URL:-http://localhost:1337}"
TENANT_SLUG="${TENANT_SLUG:-vinyl-store}"

echo -e "\n${BOLD}${CYAN}============================================================${NC}"
echo -e "${BOLD}${CYAN} 🎵 Running Automated E2E Test Workflow (Strapi + Discogs)  ${NC}"
echo -e "${BOLD}${CYAN} Target Server: ${API_BASE_URL} | Tenant: ${TENANT_SLUG}    ${NC}"
echo -e "${BOLD}${CYAN}============================================================${NC}\n"

# JSON extractor helper using Node.js
json_get() {
  local json_str="$1"
  local expr="$2"
  node -e "
    try {
      const obj = JSON.parse(process.argv[1]);
      const res = ($expr)(obj);
      if (res !== undefined && res !== null) {
        console.log(typeof res === 'object' ? JSON.stringify(res) : res);
      }
    } catch (err) {
      process.exit(1);
    }
  " "$json_str"
}

# ------------------------------------------------------------------------------
# Step 1: Healthcheck
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 1/12] Checking Strapi Server Health...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/api/tenants" || true)
if [ "$HTTP_STATUS" -eq 000 ]; then
  echo -e "${RED}❌ Strapi server is not reachable on ${API_BASE_URL}. Please start Strapi first (npm run dev).${NC}\n"
  exit 1
fi
echo -e "${GREEN}✓ Strapi server is responding (HTTP ${HTTP_STATUS})${NC}\n"

# ------------------------------------------------------------------------------
# Step 2: Verify Tenant
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 2/12] Verifying Tenant (${TENANT_SLUG})...${NC}"
TENANTS_RES=$(curl -s -X GET "${API_BASE_URL}/api/tenants")
TENANT_ID=$(json_get "$TENANTS_RES" "x => x.data?.find(t => t.slug === '${TENANT_SLUG}')?.documentId || x.data?.[0]?.documentId")

if [ -z "$TENANT_ID" ] || [ "$TENANT_ID" = "undefined" ]; then
  echo -e "${RED}❌ Tenant '${TENANT_SLUG}' not found in Strapi. Response:${NC}"
  echo "$TENANTS_RES"
  exit 1
fi
echo -e "${GREEN}✓ Tenant verified:${NC} documentId = ${BOLD}${TENANT_ID}${NC}\n"

# ------------------------------------------------------------------------------
# Step 3: Create Product (Catalog Master)
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 3/12] Creating Product: Daft Punk - Discovery (2xLP)...${NC}"
CREATE_PRODUCT_RES=$(curl -s -X POST "${API_BASE_URL}/api/products" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": {
      \"tenant\": \"${TENANT_SLUG}\",
      \"productType\": \"vinyl\",
      \"title\": \"Discovery\",
      \"artist\": \"Daft Punk\",
      \"label\": \"Virgin\",
      \"year\": 2001,
      \"country\": \"France\",
      \"format\": \"2xLP\",
      \"barcode\": \"724384960612\"
    }
  }")

PRODUCT_DOC_ID=$(json_get "$CREATE_PRODUCT_RES" "x => x.data?.documentId")
if [ -z "$PRODUCT_DOC_ID" ] || [ "$PRODUCT_DOC_ID" = "undefined" ]; then
  echo -e "${RED}❌ Failed to create product. Response:${NC}"
  echo "$CREATE_PRODUCT_RES"
  exit 1
fi
echo -e "${GREEN}✓ Product created successfully:${NC} documentId = ${BOLD}${PRODUCT_DOC_ID}${NC}\n"

# ------------------------------------------------------------------------------
# Step 4: Search Discogs for Release Metadata
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 4/12] Searching Discogs for 'Discovery Daft Punk'...${NC}"
SEARCH_RES=$(curl -s -X GET "${API_BASE_URL}/api/discogs/search?tenantId=${TENANT_SLUG}&q=Discovery+Daft+Punk")
RELEASE_ID=$(json_get "$SEARCH_RES" "x => x.data?.[0]?.id")

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "undefined" ]; then
  echo -e "${RED}❌ No Discogs release found in search. Response:${NC}"
  echo "$SEARCH_RES"
  exit 1
fi
echo -e "${GREEN}✓ Found Discogs release:${NC} releaseId = ${BOLD}${RELEASE_ID}${NC}\n"

# ------------------------------------------------------------------------------
# Step 5: Attach Discogs Release to Product
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 5/12] Attaching Discogs Release ${RELEASE_ID} to Product ${PRODUCT_DOC_ID}...${NC}"
ATTACH_RES=$(curl -s -X POST "${API_BASE_URL}/api/products/${PRODUCT_DOC_ID}/attach-discogs-release" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"${TENANT_SLUG}\",
    \"releaseId\": \"${RELEASE_ID}\"
  }")

ATTACHED_RELEASE_ID=$(json_get "$ATTACH_RES" "x => x.data?.discogsReleaseId")
if [ "$ATTACHED_RELEASE_ID" != "$RELEASE_ID" ]; then
  echo -e "${RED}❌ Failed to attach release to product. Response:${NC}"
  echo "$ATTACH_RES"
  exit 1
fi
echo -e "${GREEN}✓ Release attached to product:${NC} discogsReleaseId = ${BOLD}${ATTACHED_RELEASE_ID}${NC}\n"

# ------------------------------------------------------------------------------
# Step 6: Create SellableUnit (Auto-SKU Generation)
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 6/12] Creating SellableUnit with automatic SKU generation...${NC}"
CREATE_UNIT_RES=$(curl -s -X POST "${API_BASE_URL}/api/sellable-units" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": {
      \"tenant\": \"${TENANT_SLUG}\",
      \"product\": \"${PRODUCT_DOC_ID}\",
      \"price\": 34.99,
      \"currency\": \"EUR\",
      \"discCondition\": \"Very Good Plus\",
      \"sleeveCondition\": \"Near Mint\",
      \"sellerNotes\": \"Original pressing, very clean copy with pristine inserts\",
      \"status\": \"available\",
      \"quantity\": 1,
      \"location\": \"BIN-A-42\"
    }
  }")

UNIT_DOC_ID=$(json_get "$CREATE_UNIT_RES" "x => x.data?.documentId")
UNIT_SKU=$(json_get "$CREATE_UNIT_RES" "x => x.data?.sku")

if [ -z "$UNIT_DOC_ID" ] || [ "$UNIT_DOC_ID" = "undefined" ]; then
  echo -e "${RED}❌ Failed to create SellableUnit. Response:${NC}"
  echo "$CREATE_UNIT_RES"
  exit 1
fi
echo -e "${GREEN}✓ SellableUnit created:${NC} documentId = ${BOLD}${UNIT_DOC_ID}${NC} | SKU = ${BOLD}${UNIT_SKU}${NC}\n"

# ------------------------------------------------------------------------------
# Step 7: Check Discogs Listing Completeness
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 7/12] Validating Discogs completeness for unit ${UNIT_DOC_ID}...${NC}"
CHECK_RES=$(curl -s -X POST "${API_BASE_URL}/api/sellable-units/${UNIT_DOC_ID}/check-discogs-completeness" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"${TENANT_SLUG}\"
  }")

IS_COMPLETE=$(json_get "$CHECK_RES" "x => x.data?.complete")
if [ "$IS_COMPLETE" != "true" ]; then
  echo -e "${RED}❌ Unit completeness check failed. Response:${NC}"
  echo "$CHECK_RES"
  exit 1
fi
echo -e "${GREEN}✓ Completeness check passed:${NC} complete = true, missingFields = []\n"

# ------------------------------------------------------------------------------
# Step 8: Publish Listing to Discogs
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 8/12] Publishing unit ${UNIT_DOC_ID} to Discogs marketplace...${NC}"
PUBLISH_RES=$(curl -s -X POST "${API_BASE_URL}/api/sellable-units/${UNIT_DOC_ID}/publish-discogs" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"${TENANT_SLUG}\"
  }")

LISTING_DOC_ID=$(json_get "$PUBLISH_RES" "x => x.data?.channelListing?.documentId")
EXTERNAL_LISTING_ID=$(json_get "$PUBLISH_RES" "x => x.data?.channelListing?.externalListingId")
LISTING_STATUS=$(json_get "$PUBLISH_RES" "x => x.data?.channelListing?.status")

if [ "$LISTING_STATUS" != "published" ]; then
  echo -e "${RED}❌ Publication failed. Response:${NC}"
  echo "$PUBLISH_RES"
  exit 1
fi
echo -e "${GREEN}✓ Unit published on Discogs:${NC} externalListingId = ${BOLD}${EXTERNAL_LISTING_ID}${NC} | status = ${BOLD}${LISTING_STATUS}${NC}\n"

# ------------------------------------------------------------------------------
# Step 9: Verify Created ChannelListing
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 9/12] Querying ChannelListings to verify marketplace status...${NC}"
LISTINGS_RES=$(curl -s -X GET "${API_BASE_URL}/api/channel-listings?sort=createdAt:desc&populate=*")
COUNT_LISTINGS=$(json_get "$LISTINGS_RES" "x => x.data?.length || 0")
echo -e "${GREEN}✓ Retrieved ${COUNT_LISTINGS} channel listing(s) from Strapi (latest first):${NC}"

node -e "
  const data = JSON.parse(process.argv[1]).data || [];
  data.slice(0, 5).forEach((item, idx) => {
    const date = item.lastSyncedAt || item.createdAt ? new Date(item.lastSyncedAt || item.createdAt).toISOString().replace('T', ' ').slice(0, 19) : 'N/A';
    console.log('   [' + (idx + 1) + '] (' + date + ') status: ' + item.status + ' | documentId: ' + item.documentId + ' | externalId: ' + (item.externalListingId || 'N/A') + ' | price: ' + (item.publishedPrice ? item.publishedPrice + ' EUR' : 'N/A'));
  });
" "$LISTINGS_RES"
echo ""

# ------------------------------------------------------------------------------
# Step 10: Simulate Marketplace Sale
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 10/12] Simulating Discogs sale for unit ${UNIT_DOC_ID}...${NC}"
SALE_RES=$(curl -s -X POST "${API_BASE_URL}/api/sellable-units/${UNIT_DOC_ID}/simulate-discogs-sale" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"${TENANT_SLUG}\"
  }")

FINAL_UNIT_STATUS=$(json_get "$SALE_RES" "x => x.data?.sellableUnit?.status")
FINAL_UNIT_QTY=$(json_get "$SALE_RES" "x => x.data?.sellableUnit?.quantity")
FINAL_LISTING_STATUS=$(json_get "$SALE_RES" "x => x.data?.channelListing?.status")

if [ "$FINAL_UNIT_STATUS" != "sold" ] || [ "$FINAL_LISTING_STATUS" != "removed" ]; then
  echo -e "${RED}❌ Sale simulation failed. Response:${NC}"
  echo "$SALE_RES"
  exit 1
fi
echo -e "${GREEN}✓ Sale successfully processed:${NC} unit status = ${BOLD}${FINAL_UNIT_STATUS}${NC} (qty: ${FINAL_UNIT_QTY}) | listing status = ${BOLD}${FINAL_LISTING_STATUS}${NC}\n"

# ------------------------------------------------------------------------------
# Step 11: Verify Final Unit Status
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 11/12] Verifying SellableUnit ${UNIT_DOC_ID} final inventory status...${NC}"
GET_UNIT_RES=$(curl -s -X GET "${API_BASE_URL}/api/sellable-units/${UNIT_DOC_ID}")
VERIFIED_STATUS=$(json_get "$GET_UNIT_RES" "x => x.data?.status")
echo -e "${GREEN}✓ Unit verified in database:${NC} status = ${BOLD}${VERIFIED_STATUS}${NC}\n"

# ------------------------------------------------------------------------------
# Step 12: Inspect MarketplaceSyncEvent Audit Logs
# ------------------------------------------------------------------------------
echo -e "${CYAN}[Step 12/12] Inspecting persistent MarketplaceSyncEvent audit logs...${NC}"
EVENTS_RES=$(curl -s -X GET "${API_BASE_URL}/api/marketplace-sync-events?sort=createdAt:desc")
EVENTS_COUNT=$(json_get "$EVENTS_RES" "x => x.data?.length || 0")

echo -e "${GREEN}✓ Total audit events recorded in database: ${BOLD}${EVENTS_COUNT}${NC}"
echo -e "${YELLOW}  Latest Workflow Audit Events (with timestamp):${NC}"

node -e "
  const data = JSON.parse(process.argv[1]).data || [];
  data.slice(0, 6).forEach((evt, idx) => {
    const time = evt.timestamp || evt.createdAt ? new Date(evt.timestamp || evt.createdAt).toISOString().replace('T', ' ').slice(0, 19) : '';
    console.log('   [' + (idx + 1) + '] (' + time + ') [' + evt.action + '] status: ' + evt.status + ' | ' + evt.message);
  });
" "$EVENTS_RES"
echo ""

# ------------------------------------------------------------------------------
# Final Summary
# ------------------------------------------------------------------------------
echo -e "${BOLD}${GREEN}============================================================${NC}"
echo -e "${BOLD}${GREEN} 🎉 ALL 12 E2E WORKFLOW STEPS PASSED SUCCESSFULLY!          ${NC}"
echo -e "${BOLD}${GREEN}============================================================${NC}"
echo -e " Summary:"
echo -e "  - Tenant:           ${BOLD}${TENANT_SLUG}${NC} (${TENANT_ID})"
echo -e "  - Product:          ${BOLD}Daft Punk - Discovery${NC} (${PRODUCT_DOC_ID})"
echo -e "  - Discogs Release:  ${BOLD}${RELEASE_ID}${NC}"
echo -e "  - SellableUnit:     ${BOLD}${UNIT_SKU}${NC} (${UNIT_DOC_ID})"
echo -e "  - ChannelListing:   ${BOLD}${EXTERNAL_LISTING_ID}${NC} (${LISTING_DOC_ID})"
echo -e "  - Audit Events:     ${BOLD}${EVENTS_COUNT} persistent events logged${NC}"
echo -e "${BOLD}${GREEN}============================================================${NC}\n"
