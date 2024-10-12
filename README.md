# GeorasterSourceXYZ

## Introduction

This repository presents a **GeoTIFF tile viewer** that leverages gridded elevation tiles processed by **GeoRaster** and served directly via **Amazon S3**. This approach facilitates the efficient display of raster data on the **OpenLayers** map, eliminating the need for APIs, server-side processing, or PNG image conversion. As a result, the workflow becomes more accessible and agile, empowering researchers and professionals to explore geospatial data in real-time directly in their browsers.

## Code Overview

The main component of the viewer is the `GeoRasterSourceXYZ` class, which extends the `ol.source.XYZ` class from OpenLayers. Below is a brief explanation of its core functionalities:

- **Constructor**: Initializes the tile source with a URL template, projection, and attributions.
- **loadTile**: Loads a tile from the specified source, processes it, and renders it onto a canvas element.
- **getNormalizedColor**: Normalizes a value based on specified scale parameters to determine the appropriate color for rendering.
- **hexToRgbA**: Converts a hexadecimal color string to an RGBA object for further processing.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Additional Information

For more detailed information on how to use and implement the GeoTIFF tile viewer, please refer to the following article: [Optimizing Geospatial Data with OpenLayers and Amazon S3](https://medium.com/@fabricio.rhs/serverless-geotiff-tile-viewer-optimizing-geospatial-data-with-openlayers-and-amazon-s3-df29fa2ff5ae).
