# Component: MarketCard
**Path:** src/components/market/MarketCard.js

**Purpose:** Small card representing a market instrument with price, change, and link.

## Props
- symbol, price, change, onClick

## Local State
- none or hover state

## Lifecycle / Hooks
- none critical

## API Calls
- None (data passed via props)

## Dependencies
- may use utility to format numbers/percentages

## Styling
- Tailwind utility classes; color for positive/negative changes

## Tests
- TODO: unit tests for change color and link behavior

## Accessibility
- Ensure text includes both price and change so assistive tech gets full context

## TODO / Suggested Improvements
- Add aria-label combining price and percent for concise screen-reader announcement
