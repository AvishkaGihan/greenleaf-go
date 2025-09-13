import { useState } from "react";

const EcoScoreDisplay = ({
  accommodation,
  onRecalculate,
  isRecalculating = false,
  showRecalculateButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract eco scores and metadata
  const ecoScores = {
    energyEfficiencyScore: accommodation?.energyEfficiencyScore,
    wasteManagementScore: accommodation?.wasteManagementScore,
    waterConservationScore: accommodation?.waterConservationScore,
    localSourcingScore: accommodation?.localSourcingScore,
    carbonFootprintScore: accommodation?.carbonFootprintScore,
  };

  const metadata = accommodation?.ecoScoreMetadata || {};
  const ecoRating = accommodation?.ecoRating;

  // Calculate overall score if individual scores exist
  const validScores = Object.values(ecoScores).filter(
    (score) => score !== null && score !== undefined
  );
  const hasScores = validScores.length > 0;

  // Get confidence level color and text
  const getConfidenceColor = (level) => {
    if (level >= 4) return "text-green-600 bg-green-100";
    if (level >= 3) return "text-yellow-600 bg-yellow-100";
    if (level >= 2) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceText = (level) => {
    if (level >= 4) return "High";
    if (level >= 3) return "Medium";
    if (level >= 2) return "Low";
    return "Very Low";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Score display component
  const ScoreItem = ({ label, score, icon }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {score !== null && score !== undefined ? (
          <>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`w-4 h-4 rounded-full ${
                    star <= score ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {score.toFixed(1)}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400 italic">Not calculated</span>
        )}
      </div>
    </div>
  );

  if (!hasScores && !ecoRating) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">🌱</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Eco Scores Available
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Eco scores will be automatically calculated from Google reviews when
            this accommodation is saved with a Google Place ID.
          </p>
          {showRecalculateButton && accommodation?.id && (
            <button
              onClick={() => onRecalculate?.(accommodation.id)}
              disabled={isRecalculating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecalculating ? "Calculating..." : "Calculate Eco Scores"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with overall rating */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Eco Rating</h3>
            <div className="flex items-center space-x-2 mt-1">
              {ecoRating ? (
                <>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-5 h-5 rounded-full ${
                          star <= ecoRating ? "bg-white" : "bg-green-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xl font-bold">
                    {ecoRating.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-green-200 italic">Calculating...</span>
              )}
            </div>
          </div>

          {/* Confidence indicator */}
          <div className="text-right">
            <div className="text-sm opacity-90">Confidence</div>
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                metadata.confidenceLevel || 1
              )} bg-white bg-opacity-20`}
            >
              {getConfidenceText(metadata.confidenceLevel || 1)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed scores */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            Category Breakdown
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {isExpanded ? "Show Less" : "Show Details"}
          </button>
        </div>

        <div className="space-y-2">
          <ScoreItem
            label="Energy Efficiency"
            score={ecoScores.energyEfficiencyScore}
            icon="⚡"
          />
          <ScoreItem
            label="Waste Management"
            score={ecoScores.wasteManagementScore}
            icon="♻️"
          />
          <ScoreItem
            label="Water Conservation"
            score={ecoScores.waterConservationScore}
            icon="💧"
          />
          <ScoreItem
            label="Local Sourcing"
            score={ecoScores.localSourcingScore}
            icon="🌾"
          />
          <ScoreItem
            label="Carbon Footprint"
            score={ecoScores.carbonFootprintScore}
            icon="🌍"
          />
        </div>

        {/* Expanded metadata */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Calculation Details
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Last Calculated:</span>
                <div className="font-medium">
                  {formatDate(metadata.lastCalculated)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Reviews Analyzed:</span>
                <div className="font-medium">
                  {metadata.reviewsAnalyzed || 0} reviews
                </div>
              </div>
              <div>
                <span className="text-gray-500">Keyword Matches:</span>
                <div className="font-medium">
                  {metadata.keywordMatches || 0} matches
                </div>
              </div>
              <div>
                <span className="text-gray-500">Data Source:</span>
                <div className="font-medium">
                  {metadata.isDefault ? "Default Scores" : "Google Reviews"}
                </div>
              </div>
            </div>

            {metadata.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-600">
                  <strong>Note:</strong> {metadata.error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showRecalculateButton && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onRecalculate?.(accommodation?.id)}
              disabled={isRecalculating}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRecalculating ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Recalculating...</span>
                </span>
              ) : (
                "Recalculate Eco Scores"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoScoreDisplay;
