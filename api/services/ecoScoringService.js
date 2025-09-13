/**
 * Eco Scoring Service
 * Analyzes Google Places reviews to calculate category-specific eco scores
 */

const ECO_KEYWORDS = {
  energyEfficiency: {
    high: [
      "solar",
      "renewable energy",
      "led lights",
      "energy efficient",
      "energy saving",
      "smart thermostat",
      "green energy",
      "solar panels",
      "wind power",
      "geothermal",
      "energy star",
      "low energy",
      "power saving",
      "solar heating",
      "energy conservation",
    ],
    medium: [
      "efficient",
      "lighting",
      "heating",
      "cooling",
      "insulation",
      "windows",
      "temperature control",
      "natural light",
      "ventilation",
      "eco-friendly lighting",
    ],
    negative: [
      "energy waste",
      "high energy bills",
      "inefficient",
      "old heating system",
      "poor insulation",
      "energy hungry",
      "wasteful lighting",
    ],
  },

  wasteManagement: {
    high: [
      "recycling",
      "composting",
      "zero waste",
      "waste reduction",
      "reusable",
      "biodegradable",
      "waste sorting",
      "recycled materials",
      "compost bin",
      "minimal packaging",
      "no single use",
      "refillable",
      "upcycling",
    ],
    medium: [
      "reduce waste",
      "sustainable packaging",
      "less plastic",
      "eco packaging",
      "waste management",
      "recycling bins",
      "organic waste",
      "minimal waste",
    ],
    negative: [
      "lots of waste",
      "no recycling",
      "wasteful",
      "excessive packaging",
      "single use",
      "plastic waste",
      "poor waste management",
    ],
  },

  waterConservation: {
    high: [
      "water saving",
      "low flow",
      "water conservation",
      "rainwater harvesting",
      "greywater",
      "water recycling",
      "drought resistant",
      "water efficient",
      "smart irrigation",
      "water reuse",
      "xeriscaping",
      "water wise",
    ],
    medium: [
      "efficient showers",
      "water management",
      "conservation",
      "efficient fixtures",
      "water conscious",
      "sustainable water",
      "water reduction",
    ],
    negative: [
      "water waste",
      "leaky faucets",
      "water wasteful",
      "high water usage",
      "poor water management",
      "wasteful water practices",
    ],
  },

  localSourcing: {
    high: [
      "local produce",
      "farm to table",
      "locally sourced",
      "regional ingredients",
      "local farmers",
      "community supported",
      "local suppliers",
      "nearby farms",
      "seasonal menu",
      "local artisans",
      "regional cuisine",
      "local partnerships",
    ],
    medium: [
      "local",
      "regional",
      "seasonal",
      "fresh ingredients",
      "community",
      "local products",
      "nearby suppliers",
      "supporting local",
    ],
    negative: [
      "imported ingredients",
      "non-local",
      "shipped from far",
      "processed foods",
      "industrial food",
      "chain suppliers",
    ],
  },

  carbonFootprint: {
    high: [
      "carbon neutral",
      "carbon offset",
      "bike friendly",
      "public transport",
      "electric vehicles",
      "carbon free",
      "low carbon",
      "green transportation",
      "walkable",
      "cycling",
      "ev charging",
      "carbon reduction",
      "net zero",
    ],
    medium: [
      "sustainable transport",
      "eco transport",
      "green travel",
      "efficient transport",
      "reduced emissions",
      "environmental transport",
      "clean energy",
    ],
    negative: [
      "high emissions",
      "car dependent",
      "poor transport",
      "carbon intensive",
      "no public transport",
      "environmentally unfriendly transport",
    ],
  },
};

/**
 * Calculate sentiment score for text based on keyword matches
 * @param {string} text - Text to analyze
 * @param {object} keywords - Keywords object with high, medium, negative arrays
 * @returns {number} Score between 1-5
 */
