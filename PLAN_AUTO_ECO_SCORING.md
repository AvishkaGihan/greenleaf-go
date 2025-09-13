# Automatic Eco Score Calculation from Google Reviews - Implementation Plan

## Overview

This plan outlines the implementation of automatic eco score calculation for accommodations based on Google Places reviews instead of manual admin input. The system will analyze user reviews to calculate individual eco category scores which will then be used to compute the overall eco rating.

## Current State Analysis

- **Current System**: Admin manually enters eco scores (energyEfficiencyScore, wasteManagementScore, etc.)
- **Target System**: Automatically calculate these scores from Google Places reviews
- **Existing**: Basic eco score calculation exists in `ecoScoreFromGoogle.js` but only calculates a general score
- **Goal**: Replace manual input with intelligent review analysis for all 5 eco categories

## Implementation Todo List

### Phase 1: Core Algorithm Development

#### 1. Design Enhanced Review Analysis Algorithm

- [ ] **Create keyword mappings for each eco category**

  - Define energy efficiency keywords (solar, LED, energy-saving, renewable, etc.)
  - Define waste management keywords (recycling, composting, zero-waste, etc.)
  - Define water conservation keywords (low-flow, water-saving, greywater, etc.)
  - Define local sourcing keywords (local produce, farm-to-table, regional, etc.)
  - Define carbon footprint keywords (carbon-neutral, bike-friendly, public transport, etc.)

- [ ] **Implement sentiment analysis for each category**

  - Create scoring logic based on positive/negative mentions
  - Weight keywords by importance (high/medium/low impact)
  - Handle negations in reviews ("not eco-friendly" should decrease score)

- [ ] **Add confidence scoring**
  - Track how many reviews mention eco aspects
  - Calculate confidence level based on review volume and relevance
  - Set minimum thresholds for reliable scoring

### Phase 2: Service Layer Updates

#### 2. Update Google Places Service (`ecoScoreFromGoogle.js`)

- [ ] **Replace general `calculateEcoScore` function**

  - Create new `calculateEcoCategoryScores` function
  - Return object with all 5 category scores instead of single score
  - Keep existing Google Places API integration

- [ ] **Enhance review fetching**

  - Increase review limit in Google Places API call
  - Filter reviews for relevance (avoid short/irrelevant reviews)
  - Add error handling for API limits

- [ ] **Add review text preprocessing**
  - Clean and normalize review text
  - Handle multiple languages if needed
  - Remove spam or irrelevant content

#### 3. Create New Eco Scoring Service

- [ ] **Create `services/ecoScoringService.js`**
  - Move all eco scoring logic here for better organization
  - Export functions for calculating individual category scores
  - Add utility functions for keyword matching and sentiment analysis

### Phase 3: Data Model Updates

#### 4. Update Accommodation Model

