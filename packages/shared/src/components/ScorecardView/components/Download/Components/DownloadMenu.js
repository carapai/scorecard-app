import { FlyoutMenu, MenuItem } from "@dhis2/ui";
import PropTypes from "prop-types";
import React from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import { DownloadTypes } from "../../../../../constants";
import { ScorecardViewState } from "../../../../../state";

export default function DownloadMenu({ onClose, onDownload }) {
    const [organisationUnit] = useRecoilState(
        ScorecardViewState("orgUnitSelection")
    );
    const [period] = useRecoilState(ScorecardViewState("periodSelection"));
    const postToAlma = async ({ scorecard }) => {
        if (organisationUnit.orgUnits.length > 0 && period.periods.length > 0) {
            try {
                axios.post("https://services.dhis2.hispuganda.org/api/alma", {
                    dx: `IN_GROUP-SWDeaw0RUyR`,
                    pe: period.periods[0].id,
                    scorecard,
                    ou: organisationUnit.orgUnits[0].id,
                    level: organisationUnit.orgUnits[0].level,
                });
            } catch (error) {
                console.log(error.message);
            }
        }
    };
    return (
        <FlyoutMenu dataTest={"download-menu"}>
            <MenuItem dataTest={"download-menu"} label={"Download"}>
                {Object.values(DownloadTypes)?.map((type) => (
                    <MenuItem
                        dataTest={`${type}-download-menu`}
                        onClick={() => {
                            onDownload(type);
                            onClose();
                        }}
                        key={`${type}-download-menu`}
                        label={type}
                    />
                ))}
            </MenuItem>
            <MenuItem dataTest={"upload-menu"} label={"Upload"}>
                <MenuItem
                    dataTest={"test-alma-data-json"}
                    label={`ALMA`}
                    onClick={() => {
                        postToAlma({ scorecard: 1407 });
                        onClose();
                    }}
                />
            </MenuItem>
        </FlyoutMenu>
    );
}

DownloadMenu.propTypes = {
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
};
