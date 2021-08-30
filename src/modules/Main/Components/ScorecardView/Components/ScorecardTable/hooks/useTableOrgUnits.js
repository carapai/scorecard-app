import {useDataEngine} from "@dhis2/app-runtime";
import {isEmpty} from "lodash";
import {useEffect, useState} from "react";
import {useRecoilCallback, useRecoilValue} from "recoil";
import {Orientation} from "../../../../../../../core/constants/orientation";
import {OrgUnitChildren} from "../../../../../../../core/state/orgUnit";
import {PeriodResolverState} from "../../../../../../../core/state/period";
import {
    ScorecardTableOrientationState,
    ScorecardTableSortState,
    ScorecardViewState
} from "../../../../../../../core/state/scorecard";
import {sortOrgUnitsBasedOnData, sortOrgUnitsBasedOnNames} from "../../../../../../../core/state/utils";
import {searchOrganisationUnit} from "../../../../../../../shared/hooks/useOrganisationUnits";


export default function useTableOrgUnits({dataEngine, orgUnits}) {
    const engine = useDataEngine()
    const [loading, setLoading] = useState(false);
    const [filteredOrgUnits, setFilteredOrgUnits] = useState([...orgUnits]);
    const [childrenOrgUnits, setChildrenOrgUnits] = useState([]);
    const searchKeyword = useRecoilValue(ScorecardViewState("orgUnitSearchKeyword"))
    const {orgUnit: sort} = useRecoilValue(ScorecardViewState('tableSort'))
    const dataSort = useRecoilValue(ScorecardTableSortState)
    const periods = useRecoilValue(PeriodResolverState)
    const orientation = useRecoilValue(ScorecardTableOrientationState)

    //Search effect
    useEffect(() => {
        async function searchOrgUnit() {
            if (!isEmpty(searchKeyword)) {
                setLoading(true)
                setFilteredOrgUnits(await searchOrganisationUnit(searchKeyword, engine))
                setLoading(false)
            }
        }

        searchOrgUnit()
    }, [searchKeyword]);

    const getChildren = useRecoilCallback(({snapshot}) => async (orgUnit) => {
        if (orgUnit) {
            const children = await snapshot.getPromise(OrgUnitChildren(orgUnit))
            setChildrenOrgUnits(children)
        }
    })
    //Children effect
    useEffect(() => {
        if (orgUnits.length === 1) {
            setLoading(true)
            getChildren().then(() => setLoading(false))
        }
    }, [orgUnits.length])

    //SortEffect
    useEffect(() => {
        function sortData(){
            let orgUnitSort = []
            if (dataSort) {
                if (orientation === Orientation.ORG_UNIT_VS_DATA) {
                    if (dataSort.type === 'period') {
                        const [dx, pe] = dataSort.name?.split('-');
                        dataEngine.sortOrgUnitsByDataAndPeriod({
                            dataSource: dx,
                            period: pe,
                            sortType: dataSort?.direction
                        }).subscribe((ouSort) => orgUnitSort = ouSort)
                    }
                    if (dataSort.type === 'data') {
                        const dx = dataSort?.name;
                        dataEngine.sortOrgUnitsByData({
                            dataSource: dx,
                            periods: periods?.map(({id}) => id),
                            sortType: dataSort?.direction
                        }).subscribe(ouSort => orgUnitSort = ouSort)
                    }
                }
            }
            if (!isEmpty(orgUnitSort)) {
                const {parentOrgUnits, childOrgUnits} = sortOrgUnitsBasedOnData({
                    orgUnitSort,
                    childrenOrgUnits,
                    filteredOrgUnits
                })
                setFilteredOrgUnits(parentOrgUnits)
                setChildrenOrgUnits(childOrgUnits)

            } else {
                const {parentOrgUnits, childOrgUnits} = sortOrgUnitsBasedOnNames({sort, childrenOrgUnits, filteredOrgUnits})
                setFilteredOrgUnits(parentOrgUnits)
                setChildrenOrgUnits(childOrgUnits)
            }
        }
        sortData()
    }, [dataSort]);


    return {
        childrenOrgUnits,
        filteredOrgUnits,
        orgUnitsCount: (childrenOrgUnits?.length + filteredOrgUnits?.length),
        loading
    }

}