function calculateCategoryScore(text, keywords) {
  if (!text || !keywords) return null;

  try {
    const cleanText = text.toLowerCase().trim();

    // Return null if text is too short to be meaningful
    if (cleanText.length < 10) return null;

    // Count keyword matches
    const highMatches =
      keywords.high?.filter((keyword) =>
        cleanText.includes(keyword.toLowerCase())
      ).length || 0;

    const mediumMatches =
      keywords.medium?.filter((keyword) =>
        cleanText.includes(keyword.toLowerCase())
      ).length || 0;

    const negativeMatches =
      keywords.negative?.filter((keyword) =>
        cleanText.includes(keyword.toLowerCase())
      ).length || 0;

    // Base score - neutral starting point
    let score = 2.5;

    // Add points for positive mentions
    score += highMatches * 0.6;
    score += mediumMatches * 0.3;

    // Subtract points for negative mentions
    score -= negativeMatches * 0.4;

    // Ensure score is within valid range
    score = Math.max(1, Math.min(5, score));

    // Round to nearest 0.5
    return Math.round(score * 2) / 2;
  } catch (error) {
    console.error("Error in calculateCategoryScore:", error);
    return null;
  }
}

/**
 * Calculate confidence level based on review data quality
 * @param {Array} reviews - Array of review objects
 * @param {number} totalMatches - Total keyword matches across all categories
 * @returns {number} Confidence level 1-5
 */
function calculateConfidenceLevel(reviews, totalMatches) {
  try {
    if (!reviews || reviews.length === 0) return 1;

    const reviewCount = reviews.length;
    const validReviews = reviews.filter(
      (review) => review.text && review.text.trim().length > 10
    );
    const avgReviewLength =
      validReviews.reduce(
        (sum, review) => sum + (review.text?.length || 0),
        0
      ) / Math.max(validReviews.length, 1);

    let confidence = 1;

    // Review count factor (more reviews = higher confidence)
    if (reviewCount >= 50) confidence += 2;
    else if (reviewCount >= 20) confidence += 1.5;
    else if (reviewCount >= 10) confidence += 1;
    else if (reviewCount >= 5) confidence += 0.5;

    // Review quality factor (longer reviews = higher confidence)
    if (avgReviewLength >= 200) confidence += 1;
    else if (avgReviewLength >= 100) confidence += 0.5;

    // Keyword relevance factor (more eco keywords = higher confidence)
    if (totalMatches >= 20) confidence += 1;
    else if (totalMatches >= 10) confidence += 0.5;
    else if (totalMatches >= 5) confidence += 0.25;

    // Quality of reviews factor
    const qualityScore = validReviews.length / Math.max(reviewCount, 1);
    confidence += qualityScore * 0.5;

    return Math.min(5, Math.max(1, Math.round(confidence * 2) / 2));
  } catch (error) {
    console.error("Error in calculateConfidenceLevel:", error);
    return 1;
  }
}

/**
 * Analyze reviews and calculate eco scores for all categories
 * @param {Array} reviews - Array of review objects from Google Places
 * @param {object} placeDetails - Additional place information
 * @returns {object} Eco scores and metadata
 */
