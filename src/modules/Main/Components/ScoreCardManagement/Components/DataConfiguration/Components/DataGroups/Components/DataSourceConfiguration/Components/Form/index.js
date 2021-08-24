import {cloneDeep, set} from 'lodash'
import React from 'react'
import {useRecoilState, useRecoilValue} from "recoil";
import ScorecardIndicator from "../../../../../../../../../../../../core/models/scorecardIndicator";
import {
    ScorecardConfigDirtySelector,
    ScorecardConfigDirtyState,
    ScorecardConfigEditState
} from "../../../../../../../../../../../../core/state/scorecard";
import DataSourceConfigurationForm
    from "../../../../../../../../../../../../shared/Components/CustomForm/components/DataSourceConfigurationForm";

export default function SelectedDataSourceConfigurationForm() {
    const scorecardEditState = useRecoilValue(ScorecardConfigEditState);
    const legendDefinitions = useRecoilValue(ScorecardConfigDirtyState('legendDefinitions'))
    const selectedGroupIndex = scorecardEditState?.selectedGroupIndex;
    const selectedDataHolderIndex = scorecardEditState?.selectedDataHolderIndex;
    const path = ['dataGroups', selectedGroupIndex, 'dataHolders', selectedDataHolderIndex]
    const [selectedDataHolder, updateSelectedDataHolder] = useRecoilState(ScorecardConfigDirtySelector({
        key: 'dataSelection',
        path
    }));

    const onFormChange = (index) => ({values, dirty}) => {
        if (dirty) {
            const updatedList = cloneDeep(selectedDataHolder?.dataSources)
            set(updatedList, [index], values)
            updateSelectedDataHolder(prevState => ScorecardIndicator.set(prevState, 'dataSources', updatedList))
        }
    }

    return (
        <div className='row-media' >
            {
                selectedDataHolder?.dataSources?.map((dataSource, index) => {
                    return (
                        <div key={dataSource.id} className='col-lg-6 col-md-6 data-source-form-container' style={{height: '100%'}}>
                            <div className='container-bordered'>
                                <div className='column'>
                                    <div className='p-16'>
                                        <DataSourceConfigurationForm
                                            defaultValues={dataSource}
                                            legendDefinitions={legendDefinitions}
                                            onFormChange={onFormChange(index)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }) || null
            }
        </div>
    )
}



