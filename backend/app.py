import io
import rasterio
import numpy as np
import geopandas as gpd
import matplotlib
import matplotlib.pyplot as plt
matplotlib.use('Agg')

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from detectree2.preprocessing.tiling import tile_data
from detectree2.models.outputs import project_to_geojson, stitch_crowns, clean_crowns
from detectree2.models.predict import predict_on_data
from detectree2.models.train import setup_cfg
from detectron2.engine import DefaultPredictor
from PIL import Image
from rasterio.plot import reshape_as_image, show
import json
import base64


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", 'https://detectree2.netlify.app/'])

@app.route("/", methods=["POST"])
def compute():
    if 'file' not in request.files:
        return { "error": "No file part" }, 400
    
    file = request.files['file']
    if file.filename == '':
        return { "error": "No selected file" }, 400
    
    environment = request.form.get('environment')
    confidence = request.form.get('confidence')
    print(environment, confidence)
    
    # with rasterio.open(file) as src:
    #     img_array = src.read()
    #     img_array = reshape_as_image(img_array)

    #     img_array = (img_array - img_array.min()) / (img_array.max() - img_array.min()) * 255
    #     img_array = img_array.astype(np.uint8)

    # img_io = io.BytesIO()
    # Image.fromarray(img_array).save(img_io, format='TIFF')
    # img_io.seek(0)

    ### Model prediction
    # Path to site folder and orthomosaic
    site_path = "./detectree2/"
    tiles_path = site_path + "tilespred/"

    temp_path = tiles_path + file.filename
    file.save(temp_path)

    with rasterio.open(temp_path) as src:
        file_path = src.name

    # Specify tiling
    buffer = 30
    tile_width = 40
    tile_height = 40
    tile_data(file_path, tiles_path, buffer, tile_width, tile_height, dtype_bool = True)

    if environment == "Forest":
        trained_model = "./230103_randresize_full.pth"
    elif environment == "Urban":
        trained_model = "./urban_trees_Cambridge_20230630.pth"
    else:
        trained_model = "./250312_flexi.pth"
        
    cfg = setup_cfg(update_model=trained_model)
    cfg.MODEL.DEVICE = 'cpu'
    predict_on_data(tiles_path, predictor=DefaultPredictor(cfg))
    print('prediction on data completed')


    project_to_geojson(tiles_path, tiles_path + "predictions/", tiles_path + "predictions_geo/")
    print('project to geojson completed')
    crowns = stitch_crowns(tiles_path + "predictions_geo/", 1)
    clean = clean_crowns(crowns, 0.6, confidence=0) # set a confidence>0 to filter out less confident crowns
    print(clean.head())

    clean = clean[clean["Confidence_score"] > float(confidence)] # step included for illustration - can be done in clean_crowns func

    clean = clean.set_geometry(clean.simplify(0.4))
    print('clean crowns completed')


    clean.to_file(site_path + "/crowns_out.gpkg")
    print('model prediction completed')

    ### End of model prediction

    ### Combine .tiff and .gpkg file and transform into .png
    with rasterio.open(temp_path) as src:
        fig, ax = plt.subplots(figsize=(10, 10))
        show(src, ax=ax)

    print('read gpkg file')
    gdf = gpd.read_file(site_path + "./crowns_out.gpkg")
    print('plot crowns')
    gdf.plot(ax=ax, facecolor="none", edgecolor="blue", linewidth=1.5)

    # Add confidence score labels
    for idx, row in gdf.iterrows():
        # Get the centroid of the polygon
        centroid = row.geometry.centroid
        # Convert confidence score to float and add text
        confidence = float(row['Confidence_score'])
        ax.text(centroid.x, centroid.y, f"{confidence:.2f}", 
                fontsize=12, color='red', ha='center', va='center')

    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_frame_on(False)

    plt.savefig('./detectree2/crowns_out.png', dpi=300, bbox_inches="tight", pad_inches=0)

    # Get total tree count
    total_trees = {"total_trees": len(gdf)}
    print(total_trees)

    # Read and encode the image
    with open('./detectree2/crowns_out.png', 'rb') as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode('utf-8')

    # Return both the image and total tree count
    return jsonify({
        "image": f"data:image/png;base64,{img_base64}",
        "statistics": total_trees
    })

@app.route("/download/<file_type>", methods=["GET"])
def download_file(file_type):
    if file_type == "png":
        return send_file("./detectree2/crowns_out.png", mimetype="image/png", as_attachment=True, download_name="result.png")
    elif file_type == "gpkg":
        return send_file("./detectree2/crowns_out.gpkg", mimetype="application/geopackage+sqlite3", as_attachment=True, download_name="crowns_out.gpkg")
    else:
        return {"error": "Invalid file type"}, 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)