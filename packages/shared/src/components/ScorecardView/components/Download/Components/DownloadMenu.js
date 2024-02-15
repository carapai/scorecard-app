import { useAlert } from "@dhis2/app-runtime";
import { FlyoutMenu, MenuItem, ButtonStrip, Button } from "@dhis2/ui";
import { Modal, ModalTitle, ModalContent, ModalActions } from "@dhis2-ui/modal";
import axios from "axios";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useRecoilState } from "recoil";
import { DownloadTypes } from "../../../../../constants";
import { ScorecardViewState } from "../../../../../state";
import AlmaResponse from "../../../../AlmaResponse";

export default function DownloadMenu({ onClose, onDownload }) {
    const [organisationUnit] = useRecoilState(
        ScorecardViewState("orgUnitSelection")
    );
    const history = useHistory();
    const [hide, setHide] = useState(true);
    const [hideProgress, setHideProgress] = useState(true);

    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    );
    const [period] = useRecoilState(ScorecardViewState("periodSelection"));

    const postToAlma = async ({ scorecard }) => {
        console.log(organisationUnit.orgUnits);
        if (organisationUnit.orgUnits.length > 0 && period.periods.length > 0) {
            try {
                await axios.post(
                    "https://services.dhis2.hispuganda.org/api/alma",
                    {
                        pe: period.periods[0].id,
                        scorecard,
                        ou: organisationUnit.orgUnits[0].id,
                    }
                );
            } catch (error) {
                show({
                    message: error.message ?? e.toString(),
                    type: { critical: true },
                });
            }
        }
    };
    return (
        <>
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
                            setHide(() => false);
                            console.log(period);
                            console.log(organisationUnit);
                        }}
                    />
                    <MenuItem
                        dataTest={"test-alma-data-json"}
                        label={`View Progress`}
                        onClick={() => {
                            setHideProgress(() => false);
                        }}
                    />
                </MenuItem>
            </FlyoutMenu>

            <Modal onClose={() => setHide(() => true)} medium hide={hide}>
                <ModalTitle>Send to ALMA</ModalTitle>
                <ModalContent>
                    Are you sure you want send data to ALMA scorecard for
                    organisation{" "}
                    {organisationUnit.orgUnits.length > 0
                        ? organisationUnit.orgUnits[0].displayName
                        : ""}{" "}
                    and period{" "}
                    {period.periods.length > 0 ? period.periods[0].name : ""}
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button
                            onClick={() => {
                                setHide(() => true);
                                onClose();
                            }}
                            secondary
                        >
                            No
                        </Button>
                        <Button
                            onClick={() => {
                                postToAlma({ scorecard: 1421 });
                                setHide(() => true);
                                setHideProgress(() => false);
                            }}
                            primary
                        >
                            Yes
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>

            <Modal
                onClose={() => setHideProgress(() => true)}
                hide={hideProgress}
            >
                <ModalTitle>Progress</ModalTitle>
                <ModalContent>
                    <AlmaResponse />
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button
                            onClick={() => {
                                setHideProgress(() => true);
                                onClose();
                            }}
                            primary
                        >
                            OK
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </>
    );
}

DownloadMenu.propTypes = {
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
};
