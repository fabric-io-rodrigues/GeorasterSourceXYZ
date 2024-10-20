// Description: This file contains the code for the GeoRasterSourceXYZ class, which is a custom class that extends the ol.source.XYZ class. This class is used to create a raster source for XYZ tiles that contain geospatial data. The class loads the tiles and renders them as images on a canvas element, applying color scales and legends to the data values. The class also handles the conversion of data values to colors using a color scale and normalization of values to a range between 0 and 1. The class is used to create raster layers in OpenLayers that display geospatial data from XYZ tile servers.
// Author: Fabricio Rodrigues
// Date: 2024-10
// License: MIT
// Usage: This class is used to create raster layers in OpenLayers that display geospatial data from XYZ tile servers. The class is used to create a raster source for XYZ tiles that contain geospatial data. The class loads the tiles and renders them as images on a canvas element, applying color scales and legends to the data values. The class also handles the conversion of data values to colors using a color scale and normalization of values to a range between 0 and 1.
// Version: 1.0
// Compatibility: OpenLayers 10.2.1, GeoRaster 1.6.0 and D3 7.0.0

class GeoRasterSourceXYZ extends ol.source.XYZ {
    constructor(optionLayer) {
        super({
            url: optionLayer.urlTemplate,
            projection: 'EPSG:3857',
            tileLoadFunction: (tile, src) => this.loadTile(tile, src, optionLayer.options),
            attributions: [optionLayer.attributions, "GeoRasterSourceXYZ"],
        });
        this.cacheData = new Map();
        this.cacheZoom = 0;
        this.options = optionLayer.options;

        if (!optionLayer.options.disableScaling) {
			//this.colorScale = d3.scaleThreshold().domain(optionLayer.options.colorScale[1]).range(optionLayer.options.colorScale[0]);
			this.colorScale = d3.scaleLinear().domain(optionLayer.options.colorScale[1]).range(optionLayer.options.colorScale[0]);
			this.normalizeValue = d3.scaleLinear([optionLayer.options.scale.min, optionLayer.options.scale.max], [0,1]);
        } else {
            this.colorScale = function(value) { return optionLayer.options.colorScale[0][value]; }
            this.normalizeValue = function(value) { return value; };
        }
    }
  
    getValueRasterData(tileZ, tileX, tileY, xPixel, yPixel) {
        const tileKey = tileX + '-' + tileY;
        const tileData = this.cacheData.get(tileKey);
        if (tileData === undefined || tileData === null || tileData[yPixel] === undefined || tileData[yPixel] === null || tileData[yPixel][xPixel] === undefined || tileData[yPixel][xPixel] === null) {
            return this.options.noData;
        }
        return tileData[yPixel][xPixel];
    }

    getPixelValueAtCoordinate(coordinate, zoom) {
        const tileCoord = this.getTileGrid().getTileCoordForCoordAndZ(coordinate, Math.round(zoom));
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
                            const rgba = this.colorScaleFunction(value);
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
                this.cacheData.set(`${tile.getTileCoord()[1]}-${tile.getTileCoord()[2]}`, JSON.parse(JSON.stringify(values)));
            })
            .catch(error => {
                console.error('Tile fetch error:', error);
            });
    }

    colorScaleFunction = function(value) {
        let _value = this.normalizeValue(value);
        let _color = this.colorScale(_value);
        return d3.color(_color).rgb();
    }

}
