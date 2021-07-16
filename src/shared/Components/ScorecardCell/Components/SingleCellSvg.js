import PropTypes from 'prop-types'
import React from 'react'
import {DecreasingArrows, IncreasingArrows} from "./Arrows";

export default function SingleCellSvg({color, value}) {

    return (
        <svg width={200} height={47} style={{display: 'block'}}>
            <polygon points="0 0 0 47 200 47 200 0" style={{fill: color}} />
            {/*<IncreasingArrows y={19} x={110} />*/}
            {/*<DecreasingArrows y={33} x={124}/>*/}
            <text fontSize={14} x={86} y={33}>{value}</text>
        </svg>
    )
}

SingleCellSvg.propTypes = {
    color: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
};
