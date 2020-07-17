import { Scorecard, Legend, PeriodSelection, ScorecardAccess } from '../models/scorecard.model';
import { getHeaderData } from './conversion/get-header-data.helper';
import { getPeriodSelectionData } from './conversion/get-period-selection-data.helper';
import { getLegendDefinitions } from './conversion/get-legend-definitions.helper';
import { getScorecardAccess } from './conversion/get-scorecard-access.helper';
export function getSanitizedScorecard(oldScorecard) {
  if (oldScorecard) {
    const headerData = oldScorecard.header
      ? getHeaderData(oldScorecard.header)
      : {};
    const legendDefinitions: Legend[] = oldScorecard.legendset_definitions
      ? getLegendDefinitions(oldScorecard.legendset_definitions)
      : [];
    const periodSelection: PeriodSelection = oldScorecard.selected_periods
      ? getPeriodSelectionData(oldScorecard.selected_periods)
      : getPeriodSelectionData([]);
    const userGroupAccesses: ScorecardAccess[] = oldScorecard.user_groups? getScorecardAccess(oldScorecard.user_groups) :  [];
    const userAccesses: ScorecardAccess[] = [];
    console.log({
      ...headerData,
      legendDefinitions,
      periodSelection,
      userGroupAccesses,
      userAccesses
    });
  }
}