- [ ] **Make eco score fields auto-calculated**

  - Remove manual input capability for the 5 eco score fields
  - Keep the virtual `ecoRating` getter as-is (it's already correctly implemented)
  - Add metadata fields for tracking calculation details

- [ ] **Add new metadata fields**

  ```javascript
  ecoScoreMetadata: {
    lastCalculated: Date,
    reviewsAnalyzed: Number,
    confidenceLevel: Number, // 1-5 scale
    googlePlaceId: String
  }
  ```

- [ ] **Update schema validation**
  - Ensure eco score fields can be undefined (for new places without reviews)
  - Add indexes for efficient queries on eco scores

### Phase 4: Controller and Route Updates

#### 5. Update Accommodation Controller

- [ ] **Modify accommodation creation logic**

  - When admin adds new accommodation, automatically trigger eco score calculation
  - Remove manual eco score input from request validation
  - Add Google Place ID lookup if not provided

- [ ] **Add eco score recalculation endpoint**

  - Create endpoint to manually trigger score recalculation
  - Allow bulk recalculation for multiple accommodations
  - Add admin-only access control

- [ ] **Update accommodation response formatting**
  - Include eco score metadata in API responses
  - Add confidence indicators for frontend display

#### 6. Update Admin Routes

- [ ] **Remove eco score inputs from admin forms**

  - Update accommodation creation/edit endpoints
  - Remove eco score validation from request schemas
  - Add read-only display of calculated scores

- [ ] **Add eco score management endpoints**
  - Endpoint to view eco score calculation details
  - Endpoint to manually trigger recalculation
  - Endpoint to view accommodations with low confidence scores

### Phase 5: Database Migration and Batch Processing

#### 7. Create Migration Script

- [ ] **Create `scripts/migrateEcoScores.js`**

  - Identify all accommodations with manual eco scores
  - For each accommodation, attempt to find Google Place ID
  - Recalculate eco scores using new algorithm
  - Preserve original data in case of rollback needed

- [ ] **Add batch processing capabilities**
  - Process accommodations in batches to avoid API limits
  - Add progress tracking and logging
  - Handle API failures gracefully with retry logic

#### 8. Add Background Score Updates

- [ ] **Create scheduled job for score updates**
  - Update eco scores periodically (weekly/monthly)
  - Focus on accommodations with old scores or low confidence
  - Add configuration for update frequency

### Phase 6: Error Handling and Fallbacks

#### 9. Implement Robust Error Handling

- [ ] **Handle Google Places API limitations**

  - Graceful handling when place has no reviews
  - Fallback when API quota is exceeded
  - Default scores for places without sufficient data

- [ ] **Add data validation**

  - Ensure calculated scores are within valid range (1-5)
  - Validate that ecoRating calculation works with new scores
  - Add logging for debugging calculation issues

- [ ] **Create fallback mechanisms**
  - Use category averages when specific scores unavailable
  - Allow manual override for special cases
  - Maintain data integrity during transitions

### Phase 7: Frontend Integration

#### 10. Update Admin Dashboard

- [ ] **Modify accommodation forms**

  - Remove eco score input fields
  - Add read-only display of calculated scores
  - Show calculation metadata (confidence, last updated)

- [ ] **Add eco score management interface**

  - Dashboard to view calculation status across all accommodations
  - Tools to trigger manual recalculation
  - Alerts for accommodations with low confidence scores

- [ ] **Add visualization and monitoring**
  - Charts showing eco score distribution
  - Confidence level indicators
  - Review analysis statistics

### Phase 8: Testing and Validation

#### 11. Comprehensive Testing

- [ ] **Test eco score calculation accuracy**

  - Compare calculated scores with manual scores for sample data
  - Validate that scores are reasonable and consistent
  - Test edge cases (no reviews, conflicting reviews, etc.)

- [ ] **Performance testing**

  - Test Google Places API rate limits
  - Measure calculation performance for large datasets
  - Optimize for efficient batch processing

- [ ] **Integration testing**
  - Test full workflow from admin adding place to displaying eco rating
  - Verify that frontend displays calculated scores correctly
  - Test error scenarios and fallback mechanisms

#### 12. Data Quality Validation

- [ ] **Validate existing data migration**

  - Compare before/after eco ratings for reasonableness
  - Identify and investigate significant score changes
  - Adjust algorithm if systematic biases are detected

- [ ] **Monitor calculation accuracy**
  - Set up monitoring for calculation confidence levels
  - Track accommodations that consistently have low confidence
  - Create alerts for systematic calculation issues

## Implementation Notes

### Technical Considerations

1. **API Rate Limits**: Google Places API has quotas - implement proper rate limiting and caching
2. **Data Consistency**: Ensure eco scores are recalculated consistently across all accommodations
3. **Performance**: Consider caching calculated scores and only recalculating when needed
4. **Rollback Plan**: Keep original manual scores as backup during transition

### Business Rules

1. **Minimum Reviews**: Require minimum number of reviews for reliable scoring
2. **Confidence Thresholds**: Set confidence levels below which manual review is needed
3. **Update Frequency**: Balance between fresh data and API costs
4. **Fallback Scoring**: Define default scores for places without sufficient review data

### Success Criteria

- All accommodations have automatically calculated eco scores
- Admin no longer needs to manually enter eco scores
- Eco ratings are based on actual user feedback from Google reviews
- System maintains high accuracy and confidence in calculated scores
- Performance impact is minimal and acceptable

## Files to Modify

### Core Files

- `api/services/ecoScoreFromGoogle.js` - Update scoring algorithm
- `api/models/Accommodation.js` - Add metadata fields
- `api/controllers/accommodationController.js` - Update creation logic
- `api/routes/accommodations.js` - Update admin endpoints

### New Files

- `api/services/ecoScoringService.js` - Dedicated eco scoring logic
- `api/scripts/migrateEcoScores.js` - Migration script
- `api/scripts/updateEcoScores.js` - Batch update script

### Frontend Files (Admin Dashboard)

- Admin accommodation forms - Remove manual input fields
- Admin dashboard - Add eco score management interface

This plan provides a clear, step-by-step approach to implementing automatic eco score calculation while maintaining system reliability and data quality.
