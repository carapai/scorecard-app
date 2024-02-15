import React, { useEffect, useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function AlmaResponse() {
    const engine = useDataEngine();
    const [data, setData] = useState({});

    useEffect(() => {
        const interval = setInterval(fetchAlmaResponse, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const fetchAlmaResponse = async () => {
        try {
            const { data } = await engine.query({
                data: {
                    resource: "dataStore/alma/status",
                },
            });
            setData(() => data);
        } catch (error) {}
    };
    return (
        <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
