const LoadingPage = () => (
    <div className="loading-spinner_backdrop">
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <div className="loader" style={{animationDirection: 'reverse'}}/>
        </div>
    </div>
);

export default LoadingPage;