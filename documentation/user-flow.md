# User Flow

The **Trade Journal** application is designed to provide a seamless and intuitive experience for traders, guiding them through every step of managing strategies, logging trades with AI-assisted insights, analyzing performance, and continuously refining their trading approaches. This document maps out the complete journey of both users and data through the system, detailing each interaction and process to ensure clarity and efficiency.

## User Journey Overview

1. **User Registration and Authentication**
2. **Dashboard Access**
3. **Strategy Management**
4. **AI-Assisted Trade Logging**
5. **Backtest Logging**
6. **Trade Analysis and Insights**
7. **Data Import and Export**
8. **Account Management**

## Detailed User Flow

### 1. User Registration and Authentication

#### Steps:

- **Sign Up:**
  - User navigates to the registration page.
  - Fills in required details (email, password) or selects a third-party OAuth provider (e.g., Google, GitHub).
  - Submits the registration form.
- **Email Verification (Optional):**
  - Receives a verification email to confirm account ownership.
- **Log In:**
  - User enters credentials or uses OAuth to authenticate.
  - Completes two-factor authentication if enabled.
- **Authentication Success:**
  - Redirected to the home dashboard upon successful login.

### 2. Dashboard Access

#### Steps:

- **Home Dashboard:**
  - Provides an overview of the user's strategies and trade activities and some quick actions to get started.
  - Displays key performance metrics and recent activities related to strategies.
- **Quick Actions:**
  - Offers shortcuts to primary functionalities like creating a new strategy, logging a trade, or accessing analytics.

### 3. Strategy Management

#### Steps:

- **Creating a Strategy:**
  - User navigates to the "Strategies" section and clicks on the "Create Strategy" button.
  - Fills in strategy details, including name, description, and configurable settings specific to the trading strategy via dropdowns, text inputs, and options.
  - Saves the strategy, which then becomes available for trade logging and backtest logging.
- **Editing a Strategy:**
  - User selects an existing strategy from the dashboard.
  - Modifies strategy details and saves changes.
- **Deleting a Strategy:**
  - User selects a strategy to delete and confirms the action, removing it from their list.

### 4. AI-Assisted Trade Logging

#### Steps:

- **Initiating Trade Logging:**
  - User selects the "Log Trade" option from the dashboard or strategy page.
  - Fills in trade setup details such as pair, setup conditions, strategy association, and other configurable fields.
- **Receiving AI Recommendations:**
  - Upon submitting the trade setup, an AI-driven popup appears displaying recommendations, warnings, and tips tailored to the trade based on the user's strategy and historical data.
- **Reviewing AI Insights:**
  - User reviews the AI-generated insights, which may include reminders to check specific indicators, alerts about potential risks, or suggestions to optimize the trade setup.
- **Decision Making:**
  - User decides to proceed with logging the trade based on the AI insights or revises the trade setup accordingly.
- **Logging the Trade:**
  - If the user proceeds, the trade is logged into the journal.
- **Status Tracking:**
  - The logged trade’s status can be updated (e.g., Order Placed, Open, Closed) to monitor its lifecycle.

### 5. Backtest Logging

#### Steps:

- **Logging Backtested Trades:**
  - User navigates to the "Backtest" section of a strategy.
  - Inputs details of hypothetical trades, including pair, setup conditions, dates, results, PnL, and associates them with specific strategies.
- **AI Insights for Backtests:**
  - Similar to live trade logging, AI-driven insights are provided to evaluate backtested trades and refine strategies.
- **Review and Save:**
  - User reviews AI recommendations and decides to save the backtested trade for performance analysis.

### 6. Trade Analysis and Insights

#### Steps:

- **Accessing Analytics:**
  - User navigates to the "Analytics" section from the dashboard.
  - Selects a specific strategy to view detailed performance metrics.
- **Reviewing Performance Metrics:**
  - Views key metrics such as win rate, average PnL, maximum drawdown, etc., specific to the selected strategy.
- **Visualizing Data:**
  - Interacts with charts and graphs that depict trade performance over time and across different strategies.
- **Filtering and Sorting:**
  - Applies filters and sorting options to analyze trades based on various criteria for in-depth insights.
- **Strategy Comparison:**
  - Compares performance metrics between different strategies to identify the most effective ones.

### 7. Data Import and Export

#### Steps:

- **Importing Data:**
  - User can import existing trade data from other platforms or CSV files to populate their Trade Journal.
- **Exporting Data:**
  - Users can export their trade logs, backtests, and analysis reports for external use or record-keeping.

### 8. Account Management

#### Steps:

- **Profile Settings:**
  - User can update personal information, change passwords, and manage authentication preferences.
- **Subscription Management:**
  - If applicable, users can manage their subscription plans, billing information, and upgrade or downgrade their services.

## Data Flow Overview

1. **User Interaction:**
   - Users interact with the frontend components built with React and Next.js, performing actions like managing strategies or logging trades.
2. **API Requests:**
   - Frontend components communicate with backend API routes to perform CRUD operations, submit trade setups, or fetch analytics data.
3. **Database Operations:**
   - Backend actions, powered by Drizzle, interact with the Supabase Postgres database to store and retrieve data.
4. **AI Processing:**
   - Logged trade setups are sent to AI services (e.g., OpenAI) to generate insights, which are then stored in the database and presented to the user.
5. **Real-Time Updates:**
   - Changes in data trigger real-time updates on the frontend, ensuring that users always see the latest information without manual refreshes.

## User Journey Example

1. **Registration:**
   - Jane signs up for the Trade Journal application using her Google account.
2. **Dashboard Overview:**
   - Upon logging in, Jane views her dashboard, which displays her strategies, total trades, recent activity, and key performance metrics.
3. **Creating a Strategy:**
   - Jane creates a new trading strategy named "Swing Trading," defining custom fields such as "Risk-Reward Ratio" and "Holding Period" and other custom fields.
4. **Logging a Trade Setup:**
   - Jane prepares to take a trade based on her "Swing Trading" strategy. She navigates to the "Log Trade" section, inputs the trade setup details, and submits the form.
5. **Receiving AI Insights:**
   - A popup appears with AI-generated recommendations, warnings, and tips tailored to her trade setup. For example, it might suggest checking the weekly chart for bias or highlight that this is her 4th trade on EURAUD with similar setups and past success.
6. **Decision Making:**
   - Jane reviews the AI insights and decides to proceed with the trade, incorporating the recommendations to optimize her strategy.
7. **Logging the Trade:**
   - She confirms the trade, and it is logged into the journal with an initial status of "Order Placed."
8. **Analyzing Performance:**
   - Jane later reviews the performance of her trades in the "Analytics" section, using the data to refine her trading approach further.
9. **Backtesting and Continuous Improvement:**
   - Jane logs backtested trades to provide more data for the AI, enhancing the accuracy and usefulness of future insights.
10. **Exporting Data:**
    - Satisfied with her analysis, Jane exports her trade data for further examination in her personal finance software.

## Conclusion

The **Trade Journal** application's user flow is meticulously crafted to guide users through each phase of their trading activities, ensuring a seamless and intuitive experience. By integrating AI-driven insights directly into the trade logging process, the application facilitates efficient strategy management, precise trade logging, insightful analysis, and strategic optimization. This approach not only empowers traders to make informed decisions but also helps in minimizing emotional biases, ultimately enabling them to achieve their financial goals with confidence.
