import {isEmpty} from 'lodash'
import React, {Suspense, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {useRecoilCallback, useRecoilValue, useSetRecoilState} from "recoil";
import {PeriodResolverState} from "../../../../core/state/period";
import {
    resetScorecardEngine,
    scorecardDataEngine,
    ScorecardDataLoadingState,
    ScorecardIdState,
    ScorecardTableOrientationState,
    ScorecardViewState,
} from "../../../../core/state/scorecard";
import {UserAuthorityOnScorecard} from "../../../../core/state/user";
import {FullPageLoader} from "../../../../shared/Components/Loaders";
import AccessDeniedPage from "./Components/AccessDeniedPage";
import EmptyOrgUnitsOrPeriod from "./Components/EmptyOrgUnitsOrPeriod";
import HighlightedIndicatorsView from "./Components/HighlightedIndicatorsView";
import ScorecardHeader from "./Components/ScorecardHeader";
import ScorecardLegendsView from "./Components/ScorecardLegendsView";
import ScorecardTable from "./Components/ScorecardTable";
import TableLoader from "./Components/ScorecardTable/Components/TableLoader";
import ScorecardViewHeader from "./Components/ScorecardViewHeader";


export default function ScorecardView() {
    const {id: scorecardId} = useParams();
    const {orgUnits} = useRecoilValue(ScorecardViewState("orgUnitSelection"));
    const {read: access} = useRecoilValue(UserAuthorityOnScorecard(scorecardId))
    const setLoading = useSetRecoilState(ScorecardDataLoadingState)
    const downloadRef = useRef()
    const periods = useRecoilValue(PeriodResolverState)

    const set = useRecoilCallback(({set}) => () => {
        set(ScorecardIdState, scorecardId)
        resetScorecardEngine()
    })

    const reset = useRecoilCallback(({reset}) => () => {
        reset(ScorecardViewState("orgUnitSelection"))
        reset(ScorecardIdState)
        reset(ScorecardTableOrientationState)
        reset(ScorecardDataLoadingState)
        scorecardDataEngine.reset()
    })

    useEffect(() => {
        const subscription = scorecardDataEngine.loading$.subscribe(setLoading)
        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        }
    }, [setLoading])

    useEffect(() => {
        set()
        return () => {
            reset()
        };
    }, []);

    if (!access) {
        return <AccessDeniedPage accessType={"view"}/>
    }

    return (
        <Suspense fallback={<FullPageLoader/>}>
            <ScorecardViewHeader downloadAreaRef={downloadRef}/>
            <div ref={downloadRef} className="column p-16" style={{height: "100%", width: "100%"}}>
                <ScorecardHeader/>
                <ScorecardLegendsView/>
                <HighlightedIndicatorsView/>
                <div className="column align-items-center pt-16 flex-1">
                    {
                        (!isEmpty(orgUnits) && !isEmpty(periods)) ?
                            <Suspense fallback={<TableLoader orgUnits={orgUnits}/>}>
                                <ScorecardTable
                                    nested={false}
                                    orgUnits={orgUnits}/>
                            </Suspense> : <EmptyOrgUnitsOrPeriod/>
                    }
                </div>
            </div>
        </Suspense>
    );
}
