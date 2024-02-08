import { FlyoutMenu, MenuItem } from "@dhis2/ui";
import { useAlert } from "@dhis2/app-runtime";
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
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    );
    const [period] = useRecoilState(ScorecardViewState("periodSelection"));
    const postToAlma = async ({ scorecard }) => {
        if (organisationUnit.orgUnits.length > 0 && period.periods.length > 0) {
            try {
                await axios.post(
                    "https://services.dhis2.hispuganda.org/api/alma",
                    {
                        dx: `IN_GROUP-SWDeaw0RUyR`,
                        pe: period.periods[0].id,
                        scorecard,
                        ou: organisationUnit.orgUnits[0].id,
                        level: organisationUnit.orgUnits[0].level,
                    }
                );
                show({
                    message: "Data upload to alma is running in the background",
                    type: { critical: false },
                });
            } catch (error) {
                show({
                    message: error.message ?? e.toString(),
                    type: { critical: true },
                });
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
                        postToAlma({ scorecard: 1331 });
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
