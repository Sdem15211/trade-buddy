# Multi-Step Strategy Creation Form Implementation Guide

This document outlines the implementation plan for converting the existing strategy creation dialog into a multi-step form that includes custom field configuration.

## Overview

The strategy creation process will be split into two steps:

1. **Basic Strategy Information**: Name, description, and instrument (existing functionality)
2. **Custom Field Configuration**: Configure fields for trade logging

## Implementation Steps

### 1. State Management for Multi-Step Form

- Add step tracking state to control which form step is displayed
- Create state for managing custom fields collection
- Define a clear interface for custom field data structure

### 2. UI Structure Changes

- Modify the dialog content to conditionally render based on the current step
- Keep the existing form fields for step 1
- Create a new component for step 2 that handles custom field configuration
- Add a step indicator to show progress (e.g., "Step 1 of 2")

### 3. Step Navigation

- Add "Next" button at the end of step 1 that advances to step 2
- Add "Back" button in step 2 to return to step 1
- Keep the "Cancel" button in both steps
- Replace the "Create Strategy" button with "Next" in step 1, and keep it in step 2
- Implement validation for step 1 fields before allowing progression to step 2

### 4. Custom Fields Management

- Create a component for adding/editing custom fields with:
  - Field name input
  - Field type selector (text, select, multi-select)
  - Options input (conditionally shown for select types)
  - Required checkbox
- Add functionality to add, edit, and remove custom fields
- Display the list of added custom fields with edit/delete options
- Show the default fields (disabled/locked) at the top of the list

### 5. Form Submission

- When submitting the form in step 2, serialize the custom fields to JSON
- Include the serialized custom fields in the form data
- Continue using the existing `formAction` for submission
- Ensure the form action handles the custom fields data correctly

### 6. Error Handling

- Maintain the current error handling approach
- Add validation for custom fields (client-side)
- Display errors for custom fields if validation fails
- Validate step 1 before allowing progression to step 2

### 7. State Reset

- When closing the dialog, reset both the step state and custom fields state
- Clear form data when dialog is closed
- Reset error states

## Technical Considerations

### Custom Fields Data Structure

The backend expects custom fields in this format:

- name: string (required)
- type: "text" | "select" | "multi-select" (required)
- options: string[] (required for select/multi-select types)
- required: boolean

### Default Fields

Display these default fields (disabled) at the top of the custom fields list:

- Entry Price (number)
- Exit Price (number)
- Position Size (number)
- Direction (select: Long/Short)
- Entry Date (date)
- Exit Date (date)

### Form State Persistence

When moving between steps, ensure form data is preserved:

- Store step 1 data in state variables when proceeding to step 2
- Use refs or state to maintain form values

### Validation Rules

- Step 1:

  - Name: Required
  - Instrument: Required
  - Description: Optional

- Step 2 (Custom Fields):
  - Field Name: Required, unique within the strategy
  - Field Type: Required
  - Options: Required for select/multi-select types
  - At least one option for select/multi-select types

### UI/UX Considerations

- Use subtle animations for step transitions
- Provide clear instructions at each step
- Show a preview of configured custom fields
- Consider using a drag-and-drop interface for reordering custom fields
- Ensure mobile responsiveness for all form elements

## Implementation Approach

1. **Modify Existing Component Structure**:

   - Keep the current dialog framework
   - Add step state and conditional rendering
   - Maintain the existing form action and state management

2. **Create New Components**:

   - CustomFieldEditor: For adding/editing individual custom fields
   - CustomFieldsList: For displaying and managing the list of custom fields
   - StepIndicator: To show progress through the form

3. **Enhance Form Handling**:
   - Add validation between steps
   - Serialize custom fields before submission
   - Maintain error handling patterns

## Next Steps

After implementing the multi-step form:

1. Test thoroughly with various input combinations
2. Ensure proper error handling for both steps
3. Verify that custom fields are correctly saved to the database
4. Consider adding field reordering functionality if needed
5. Add validation to prevent duplicate field names
