export const viewData = {
    minPrice: 0.0,
    maxPrice: 1.0,
    endTime: "now",
    timeIntervalSeconds: 30,
    minVisibleVolume: 0.0,
    maxVolumeSaturation: 15000, // TODO more reasonable number
    priceStepSize: 0.1,
    // TODO sth for aggregation
}

export const marketData = []

export const trades = []

export const interactionData = {
    isDragging: false,
    lastMouseX: null,
}