// src/types.ts
export interface MenuItem {
    key: string;
    icon: JSX.Element;
    label: string | JSX.Element;
    children?: {
        label: string;
        key: string;
        icon: JSX.Element;
    }[];
}

export interface DataType {
    key: string;
    contractorName: string;
    number: string;
    email: string;
    amountDebit: number;
    amountCredit: number;
    pendingAmount: number;
    promisedAmount: number;
}