export function analyzeEcoScores(reviews, placeDetails = {}) {
  try {
    // Validate input
    if (!Array.isArray(reviews)) {
      console.warn(
        "analyzeEcoScores: reviews is not an array, using empty array"
      );
      reviews = [];
    }

    if (reviews.length === 0) {
      return {
        scores: {
          energyEfficiencyScore: null,
          wasteManagementScore: null,
          waterConservationScore: null,
          localSourcingScore: null,
          carbonFootprintScore: null,
        },
        metadata: {
          reviewsAnalyzed: 0,
          confidenceLevel: 1,
          lastCalculated: new Date(),
          keywordMatches: 0,
          error: "No reviews available",
        },
      };
    }

    // Filter out invalid reviews and combine text
    const validReviews = reviews.filter(
      (review) =>
        review &&
        review.text &&
        typeof review.text === "string" &&
        review.text.trim().length > 5
    );

    if (validReviews.length === 0) {
      return {
        scores: {
          energyEfficiencyScore: null,
          wasteManagementScore: null,
          waterConservationScore: null,
          localSourcingScore: null,
          carbonFootprintScore: null,
        },
        metadata: {
          reviewsAnalyzed: reviews.length,
          confidenceLevel: 1,
          lastCalculated: new Date(),
          keywordMatches: 0,
          error: "No valid review text found",
        },
      };
    }

    // Combine all review text and place information
    const textSources = [
      placeDetails.name || "",
      placeDetails.description || "",
      ...validReviews.map((review) => review.text || ""),
    ].filter((text) => text.trim().length > 0);

    const allText = textSources.join(" ").toLowerCase();

    // Validate combined text
    if (allText.trim().length < 50) {
      return {
        scores: {
          energyEfficiencyScore: null,
          wasteManagementScore: null,
          waterConservationScore: null,
          localSourcingScore: null,
          carbonFootprintScore: null,
        },
        metadata: {
          reviewsAnalyzed: validReviews.length,
          confidenceLevel: 1,
          lastCalculated: new Date(),
          keywordMatches: 0,
          error: "Insufficient text for analysis",
        },
      };
    }

    // Calculate scores for each category
    const scores = {
      energyEfficiencyScore: calculateCategoryScore(
        allText,
        ECO_KEYWORDS.energyEfficiency
      ),
      wasteManagementScore: calculateCategoryScore(
        allText,
        ECO_KEYWORDS.wasteManagement
      ),
      waterConservationScore: calculateCategoryScore(
        allText,
        ECO_KEYWORDS.waterConservation
      ),
      localSourcingScore: calculateCategoryScore(
        allText,
        ECO_KEYWORDS.localSourcing
      ),
      carbonFootprintScore: calculateCategoryScore(
        allText,
        ECO_KEYWORDS.carbonFootprint
      ),
    };

    // Count total keyword matches for confidence calculation
    const totalMatches = Object.values(ECO_KEYWORDS).reduce(
      (total, category) => {
        const categoryMatches = [
          ...(category.high || []),
          ...(category.medium || []),
          ...(category.negative || []),
        ].filter((keyword) => allText.includes(keyword.toLowerCase())).length;
        return total + categoryMatches;
      },
      0
    );

    // Calculate confidence level
    const confidenceLevel = calculateConfidenceLevel(
      validReviews,
      totalMatches
    );

    // Check if we have at least some valid scores
    const validScores = Object.values(scores).filter((score) => score !== null);

    return {
      scores,
      metadata: {
        reviewsAnalyzed: validReviews.length,
        totalReviews: reviews.length,
        confidenceLevel,
        lastCalculated: new Date(),
        keywordMatches: totalMatches,
        validScores: validScores.length,
        textLength: allText.length,
      },
    };
  } catch (error) {
    console.error("Error in analyzeEcoScores:", error);

    // Return safe fallback
    return {
      scores: {
        energyEfficiencyScore: null,
        wasteManagementScore: null,
        waterConservationScore: null,
        localSourcingScore: null,
        carbonFootprintScore: null,
      },
      metadata: {
        reviewsAnalyzed: 0,
        confidenceLevel: 1,
        lastCalculated: new Date(),
        keywordMatches: 0,
        error: `Analysis failed: ${error.message}`,
      },
    };
  }
}

/**
 * Get default scores for places without sufficient review data
 * @param {string} type - Accommodation type
 * @returns {object} Default scores and metadata
 */
export function getDefaultEcoScores(type = "hotel") {
  // Base scores by accommodation type
  const defaultScores = {
    "eco-lodge": {
      energyEfficiencyScore: 4,
      wasteManagementScore: 4,
      waterConservationScore: 4,
      localSourcingScore: 4,
      carbonFootprintScore: 4,
    },
    resort: {
      energyEfficiencyScore: 3,
      wasteManagementScore: 3,
      waterConservationScore: 3,
      localSourcingScore: 3,
      carbonFootprintScore: 2,
    },
    hotel: {
      energyEfficiencyScore: 3,
      wasteManagementScore: 3,
      waterConservationScore: 3,
      localSourcingScore: 3,
      carbonFootprintScore: 3,
    },
    hostel: {
      energyEfficiencyScore: 3,
      wasteManagementScore: 3,
      waterConservationScore: 3,
      localSourcingScore: 3,
      carbonFootprintScore: 3,
    },
    guesthouse: {
      energyEfficiencyScore: 3,
      wasteManagementScore: 3,
      waterConservationScore: 3,
      localSourcingScore: 4,
      carbonFootprintScore: 3,
    },
    apartment: {
      energyEfficiencyScore: 3,
      wasteManagementScore: 3,
      waterConservationScore: 3,
      localSourcingScore: 3,
      carbonFootprintScore: 3,
    },
  };

  return {
    scores: defaultScores[type] || defaultScores["hotel"],
    metadata: {
      reviewsAnalyzed: 0,
      confidenceLevel: 2, // Low confidence for default scores
      lastCalculated: new Date(),
      keywordMatches: 0,
      isDefault: true,
    },
  };
}

export { ECO_KEYWORDS };
