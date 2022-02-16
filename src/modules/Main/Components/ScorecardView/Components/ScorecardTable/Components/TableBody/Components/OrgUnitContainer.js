import PropTypes from "prop-types";
import React from "react";
import {useRecoilValue} from "recoil";
import {DraggableItems} from "../../../../../../../../../core/constants/draggables";
import {ScorecardViewState} from "../../../../../../../../../core/state/scorecard";
import DraggableCell from "./DraggableCell";

export default function OrgUnitContainer({orgUnit}) {
    const {showHierarchy} = useRecoilValue(ScorecardViewState("options"));

    return (
        <DraggableCell
            label={
                showHierarchy
                    ? orgUnit.hierarchy : orgUnit.displayName
            }
            type={DraggableItems.ORG_UNIT_ROW}
            style={{textAlign: "start"}}
        />
    );
}

OrgUnitContainer.propTypes = {
    orgUnit: PropTypes.object.isRequired,
};
