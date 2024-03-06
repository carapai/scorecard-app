import React, { useEffect, useState } from "react";
import { LinearLoader } from "@dhis2-ui/loader";
import { useDataEngine } from "@dhis2/app-runtime";

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
            <LinearLoader width="90%" amount={percentage} />
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Progress:</div>
                <div>{percentage.toFixed(1)}%</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Total:</div>
                <div>{data.total?.total}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Processed:</div>
                <div>{data.added?.total}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Added:</div>
                <div>{data.processed?.total}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Errored:</div>
                <div>{data.failed?.total}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div>Current:</div>
                <div>{data.message?.message}</div>
            </div>
        </div>
    );
}
