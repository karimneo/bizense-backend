# 🛍️ Product Module API Documentation

## Overview
The Product Module is the core of the ecommerce dashboard. Each product is automatically created or updated based on uploaded campaign reports.

## Database Schema

### `products` Table
- `id` - Primary key
- `user_id` - UUID reference to user
- `product_name` - String (extracted from campaign names)
- `unit_cost` - Decimal (manual input - cost per unit from supplier)
- `selling_price` - Decimal (manual input - what the product is sold for)
- `units_delivered` - Integer (manual input - updated daily/weekly)
- `stock_purchased` - Integer (optional, for stock management)
- `revenue_per_conversion` - Decimal (legacy field)
- `created_at` - Timestamp

### `product_daily_data` Table
- `id` - Primary key
- `user_id` - UUID reference to user
- `product_id` - Reference to product
- `date` - Date for this record
- `units_delivered` - Integer (daily delivery count)
- `manual_revenue` - Decimal (optional manual revenue override)
- `manual_spend` - Decimal (optional manual spend addition)
- `notes` - Text (optional notes for the day)

## API Endpoints

### GET `/api/products`
Get all products with calculated metrics.

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "product_name": "Example Product",
      "unit_cost": 25.50,
      "selling_price": 79.99,
      "units_delivered": 100,
      "stock_purchased": 500,
      "total_spend": 1250.00,
      "total_revenue": 7999.00,
      "total_conversions": 85,
      "total_clicks": 2150,
      "total_impressions": 45000,
      "profit": 5199.00,
      "roi": 316.72,
      "roas": 6.40,
      "cpl": 0.58,
      "cpo": 14.71,
      "conversion_rate": 3.95,
      "best_platform": "facebook",
      "platform_performance": {
        "facebook": { "spend": 800, "revenue": 5200, "roas": 6.5 },
        "google": { "spend": 450, "revenue": 2799, "roas": 6.22 }
      }
    }
  ]
}
```

### GET `/api/products/:id`
Get detailed product information with daily breakdown.

**Response:**
```json
{
  "product": {
    "id": 1,
    "product_name": "Example Product",
    "unit_cost": 25.50,
    "selling_price": 79.99,
    "units_delivered": 100,
    "stock_purchased": 500
  },
  "dailyBreakdown": [
    {
      "date": "2024-01-15",
      "spend": 125.50,
      "conversions": 8,
      "clicks": 215,
      "impressions": 4500,
      "campaigns": 3,
      "units_delivered": 10,
      "revenue": 799.90,
      "profit": 544.40,
      "roi": 433.70,
      "roas": 6.37,
      "notes": "Good performance day"
    }
  ],
  "aggregatedMetrics": {
    "total_spend": 1250.00,
    "total_revenue": 7999.00,
    "total_conversions": 85,
    "total_units_delivered": 100,
    "total_profit": 5199.00,
    "roi": 316.72,
    "roas": 6.40
  },
  "campaignCount": 25
}
```

### POST `/api/products`
Create a new product manually.

**Request Body:**
```json
{
  "product_name": "New Product",
  "revenue_per_conversion": 50.00
}
```

### PUT `/api/products/:id`
Update product fields.

**Request Body:**
```json
{
  "unit_cost": 25.50,
  "selling_price": 79.99,
  "units_delivered": 150,
  "stock_purchased": 600
}
```

### POST `/api/products/:id/daily`
Add or update daily data for a product.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "units_delivered": 10,
  "manual_revenue": 800.00,
  "manual_spend": 50.00,
  "notes": "Delivered to premium customers"
}
```

### DELETE `/api/products/:id`
Delete a product.

## Automatic Product Creation

When uploading campaign reports, products are automatically created using this logic:

1. **Campaign Name Format**: `"ProductName - CampaignName"`
2. **Product Extraction**: Everything before the first hyphen becomes the product name
3. **Matching**: If a product with the same name exists, it's linked to the campaign
4. **Creation**: If no product exists, a new one is created automatically

## Metric Calculations

### Revenue
```
Revenue = Selling Price × Units Delivered
```

### Profit
```
Profit = Revenue - (Unit Cost × Units Delivered) - Total Ad Spend
```

### ROI
```
ROI = (Profit / Total Spend) × 100
```

### ROAS
```
ROAS = Revenue / Total Spend
```

### Other Metrics
- **CPL (Cost Per Lead)**: Total Spend / Total Clicks
- **CPO (Cost Per Order)**: Total Spend / Total Conversions  
- **Conversion Rate**: (Total Conversions / Total Clicks) × 100

## Usage Flow

1. **Upload Campaign CSV** → Products automatically created/matched
2. **Set Manual Fields** → Update unit cost, selling price, etc.
3. **Track Daily Deliveries** → Update units delivered daily/weekly
4. **Monitor Performance** → View calculated metrics and ROI
5. **Analyze Trends** → Use daily breakdown for insights

## Notes

- All monetary values are stored as decimals with 2 decimal places
- Dates are stored in ISO format
- Product names are case-insensitive for matching
- Daily data can override calculated revenue if needed
- Platform performance shows breakdown by advertising platform 