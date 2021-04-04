import React, { useEffect, useState } from 'react';
import Slider, { SliderTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

const { createSliderWithTooltip } = Slider;
const Range: any = createSliderWithTooltip(Slider.Range);
const { Handle }: { Handle: any } = Slider;

const handle = props => {
    const { value, dragging, index, ...restProps } = props;
    return (
        <SliderTooltip
            prefixCls="rc-slider-tooltip"
            overlay={`${value} %`}
            visible={dragging}
            placement="top"
            key={index}
        >
            <Handle value={value} {...restProps} />
        </SliderTooltip>
    );
};

function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            // Update debounced value after delay
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            // Cancel the timeout if value changes (also on delay change or unmount)
            // This is how we prevent debounced value from updating if value is changed ...
            // .. within the delay period. Timeout gets cleared and restarted.
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay] // Only re-call effect if value or delay changes
    );

    return debouncedValue;
}

export const RangeSlider = ({ setValue }: { setValue: (v: any) => void }) => {
    const [v, setV] = useState([0, 100]);
    const debouncedV = useDebounce(v, 250);

    useEffect(() => {
        setValue(debouncedV);
    }, [debouncedV])


    return (
        <div>
            <Range min={0} max={100} defaultValue={v} value={v} handle={handle} onChange={(v) => {
                setV(v);
            }} />
            <style>
                {`
                    .rc-slider-track {
                        background-color: #3b82f6;
                    }

                    .rc-slider-handle {
                        border: solid 2px #3b82f6;
                        width: 1rem;
                        height: 1rem;
                        margin-top: -6px;
                    }

                    .rc-slider-handle:hover {
                        border: solid 2px #3b82f6;
                    }

                    .rc-slider-handle-dragging {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 1px #3b82f6 !important;
                    }

                    .rc-slider-handle-click-focused {
                        border-color: #3b82f6 !important;
                    }

                    .rc-slider-tooltip {
                        width: max-content;
                        opacity: .9;
                        bacgkround-color: black;
                        border-radius: 0;
                    }
                `}
            </style>
        </div>
    )
};


// export const RangeSlider = () => (
//     <>
//         <Range allowCross={false}
//             handleStyle={{ backgroundColor: 'red' }}
//             trackStyle={{ backgroundColor: 'red' }}
//             dotStyle={{ backgroundColor: 'red' }} />
//         <style>
//             {`
//                     .rc-slider-track {
//                         background-color: #3b82f6;
//                     }

//                     .rc-slider-handle {
//                         border: solid 2px #3b82f6;
//                         width: 1rem;
//                         height: 1rem;
//                         margin-top: -6px;
//                     }

//                     .rc-slider-handle:hover {
//                         border: solid 2px #3b82f6;
//                     }

//                     .rc-slider-handle-dragging {
//                         border-color: #3b82f6 !important;
//                         box-shadow: 0 0 0 1px #3b82f6 !important;
//                     }

//                     .rc-slider-handle-click-focused {
//                         border-color: #3b82f6 !important;
//                     }
//                 `}
//         </style>
//     </>
// );