var optionLayerElevation = {
    id: "Elevation",
    urlTemplate: "https://s3.amazonaws.com/elevation-tiles-prod/v2/geotiff/{z}/{x}/{y}.tif",
    group: "Terrain Layers",
    desc: "Gridded elevation tilesA global dataset providing bare-earth terrain heights, tiled for easy usage and provided on S3.",
    attributions: "Map tiles by <a href='https://registry.opendata.aws/terrain-tiles'>AWS Elevation Tiles</a>",
    options: {
        noData: -32768,
        scale: {
            min: -5000,
            max: 5000
        },
        colorScale: [
            ['#f4ebdc', '#e9e9d5', '#dde6ce', '#d2e4c7', '#c8e0be', '#c0d8ab', '#b9cf97', '#b1c684', '#b2c473', '#bfcc68', '#ccd35c', '#d9db51', '#d6d050', '#c8b857', '#baa05e', '#ac8966', '#9c7b61', '#8c6f5a', '#7c6453', '#6c584c'],
            [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]
        ],
        tileSize: 256,
        maxZoom: 15,
        opacity: 1,
        zIndex: 100
    }    
}