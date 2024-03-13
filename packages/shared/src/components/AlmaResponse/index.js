import React, { useEffect, useState } from "react";
import { LinearLoader } from "@dhis2-ui/loader";
import { useDataEngine } from "@dhis2/app-runtime";

import "./alma.css";

export default function AlmaResponse() {
    const engine = useDataEngine();
    const [data, setData] = useState({});
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const interval = setInterval(fetchAlmaResponse, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const fetchAlmaResponse = async () => {
        try {
            const response = await engine.query({
                total: {
                    resource: "dataStore/alma/total",
                },
                processed: {
                    resource: "dataStore/alma/processed",
                },
                failed: {
                    resource: "dataStore/alma/failed",
                },
                added: {
                    resource: "dataStore/alma/added",
                },
                response: {
                    resource: "dataStore/alma/response",
                },
                message: {
                    resource: "dataStore/alma/message",
                },
                "failed-alma": {
                    resource: "dataStore/alma/failed-alma",
                },
            });
            const current =
                (Number(response.processed.total) * 100) /
                Number(response.added.total);
            setPercentage(() => current);
            setData(() => response);
        } catch (error) {}
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <LinearLoader
                width="90%"
                height="30px"
                amount={percentage}
                className="progress"
            />
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Progress:</div>
                <div style={{ fontWeight: "bold", color: "green" }}>
                    {percentage.toFixed(1)}%
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Total Records:</div>
                <div style={{ fontWeight: "bold" }}>{data.total?.total}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Records Processed:</div>
                <div style={{ color: "#FFBF00", fontWeight: "bold" }}>
                    {data.added?.total}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Records Added:</div>
                <div style={{ color: "green", fontWeight: "bold" }}>
                    {data.processed?.total}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Records Failed:</div>
                <div style={{ color: "red", fontWeight: "bold" }}>
                    {data.failed?.total}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Status:</div>
                <div style={{ color: "green", fontWeight: "bold" }}>
                    {data.message?.message}
                </div>
            </div>
        </div>
    );
}
