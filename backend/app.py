from flask import Flask

from detectree2.preprocessing.tiling import tile_data
from detectree2.models.outputs import project_to_geojson, stitch_crowns, clean_crowns
from detectree2.models.predict import predict_on_data
from detectree2.models.train import setup_cfg
from detectron2.engine import DefaultPredictor

app = Flask(__name__)

@app.route("/")
def compute():
    # Path to site folder and orthomosaic
    site_path = "./detectree2/"
    img_path = site_path + "/tilespred/Harapan_RGBMS_HST17_20230612_320121_9744381_100_0_32748.tif"
    tiles_path = site_path + "tilespred/"

    # Specify tiling
    buffer = 30
    tile_width = 40
    tile_height = 40
    tile_data(img_path, tiles_path, buffer, tile_width, tile_height, dtype_bool = True)

    trained_model = "./230103_randresize_full.pth"
    cfg = setup_cfg(update_model=trained_model)
    cfg.MODEL.DEVICE = 'cpu'
    predict_on_data(tiles_path, tiles_path + "predictions/", predictor=DefaultPredictor(cfg))

    project_to_geojson(tiles_path, tiles_path + "predictions/", tiles_path + "predictions_geo/")

    crowns = stitch_crowns(tiles_path + "predictions_geo/", 1)
    clean = clean_crowns(crowns, 0.6, confidence=0) # set a confidence>0 to filter out less confident crowns

    clean = clean[clean["Confidence_score"] > 0.5] # step included for illustration - can be done in clean_crowns func

    clean = clean.set_geometry(clean.simplify(0.3))

    clean.to_file(site_path + "/crowns_out.gpkg")

    return "Success", 200
