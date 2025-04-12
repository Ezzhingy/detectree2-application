# detectree2-application

## Prerequisites

You must download a pre-trained model from the model_garden to run this application. To download, you can run wget on the package repo:

```bash
wget https://zenodo.org/records/10522461/files/230103_randresize_full.pth
wget https://zenodo.org/records/10522461/files/urban_trees_Cambridge_20230630.pth
```

Also, make sure to have the following installed:

- [Node.js](https://nodejs.org/en)
- [Python 3.8+](https://www.python.org/)
- [gdal](https://gdal.org/download.html) geospatial libraries
- [PyTorch ≥ 1.8 and torchvision](https://pytorch.org/get-started/previous-versions/) versions that match
- For training models GPU access (with CUDA) is recommended

### Running the backend

If this is your first time running the app, set up a virtual environment:

```bash
python -m venv venv
```

Then activate your virtual environment:

```bash
source venv/bin/activate
```

If this is your first time running the app, install the required dependencies using:

```bash
pip install torch torchvision torchaudio
pip install Flask python-dotenv flask-cors opencv-python
pip install git+https://github.com/PatBall1/detectree2.git

pip uninstall rasterio numpy -y
pip install numpy
pip install rasterio
```

Then to start the server:

```bash
python3 app.py
```

### Running the frontend

If this is your first time running the app, make sure to install the dependencies:

```bash
npm install
```

Then, run:

```bash
npm run dev
```
