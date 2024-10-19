// Description: This file contains the code for the GeoRasterSourceXYZ class, which is a custom class that extends the ol.source.XYZ class. This class is used to create a raster source for XYZ tiles that contain geospatial data. The class loads the tiles and renders them as images on a canvas element, applying color scales and legends to the data values. The class also handles the conversion of data values to colors using a color scale and normalization of values to a range between 0 and 1. The class is used to create raster layers in OpenLayers that display geospatial data from XYZ tile servers.
// Author: Fabricio Rodrigues
// Date: 2024-10
// License: MIT
// Usage: This class is used to create raster layers in OpenLayers that display geospatial data from XYZ tile servers. The class is used to create a raster source for XYZ tiles that contain geospatial data. The class loads the tiles and renders them as images on a canvas element, applying color scales and legends to the data values. The class also handles the conversion of data values to colors using a color scale and normalization of values to a range between 0 and 1.
// Version: 1.0
// Compatibility: OpenLayers 10.2.1 and GeoRaster 1.6.0

class GeoRasterSourceXYZ extends ol.source.XYZ {
    constructor(optionLayer) {
        super({
            url: optionLayer.urlTemplate,
            projection: 'EPSG:3857',
            tileLoadFunction: (tile, src) => this.loadTile(tile, src, optionLayer.options),
            attributions: [optionLayer.attributions, "GeoRasterSourceXYZ"],
        });
        this.cacheData = {};
        this.cacheZoom = 0;
        this.options = optionLayer.options;
    }
  
    getValueRasterData(tileZ, tileX, tileY, xPixel, yPixel) {
        const tileKey = tileX + '-' + tileY;
        const tileData = this.cacheData[tileKey];
        return tileData ? tileData[yPixel][xPixel] : this.options.noData;
    }

    getPixelValueAtCoordinate(coordinate, zoom) {
        const tileCoord = this.getTileGrid().getTileCoordForCoordAndZ(coordinate, Math.floor(zoom));
        const extent = this.getTileGrid().getTileCoordExtent(tileCoord);
        const tileSize = this.getTileGrid().getTileSize();

        const relativeX = (coordinate[1] - extent[1]) / (extent[2] - extent[0]);
        const relativeY = (coordinate[0] - extent[0]) / (extent[3] - extent[1]);
        
        const pixelY = Math.floor(relativeY * tileSize);
        const pixelX = tileSize - Math.floor(relativeX * tileSize);
        
        return this.getValueRasterData(tileCoord[0], tileCoord[1], tileCoord[2], pixelY, pixelX);
    }

    loadTile(tile, src, options) {
        const tileSize = options.tileSize || 256;
        const _tile = document.createElement('canvas');
        _tile.width = tileSize;
        _tile.height = tileSize;
        const context = _tile.getContext('2d', { willReadFrequently: true });

        fetch(src)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.arrayBuffer();
            })
            .then(arrayBuffer => parseGeoraster(arrayBuffer))
            .then(georaster => {
                const { width, height } = georaster;
                const values = georaster.values[0];
                const imageData = context.createImageData(width, height);
                const data = imageData.data;

                for (let row = 0; row < height; row++) {
                    for (let col = 0; col < width; col++) {
                        const value = values[row][col];
                        if (value !== options.noData) {
                            const color = this.getNormalizedColor(value, options);
                            const rgba = this.hexToRgbA(color);
                            const index = (row * width + col) * 4;
                            data[index] = rgba.r;
                            data[index + 1] = rgba.g;
                            data[index + 2] = rgba.b;
                            data[index + 3] = 255;
                        }
                    }
                }
                context.putImageData(imageData, 0, 0);
                tile.getImage().src = _tile.toDataURL();
                this.cacheData[tile.getTileCoord()[1] + '-' + tile.getTileCoord()[2]] = JSON.parse(JSON.stringify(values));
            })
            .catch(error => {
                console.error('Tile fetch error:', error);
            });
    }

    getNormalizedColor(value, options) {
        const { min, max } = options.scale;
        const colorScale = options.colorScale;
        let colorIndex = 0;

        if (options.discreteLegend) {
            colorIndex = value;
        } else {
            let normalizedValue = (value - min) / (max - min);
            normalizedValue = Math.max(0, Math.min(1, normalizedValue));
            const scaleValues = colorScale[1];
            let low = 0, high = scaleValues.length - 1;

            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (normalizedValue >= scaleValues[mid]) {
                    colorIndex = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }

        return colorScale[0][colorIndex];
    }

    hexToRgbA(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }
}