import { useState, useEffect, useMemo } from "react";
import { accommodationAPI } from "../../services/api";
import EcoScoreDisplay from "../common/EcoScoreDisplay";

const EcoScoreManagement = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [filters, setFilters] = useState({
    confidenceLevel: "all", // all, low, medium, high
    hasGooglePlaceId: "all", // all, yes, no
    lastCalculated: "all", // all, week, month, never
  });

  // Load accommodations
  useEffect(() => {
    loadAccommodations();
  }, []);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      const response = await accommodationAPI.getAccommodations({
        limit: 100, // Get more for management interface
      });
      setAccommodations(response.data.data.accommodations || []);
    } catch (error) {
      console.error("Failed to load accommodations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters using useMemo to avoid unnecessary recalculations
  const filteredAccommodations = useMemo(() => {
    let filtered = [...accommodations];

    // Filter by confidence level
    if (filters.confidenceLevel !== "all") {
      filtered = filtered.filter((acc) => {
        const confidence = acc.ecoScoreMetadata?.confidenceLevel || 1;
        switch (filters.confidenceLevel) {
          case "low":
            return confidence <= 2;
          case "medium":
            return confidence >= 3 && confidence <= 3;
          case "high":
            return confidence >= 4;
          default:
            return true;
        }
      });
    }

    // Filter by Google Place ID
    if (filters.hasGooglePlaceId !== "all") {
      filtered = filtered.filter((acc) => {
        const hasPlaceId = !!acc.ecoScoreMetadata?.googlePlaceId;
        return filters.hasGooglePlaceId === "yes" ? hasPlaceId : !hasPlaceId;
      });
    }

    // Filter by last calculated date
    if (filters.lastCalculated !== "all") {
      const now = new Date();
      filtered = filtered.filter((acc) => {
        const lastCalc = acc.ecoScoreMetadata?.lastCalculated;
        if (!lastCalc && filters.lastCalculated === "never") return true;
        if (!lastCalc) return false;

        const calcDate = new Date(lastCalc);
        const daysDiff = (now - calcDate) / (1000 * 60 * 60 * 24);

        switch (filters.lastCalculated) {
          case "week":
            return daysDiff > 7;
          case "month":
            return daysDiff > 30;
          case "never":
            return false;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [accommodations, filters]);

  const handleBatchRecalculate = async (selectedIds = null) => {
    try {
      setBatchProcessing(true);
      setProcessingResults(null);

      const payload = {};
      if (selectedIds && selectedIds.length > 0) {
        payload.accommodationIds = selectedIds;
      }

      const response = await accommodationAPI.batchRecalculateEcoScores(
        payload
      );
      setProcessingResults(response.data.data);

      // Reload accommodations to show updated scores
      await loadAccommodations();
    } catch (error) {
      console.error("Batch recalculation failed:", error);
      setProcessingResults({
        error: error.response?.data?.message || "Batch processing failed",
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleSingleRecalculate = async (accommodationId) => {
    try {
      await accommodationAPI.recalculateEcoScores(accommodationId);
      // Reload accommodations to show updated scores
      await loadAccommodations();
    } catch (error) {
      console.error("Recalculation failed:", error);
      alert("Failed to recalculate eco scores. Please try again.");
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accommodations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Eco Score Management
        </h1>
        <p className="text-gray-600">
          Manage and monitor automatic eco score calculations for all
          accommodations.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Level
            </label>
            <select
              value={filters.confidenceLevel}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  confidenceLevel: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Levels</option>
              <option value="low">Low (1-2)</option>
              <option value="medium">Medium (3)</option>
              <option value="high">High (4-5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Place ID
            </label>
            <select
              value={filters.hasGooglePlaceId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  hasGooglePlaceId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Accommodations</option>
              <option value="yes">Has Google Place ID</option>
              <option value="no">No Google Place ID</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Calculated
            </label>
            <select
              value={filters.lastCalculated}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  lastCalculated: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Dates</option>
              <option value="week">Older than 1 week</option>
              <option value="month">Older than 1 month</option>
              <option value="never">Never calculated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Batch Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleBatchRecalculate()}
            disabled={batchProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchProcessing ? "Processing..." : "Recalculate All Filtered"}
          </button>

          <button
            onClick={() =>
              handleBatchRecalculate(
                filteredAccommodations
                  .filter(
                    (acc) => (acc.ecoScoreMetadata?.confidenceLevel || 1) < 3
                  )
                  .map((acc) => acc._id)
              )
            }
            disabled={batchProcessing}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Recalculate Low Confidence
          </button>

          <button
            onClick={() =>
              handleBatchRecalculate(
                filteredAccommodations
                  .filter((acc) => !acc.ecoScoreMetadata?.lastCalculated)
                  .map((acc) => acc._id)
              )
            }
            disabled={batchProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Calculate Never Processed
          </button>
        </div>

        {processingResults && (
          <div className="mt-4 p-4 rounded-lg border">
            {processingResults.error ? (
              <div className="bg-red-50 border-red-200 text-red-700">
                <h3 className="font-semibold">Batch Processing Failed</h3>
                <p>{processingResults.error}</p>
              </div>
            ) : (
              <div className="bg-green-50 border-green-200 text-green-700">
                <h3 className="font-semibold mb-2">
                  Batch Processing Completed
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Processed:</span>
                    <div className="text-lg">
                      {processingResults.totalProcessed}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Successful:</span>
                    <div className="text-lg text-green-600">
                      {processingResults.successful}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Failed:</span>
                    <div className="text-lg text-red-600">
                      {processingResults.failed}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {filteredAccommodations.length}
          </div>
          <div className="text-sm text-gray-600">Total Filtered</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {
              filteredAccommodations.filter(
                (acc) => (acc.ecoScoreMetadata?.confidenceLevel || 1) >= 4
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">High Confidence</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {
              filteredAccommodations.filter(
                (acc) => (acc.ecoScoreMetadata?.confidenceLevel || 1) < 3
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Low Confidence</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {
              filteredAccommodations.filter(
                (acc) => !acc.ecoScoreMetadata?.lastCalculated
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Never Calculated</div>
        </div>
      </div>

      {/* Accommodations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Accommodations ({filteredAccommodations.length})
          </h2>
        </div>

        {filteredAccommodations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🏨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No accommodations found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAccommodations.map((accommodation) => (
              <div key={accommodation._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {accommodation.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {accommodation.address}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-gray-500">
                        Type:{" "}
                        <span className="font-medium">
                          {accommodation.type}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                          accommodation.ecoScoreMetadata?.confidenceLevel || 1
                        )}`}
                      >
                        {getConfidenceText(
                          accommodation.ecoScoreMetadata?.confidenceLevel || 1
                        )}{" "}
                        Confidence
                      </span>
                      <span className="text-gray-500">
                        Last calculated:{" "}
                        {formatDate(
                          accommodation.ecoScoreMetadata?.lastCalculated
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <EcoScoreDisplay
                  accommodation={accommodation}
                  onRecalculate={handleSingleRecalculate}
                  showRecalculateButton={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoScoreManagement;
