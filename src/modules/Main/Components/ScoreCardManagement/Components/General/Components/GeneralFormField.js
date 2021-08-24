import PropTypes from "prop-types";
import React, {useMemo} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {ScorecardConfigDirtyState, ScorecardConfigErrorSelector} from "../../../../../../../core/state/scorecard";
import {CustomInput} from "../../../../../../../shared/Components/CustomForm/components/CustomField";
import {FormFieldModel} from "../../../../../../../shared/Components/CustomForm/models";

export default function GeneralFormField({field, dataTest}) {
    const [value, setValue] = useRecoilState(ScorecardConfigDirtyState(field.id));
    const error = useRecoilValue(ScorecardConfigErrorSelector(field.id))
    const onChange = (newValue) => {
        setValue(newValue);
    };
    const input = useMemo(() => ({
        value,
        onChange,
        label: field?.formName,
        required: field?.mandatory,
        error: !!error,
        validationText: error ?? ''
    }), [value, field, error]);

    return (
        <CustomInput
            dataTest={dataTest}
            valueType={field.valueType}
            input={input}
            {...field}
        />
    );
}

GeneralFormField.propTypes = {
    field: PropTypes.instanceOf(FormFieldModel).isRequired,
    dataTest: PropTypes.string
};