# Trade Logging Implementation Guide

This document outlines the detailed implementation plan for the trade logging functionality in the Trade Buddy application using Drizzle ORM.

## Overview

The trade logging feature allows users to record their trades for specific trading strategies, both for live trading and backtesting. Each trade will include standard fields and strategy-specific custom fields defined by the user. Trades will be displayed in a table on the strategy detail page.

## Data Models

### Trade Model (Existing Schema)

The trade model is already defined in the schema.ts file with the following structure:

- **id**: UUID primary key
- **userId**: Reference to the user who created the trade
- **strategyId**: Reference to the strategy this trade belongs to
- **status**: Current status of the trade (order_placed, open, closed)
- **asset**: Specific asset being traded
- **dateOpened**: Date when the trade was opened (null if order_placed)
- **dateClosed**: Date when the trade was closed (null if still open)
- **direction**: Direction of the trade (long, short)
- **result**: Outcome of the trade (win, break_even, loss, null if not closed)
- **profitLoss**: Profit or loss amount (integer)
- **notes**: Optional notes about the trade
- **isBacktest**: Boolean indicating if this is a backtest trade
- **customValues**: Values for the custom fields defined in the strategy (stored as JSON)
- **createdAt**: Timestamp when the trade was created
- **updatedAt**: Timestamp when the trade was last updated

### Trade Custom Values

The `customValues` field stores JSON data representing the values for the custom fields defined in the strategy. The structure will be:

```json
{
  "fieldId1": "value1",
  "fieldId2": "value2",
  ...
}
```

## Implementation Steps

### 1. Server Actions for Trade Management

1. **Create Trade Action**:

   - Implement a server action for creating new trades
   - Validate input data using Zod schema
   - Handle custom field values as part of the trade creation
   - Revalidate paths and return appropriate response

2. **Update Trade Action** (for future implementation):

   - Implement a server action for updating existing trades
   - Handle updating of custom field values
   - Ensure proper validation and error handling

3. **Delete Trade Action** (for future implementation):
   - Implement a server action for deleting trades
   - Verify ownership before deletion

### 2. UI Components

#### 2.1 Log Trade Button

1. **Create Button Component**:
   - Add a "Log Trade" button at the top of the trades table
   - Implement onClick handler to open the trade logging sheet

#### 2.2 Trade Logging Sheet

1. **Create Sheet Component**:
   - Use the shadcn sheet component
   - Implement open/close functionality
   - Add form within the sheet
   - Pass the current active tab (live or backtest) to the form to automatically set trade type

#### 2.3 Trade Form Component

1. **Basic Trade Information**:

   - Create form fields for all standard trade attributes (status, direction, etc.)
   - Implement conditional rendering for fields based on trade status
   - Add validation for required fields
   - Automatically set the isBacktest field based on the active tab in the strategy detail page

2. **Asset Selection**:

   - Create a select input for asset selection
   - Dynamically populate options based on the strategy's instrument type using the assetsByInstrument configuration from assets.ts
   - Use the getAssetsByInstrument utility function to fetch the appropriate asset options

3. **Custom Fields Section**:

   - Dynamically render form fields for strategy-specific custom fields
   - Support different field types (text, select, multi-select)
   - Implement validation for custom fields

4. **Form Submission**:
   - Connect form to server action for data submission
   - Handle loading and error states
   - Provide feedback on successful submission

#### 2.4 Trade Table Component (Basic Version)

1. **Basic Table Structure**:

   - Create a table to display trades
   - Show key details like date, asset, direction, status, and result
   - Implement responsive design for the table

2. **Empty State**:
   - Design an empty state for when no trades exist
   - Include a prompt to log the first trade

### 3. Integration with Strategy Detail Page

1. **Update Strategy Detail Component**:
   - Add trade logging button and sheet
   - Pass the active tab state (live/backtest) to the trade logging component
   - Include the trades table
   - Implement context or state management for the logging flow

## Implementation Workflow

1. **Server Actions**:

   - Implement trade creation action
   - Add validation with Zod

2. **UI Components**:

   - Create the trade logging sheet with form
   - Implement dynamic custom fields rendering
   - Build basic trade table

3. **Integration**:

   - Connect all components in the strategy detail page
   - Implement proper state management
   - Ensure trade type is automatically set based on active tab

4. **Testing**:
   - Test trade logging flow
   - Verify custom fields functionality
   - Ensure proper validation

## Detailed Component Implementation

### Trade Logging Sheet

```tsx
// Component structure
<Sheet>
  <SheetTrigger asChild>
    <Button>Log Trade</Button>
  </SheetTrigger>
  <SheetContent className="sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Log Trade</SheetTitle>
      <SheetDescription>Record a new trade for your strategy.</SheetDescription>
    </SheetHeader>
    <TradeForm strategy={strategy} isBacktest={activeTab === "backtest"} />
  </SheetContent>
</Sheet>
```

### Trade Form Component

The form will include:

1. **Trade Status**:

   - Select component for trade status (order_placed, open, closed)

2. **Asset Selection**:

   - Select component for asset selection
   - Options populated based on strategy.instrument using getAssetsByInstrument function
   - Example: `const assetOptions = getAssetsByInstrument(strategy.instrument);`

3. **Trade Direction**:

   - Radio group for trade direction (long, short)

4. **Date Fields**:

   - Date inputs for entry date and exit date (conditional based on status)

5. **Result Fields** (shown if status is closed):

   - Select for result (win, loss, break_even)
   - Number input for profit/loss amount

6. **Custom Fields Section**:

   - Dynamically rendered fields based on strategy's custom fields

7. **Notes Field**:
   - Textarea for additional notes

## Server Action Implementation

The createTrade server action will:

1. Validate the user session
2. Parse and validate form data (including custom values)
3. Insert the trade record into the database
4. Return success/error response
5. Revalidate related paths

### Example Zod Schema for Trade Validation

```typescript
const createTradeSchema = z.object({
  strategyId: z.string().uuid(),
  status: z.enum(["order_placed", "open", "closed"]),
  asset: z.string().min(1, "Asset is required"),
  dateOpened: z.date().optional().nullable(),
  dateClosed: z.date().optional().nullable(),
  direction: z.enum(["long", "short"]),
  result: z.enum(["win", "break_even", "loss"]).optional().nullable(),
  profitLoss: z.number().optional().nullable(),
  notes: z.string().optional(),
  isBacktest: z.boolean().default(false),
  customValues: z.record(z.string(), z.any()),
});
```

## Next Steps After Implementation

1. Implement trade filtering and sorting functionality
2. Add trade editing and deletion capabilities
3. Create trade analytics visualizations
4. Implement AI-based trade insights

## Notes

- Use Drizzle ORM for all database operations
- Implement server actions for data mutations following Next.js and React 19 best practices
- Use Zod for validation of form data in server actions
- Store custom field values as JSON in the database
- Ensure responsive UI design for all components
- Implement proper error handling and loading states
- Use optimistic updates where appropriate for better UX
- Consider performance implications of queries and optimize as needed
