
export const getSystemLatency = async (req, res) => {
    // Mock latency report - in real world would use Redis/Prometheus metrics
    const report = {
        api_to_db_ms: Math.floor(Math.random() * 200) + 50,
        db_to_socket_ms: Math.floor(Math.random() * 50) + 10,
        total_pipeline_latency: "60-260ms"
    };
    res.status(200).json(report);
};
