import React from "react";
import "./dataTable.css"

export function DataTable({ variant }) {
    const content = {
        arriving: 'Tabla de llegadas',
        leaving: 'Tabla de salidas',
        randoms: 'Tabla de aeronaves aleatorias'
    }[variant];

    return (
        <div className={`table-aircraft-${variant}`}>
            {content}
        </div>
    );
}