# TODO: Open-Meteo Weather Provider Integration

## Plan
- [x] Explore existing weather integration (AgroMonitoring → OpenWeatherMap fallback)
- [x] Create plan & get user approval

## Implementation Steps
- [ ] 1. Add Open-Meteo as final fallback in `src/app/api/weather/route.ts`
- [ ] 2. Add `getOpenMeteoCondition(code)` to map WMO weather codes → app condition strings
- [ ] 3. Reuse `getAMCropAdvisory()` for crop advisory
- [ ] 4. Return same `WeatherData` shape so client works unchanged

## Verification
- [ ] TypeScript: no new errors
- [ ] Lint: no new errors
- [ ] Weather works with zero API keys configured (Open-Meteo fallback)
