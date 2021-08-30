import {DataTableBody} from "@dhis2/ui";
import {isEmpty} from "lodash";
import PropTypes from 'prop-types'
import React, {Fragment, useEffect, useMemo, useState} from "react";
import {useRecoilValue} from "recoil";
import {Orientation} from "../../../../../../../../core/constants/orientation";
import ScorecardDataEngine from "../../../../../../../../core/models/scorecardData";
import {PeriodResolverState} from "../../../../../../../../core/state/period";
import {
    ScorecardDataLoadingState,
    ScorecardDataSourceState,
    ScorecardTableOrientationState,
    ScorecardViewState
} from "../../../../../../../../core/state/scorecard";
import useTableOrgUnits from "../../hooks/useTableOrgUnits";
import AverageDataSourceRow from "./Components/AverageDataSourceRow";
import AverageOrgUnitRow from "./Components/AverageOrgUnitRow";
import ChildOrgUnitRow from "./Components/ChildOrgUnitRow";
import DataSourceRow from "./Components/DataSourceRow";
import ParentOrgUnitRow from "./Components/ParentOrgUnitRow";

export default function ScorecardTableBody({orgUnits}) {
    const [expandedOrgUnit, setExpandedOrgUnit] = useState();
    const tableOrientation = useRecoilValue(ScorecardTableOrientationState)
    const {dataGroups} = useRecoilValue(ScorecardViewState("dataSelection")) ?? {};
    const {averageRow} = useRecoilValue(ScorecardViewState("options")) ?? {};
    const filteredDataHolders = useRecoilValue(ScorecardDataSourceState)
    const loading = useRecoilValue(ScorecardDataLoadingState)
    const periods = useRecoilValue(PeriodResolverState);
    const {periodType} = useRecoilValue(ScorecardViewState("periodSelection"));
    const dataEngine = useMemo(() => new ScorecardDataEngine(orgUnits), [orgUnits]);
    const {childrenOrgUnits, filteredOrgUnits} = useTableOrgUnits({dataEngine, orgUnits})

    const [overallAverage, setOverallAverage] = useState();

    useEffect(() => {
        if (loading !== undefined && !loading) {
            dataEngine.getOverallAverage([...childrenOrgUnits, ...filteredOrgUnits]?.map(({id}) => id)).subscribe(setOverallAverage)
        }
    }, [childrenOrgUnits, filteredOrgUnits, loading, dataEngine])

    useEffect(() => {
        if (
            (orgUnits.length === 1 && !isEmpty(childrenOrgUnits)) ||
            orgUnits.length > 1
        ) {
            dataEngine
                .setDataGroups(dataGroups)
                .setPeriods(periods)
                .setOrgUnits([
                    ...(filteredOrgUnits ?? []),
                    ...(childrenOrgUnits ?? []),
                ])
                .setPeriodType(periodType)
                .load();
        }
    }, [dataGroups, filteredOrgUnits, childrenOrgUnits, periodType, periods, orgUnits.length, dataEngine]);

    return (
        <DataTableBody>
            {
                <Fragment>
                    {
                        tableOrientation === Orientation.ORG_UNIT_VS_DATA ?
                            <Fragment>
                                {filteredOrgUnits?.map((orgUnit) => (
                                    <ParentOrgUnitRow
                                        dataEngine={dataEngine}
                                        key={`${orgUnit?.id}-row`}
                                        orgUnit={orgUnit}
                                        overallAverage={overallAverage}
                                    />
                                ))}
                                {childrenOrgUnits?.map((orgUnit) => (
                                    <ChildOrgUnitRow
                                        dataEngine={dataEngine}
                                        key={`${orgUnit?.id}-row`}
                                        onExpand={setExpandedOrgUnit}
                                        orgUnit={orgUnit}
                                        expandedOrgUnit={expandedOrgUnit}
                                        overallAverage={overallAverage}
                                    />
                                ))}
                            </Fragment> :
                            filteredDataHolders?.map(({id, dataSources}) => (
                                <DataSourceRow dataEngine={dataEngine} orgUnits={orgUnits} dataSources={dataSources}
                                               key={`${id}-row`}
                                               overallAverage={overallAverage}/>
                            ))
                    }
                    {
                        averageRow && (
                            tableOrientation === Orientation.ORG_UNIT_VS_DATA ?
                                <AverageDataSourceRow dataEngine={dataEngine} orgUnits={orgUnits}
                                                      overallAverage={overallAverage}/> :
                                <AverageOrgUnitRow dataEngine={dataEngine} orgUnits={orgUnits}
                                                   overallAverage={overallAverage}/>

                        )
                    }
                </Fragment>

            }
        </DataTableBody>
    )
}

ScorecardTableBody.propTypes = {
    orgUnits: PropTypes.arrayOf(PropTypes.object).isRequired
};

