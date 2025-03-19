# Strategy Detail Pages Implementation Guide

This document outlines the detailed implementation plan for the strategy detail pages in the Trade Buddy application.

## Overview

The strategy detail pages allow users to view comprehensive information about their trading strategies and interact with them in two modes: live trading and backtesting. Each strategy will have its own dedicated page accessible via a URL slug based on the strategy name.

## Requirements

- Strategy detail pages should be accessible via `/strategies/[name]` instead of using strategy IDs
- Detail pages should have tabs to switch between "Live" and "Backtest" modes
- Strategy names need to be unique per user to prevent routing conflicts
- Each mode should display appropriate dashboards and controls (placeholder implementation initially)

## Data Models

### Strategy Model (existing)

- We need to ensure uniqueness of strategy names per user
- Add a unique constraint on the combination of `userId` and `name`

## Implementation Steps

### 1. Database Schema Update

1. **Update Drizzle Schema**:

   - Add a unique constraint to the strategy table on the combination of `userId` and `name`
   - Generate and apply migration for the constraint

2. **Strategy Validation**:
   - Update the validation logic in create/update strategy actions to check for name uniqueness

### 2. Router Configuration

1. **Dynamic Route Setup**:

   - Create the dynamic route at `app/(dashboard)/strategies/[name]/page.tsx`
   - Configure the route to fetch strategy data based on the strategy name

2. **Slug Generation**:
   - Create a utility function to generate URL-safe slugs from strategy names
   - Update strategy links in the strategy list page to use these slugs

### 3. Server-Side Data Fetching

1. **Strategy Data Retrieval**:
   - Implement direct data fetching in the server component to get strategy by name
   - Include related data like custom fields and recent trades
   - Add proper error handling for cases where the strategy doesn't exist

### 4. UI Components

#### 4.1 Strategy Detail Header Component

1. **Strategy Information Display**:
   - Create a component to display the strategy name, description, and key metadata
   - Include edit and delete buttons with proper permissions checks
   - Show relevant strategy statistics summary

#### 4.2 Mode Tabs Component

1. **Tab Implementation**:
   - Use shadcn Tabs component to create Live/Backtest mode selector
   - Implement state management for the active tab
   - Ensure the active tab is preserved in the URL using URL search params

#### 4.3 Live Mode Dashboard Component (Placeholder)

1. **Live Trading Interface**:
   - Create a placeholder component for the live trading dashboard
   - Include areas for displaying active trades, trade history, and performance metrics
   - Add placeholder controls for logging new trades

#### 4.4 Backtest Mode Dashboard Component (Placeholder)

1. **Backtest Interface**:
   - Create a placeholder component for the backtest dashboard
   - Include areas for simulation controls, backtest history, and result visualization
   - Add placeholder controls for creating new backtests

### 5. Routes Implementation

1. **Strategy Detail Page**:

   - Create the page component at `app/(dashboard)/strategies/[name]/page.tsx`
   - Implement server-side data fetching to get the strategy by name
   - Include the header and tab components
   - Render the appropriate dashboard based on the active tab

2. **404 Handling**:
   - Implement proper error handling for cases where the strategy doesn't exist
   - Create a not-found page for the strategy section

### 6. Link Generation

1. **Update Strategy Cards**:
   - Modify `StrategyCard` component to generate links using strategy names instead of IDs
   - Use the slug utility to ensure URL-safe links

## Implementation Workflow

1. **Database Updates**:

   - Update schema with uniqueness constraint
   - Apply migrations to the database

2. **Utility Functions**:

   - Create slug generation utility
   - Implement strategy fetching by name

3. **UI Components**:

   - Build header component
   - Implement tab system
   - Create placeholder dashboard components

4. **Route Implementation**:

   - Set up the dynamic route
   - Connect data fetching and component rendering
   - Implement error handling

5. **Testing**:
   - Test navigation from strategy list to detail pages
   - Verify tab switching functionality
   - Ensure proper error handling for non-existent strategies

## Next Steps After Implementation

1. Fully implement the Live Mode dashboard with trade logging functionality
2. Develop the Backtest Mode dashboard with simulation capabilities
3. Add analytics and performance visualization specific to each strategy
4. Implement AI insights feature for strategy improvement suggestions

## Notes

- Use URL search parameters via `nuqs` for maintaining tab state
- Ensure proper loading states during data fetching
- Implement optimistic updates for any actions taken on the detail page
- Consider adding breadcrumb navigation for better UX
- Ensure responsive design for all components
- Consider using React Suspense for data loading boundaries
- Strategy names should be automatically slugified when used in URLs to handle spaces and special characters
