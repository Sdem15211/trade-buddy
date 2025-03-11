# Trading Strategies Implementation Guide

This document outlines the detailed implementation plan for the trading strategies feature in the Trade Buddy application using Drizzle ORM.

## Overview

The trading strategies feature allows users to create and manage their trading strategies with customizable attributes. Each strategy will have default fields and user-defined custom fields that will be used for logging and backtesting trades.

## Data Models

### Strategy Model

- **id**: Unique identifier for the strategy
- **userId**: Reference to the user who created the strategy
- **name**: Name of the trading strategy
- **description**: Optional description of the strategy
- **instrument**: Type of instrument (Forex, Crypto, Stocks, etc.)
- **asset**: Specific asset being traded (selected based on instrument)
- **customFields**: Collection of user-defined fields for this strategy
- **createdAt**: Timestamp when the strategy was created
- **updatedAt**: Timestamp when the strategy was last updated

### Custom Field Model

- **id**: Unique identifier for the custom field
- **strategyId**: Reference to the strategy this field belongs to
- **name**: Name of the custom field
- **type**: Type of field (text, select, or multi-select)
- **options**: Array of options for select and multi-select fields (stored as JSON)
- **required**: Boolean indicating if the field is required

### Trade Model (for reference)

- **id**: Unique identifier for the trade
- **userId**: Reference to the user who created the trade
- **strategyId**: Reference to the strategy this trade belongs to
- **status**: Current status of the trade (order_placed, open, closed)
- **dateOpened**: Date when the trade was opened (null if order_placed)
- **dateClosed**: Date when the trade was closed (null if still open)
- **result**: Outcome of the trade (win, break_even, loss, null if not closed)
- **profitLoss**: Profit or loss amount
- **notes**: Optional notes about the trade
- **isBacktest**: Boolean indicating if this is a backtest trade
- **customValues**: Values for the custom fields (stored as JSON)
- **createdAt**: Timestamp when the trade was created
- **updatedAt**: Timestamp when the trade was last updated

## Implementation Steps

### 1. Database Schema Setup

1. **Create Drizzle Schema**:

   - Define the strategy table with all required fields
   - Define the custom fields table with a relation to strategies
   - Define the trade table with relations to strategies and users
   - Set up appropriate indexes for performance optimization

2. **Generate and Apply Migrations**:
   - Use drizzle-kit to generate migration files
   - Apply the migrations to create the database tables
   - Verify the schema in the database

### 2. Server Actions for Strategy Management

1. **Create Strategy Action**:

   - Implement a server action for creating new strategies
   - Validate input data using Zod schema
   - Handle custom fields creation as part of the strategy
   - Revalidate paths and redirect after successful creation

2. **Update Strategy Action**:

   - Implement a server action for updating existing strategies
   - Handle adding, updating, and removing custom fields
   - Ensure proper validation and error handling

3. **Delete Strategy Action**:

   - Implement a server action for deleting strategies
   - Verify ownership before deletion
   - Handle cascading deletion of related custom fields

### 3. Asset Data Source

1. **Create Asset Data File**:

   - Define available assets for each instrument type
   - Organize assets in a structured format for easy access
   - Include comprehensive lists for Forex pairs, Cryptocurrencies, and Stocks

2. **Asset Selection Logic**:
   - Implement logic to filter assets based on selected instrument
   - Ensure dynamic updating of asset options in the UI

### 4. UI Components

#### 4.1 Strategy Form Component

1. **Basic Strategy Information**:

   - Create form fields for strategy name and description
   - Implement validation for required fields

2. **Instrument and Asset Selection**:

   - Create dropdown for instrument selection
   - Implement dynamic asset dropdown that updates based on selected instrument
   - Add validation for both fields

3. **Custom Fields Management**:

   - Create interface for adding, editing, and removing custom fields
   - Support different field types (text, select, multi-select)
   - Implement validation for custom field configuration

4. **Form Submission**:
   - Connect form to server action for data submission
   - Handle loading and error states
   - Provide feedback on successful submission

#### 4.2 Custom Fields Builder Component

1. **Field Type Selection**:

   - Create interface for selecting field type
   - Implement conditional rendering based on field type

2. **Options Management**:

   - For select and multi-select fields, create interface for managing options
   - Allow adding, editing, and removing options

3. **Required Field Toggle**:
   - Add toggle for marking fields as required
   - Update validation schema accordingly

#### 4.3 Strategy List Component

1. **Strategy Cards**:

   - Display strategy information in card format
   - Show key details like name, instrument, and asset
   - Add actions for viewing, editing, and deleting strategies

2. **Sorting and Filtering**:
   - Implement sorting options (by name, date created, etc.)
   - Add filtering capabilities (by instrument, etc.)

#### 4.4 Strategy Detail Component

1. **Strategy Overview**:

   - Display all strategy details including custom fields
   - Show related statistics if available

2. **Action Buttons**:
   - Add buttons for editing, deleting, and creating trades for this strategy

### 5. Routes

1. **Strategies List Page**:

   - Create a page to display all user strategies
   - Include a button to create new strategies
   - Implement server-side data fetching

2. **Create Strategy Page**:

   - Create a page with the strategy form for creating new strategies
   - Implement multi-step form if needed for better UX

3. **Strategy Detail Page**:

   - Create a dynamic route for viewing individual strategies
   - Display strategy details and related trades
   - Include actions for managing the strategy

4. **Edit Strategy Page**:
   - Create a page for editing existing strategies
   - Pre-populate form with existing strategy data
   - Handle updates to custom fields

## Implementation Workflow

1. **Database Setup**:

   - Define Drizzle schema
   - Configure Drizzle
   - Generate and apply migrations

2. **Server Actions**:

   - Implement strategy CRUD operations
   - Add validation with Zod

3. **UI Components**:

   - Create strategy form with multi-step process
   - Implement custom fields builder
   - Build strategy list and detail views

4. **Testing**:

   - Test strategy creation flow
   - Verify custom fields functionality
   - Ensure proper validation

5. **Integration**:
   - Connect with trade logging (future feature)
   - Prepare for backtesting integration (future feature)

## Next Steps After Implementation

1. Connect the strategy feature with trade logging functionality
2. Implement backtesting capabilities
3. Create analytics dashboards for strategy performance
4. Add AI insights specific to each strategy

## Notes

- Use Drizzle ORM for all database operations
- Implement server actions for data mutations following Next.js and React 19 best practices
- Use Zod for validation of form data in server actions
- Store complex data (like options for select fields) as JSON in the database
- Ensure responsive UI design for all components
- Use the UseActionState hook in the UI components that include a form. (to handle error states etc.)
- Implement proper error handling and loading states
- Consider performance implications of queries and optimize as needed
