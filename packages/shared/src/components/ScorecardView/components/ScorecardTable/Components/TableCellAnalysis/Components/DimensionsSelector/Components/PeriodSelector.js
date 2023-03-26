import i18n from "@dhis2/d2-i18n";
import {PeriodSelectorModal} from '@hisptz/dhis2-ui'
import PeriodIcon from "@material-ui/icons/AccessTime";
import React, {useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {PeriodState} from "../../../state/period";
import SelectionWrapper from "./SelectionWrapper";
import {SystemSettingsState} from "../../../../../../../../../state";
import {UNSUPPORTED_PERIOD_TYPES} from "../../../../../../../../../constants";

export default function PeriodSelector() {
    const [periodSelection, setPeriodSelection] = useRecoilState(PeriodState);
    const {periods} = periodSelection ?? {};
    const [selectorOpen, setSelectorOpen] = useState(false);
    const {calendar} = useRecoilValue(SystemSettingsState) ?? {};
    return (
        <div className="pr-16" style={{width: "30%"}}>
            <SelectionWrapper
                label={i18n.t("Period(s)")}
                icon={PeriodIcon}
                onClick={setSelectorOpen}
                selectedItems={periods}
            />
            {
                selectorOpen &&
                <PeriodSelectorModal
                    selectedPeriods={periods} calendar={calendar} hide={!selectorOpen}
                    onClose={() => setSelectorOpen(false)}
                    excludedPeriodTypes={UNSUPPORTED_PERIOD_TYPES}
                    onUpdate={(selectedPeriods) => {
                        setPeriodSelection({periods: selectedPeriods})
                        setSelectorOpen(false)
                    }}
                />
            }
        </div>
    );
}
