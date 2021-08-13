import {DataTableCell, DataTableRow} from "@dhis2/ui";
import {head} from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import {useRecoilValue} from "recoil";
import {DraggableItems} from "../../../../../../../core/constants/draggables";
import {PeriodResolverState} from "../../../../../../../core/state/period";
import {ScorecardOrgUnitState, ScorecardViewState} from "../../../../../../../core/state/scorecard";
import {getDataSourcesDisplayName} from "../../../../../../../shared/utils/utils";
import DraggableCell from "./DraggableCell";
import DroppableCell from "./DroppableCell";
import DataContainer from "./TableDataContainer";

export default function DataSourceRow({orgUnits, dataSources}) {
   const {filteredOrgUnits, childrenOrgUnits} = useRecoilValue(ScorecardOrgUnitState(orgUnits))
    const periods =
        useRecoilValue(PeriodResolverState) ?? [];


    return (
        <DataTableRow bordered>
            <DataTableCell fixed left={"0"} width={"50px"}>
                &nbsp;
            </DataTableCell>
            <DataTableCell fixed left={"50px"} className="scorecard-org-unit-cell">
                <DroppableCell accept={[DraggableItems.ORG_UNIT_COLUMN]}>
                    <DraggableCell label={getDataSourcesDisplayName(dataSources)} type={DraggableItems.DATA_ROW}/>
                </DroppableCell>
            </DataTableCell>
            {
                ([...filteredOrgUnits, ...childrenOrgUnits])?.map(({id}) => (
                    periods?.map(({id: periodId}) => (
                            <td
                                className="data-cell"
                                align="center"
                                key={`${id}-${head(dataSources)?.id}-${periodId}`}
                            >
                                <DataContainer
                                    orgUnitId={id}
                                    dataSources={dataSources}
                                    periodId={periodId}
                                />
                            </td>
                        )
                    )))
            }
        </DataTableRow>
    )
}

DataSourceRow.propTypes = {
    dataSources: PropTypes.arrayOf(PropTypes.object).isRequired,
    orgUnits: PropTypes.arrayOf(PropTypes.object).isRequired,
};
