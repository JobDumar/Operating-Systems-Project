import React from 'react';
import { InfoSection } from '../InfoSection';
import { DataTable } from '../DataTable';
import "./PrincipalContent.css"

export function PrincipalContent() {
    return (
        <div className="principal-content">

        <InfoSection type="arriving" />
        <InfoSection type="leaving" />
        
        <DataTable variant="arriving" />
        <DataTable variant="leaving" />
        <DataTable variant="randoms" />
        </div>
    );
}