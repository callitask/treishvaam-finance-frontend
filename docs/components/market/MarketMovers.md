# Component: MarketMovers
**Path:** src/components/market/MarketMovers.js

**Purpose:** List of top gainers/losers or movers in the market.

## Props
- movers: array, type: 'gainers' | 'losers'

## Local State
- pagination or visibleCount

## Lifecycle / Hooks
- may fetch movers periodically

## API Calls
- Market movers endpoints via `apiConfig.js`

## Dependencies
- `MarketCard` for each item

## Styling
- Tailwind list/grid styles

## Tests
- TODO: rendering tests with sample movers

## Accessibility
- Use list semantics and provide clear labels for direction and percentage

## TODO / Suggested Improvements
- Allow filtering by sector or market
