import { DropdownProps } from "./dropdownsProps.model.ts";

export interface InputsProps {
    type: "INPUT" | "DROPDOWN" | "CHECKBOX" | "DATEPICKER" | "DATERANGEPICKER";
    values?: DropdownProps[];
    valueName: string;
    label: string;
    required: boolean;
    mainInput: boolean;
    maxLength?: number;
    minLength?: number;
    showSearch?: boolean;
    placeholder?: string;
    onChange?: (value: any) => void;
    disabled?: boolean;
    dateType?: "NORMAL" | "FROM_DATE" | "TO_DATE";
    numericOnly?: boolean;
    alphanumericOnly?: boolean;
}