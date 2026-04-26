import { useState } from "react"

interface ProductInputButtonProps {
    value?: number;
    onChange?: (value: number) => void;
}

export default function ProductInputButton({ value, onChange }: ProductInputButtonProps) {    
    const [localValue, setLocalValue] = useState<number>(1);
    
    const inputValue = value !== undefined ? value : localValue;
    const setInputValue = (val: number) => {
        if (onChange) {
            onChange(val);
        } else {
            setLocalValue(val);
        }
    };

    function handleIncrease() {
        setInputValue(inputValue + 1);
    }
    function handleDecrease() {
        setInputValue(inputValue > 1 ? inputValue - 1 : inputValue);
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue) && newValue > 0) {
            setInputValue(newValue);
        }
    }
    return (
        <div className="input-group bootstrap-touchspin">
            <span className="input-group-addon bootstrap-touchspin-prefix" style={{ display: "none" }}></span>
            <input type="text" value={inputValue} name="demo_vertical2" className="form-control" style={{ display: "block" }}
                onChange={handleChange}
            />
            <span className="input-group-addon bootstrap-touchspin-postfix" style={{ display: "none" }}></span>
            <span className="input-group-btn-vertical">
                <button className="btn btn-default bootstrap-touchspin-up" type="button"
                    onClick={handleIncrease}
                >
                    <i className="fa-solid fa-plus" />
                </button>
                <button className="btn btn-default bootstrap-touchspin-down" type="button"
                    onClick={handleDecrease}
                >
                    <i className="fa-solid fa-minus" />
                </button>
            </span>
        </div>
    )
}