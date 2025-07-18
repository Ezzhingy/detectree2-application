# inspired from https://github.com/facebookresearch/detectron2/blob/main/docker/Dockerfile
FROM nvidia/cuda:11.1.1-cudnn8-devel-ubuntu20.04
# use 20.04 to fix dependencies issues met with the original 18.04
# image proposed by detectron2 team


ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y \
	python3-opencv ca-certificates python3-dev git wget sudo ninja-build \
    python3-gdal gdal-bin
# add gdal dependencies 
RUN ln -sv /usr/bin/python3 /usr/bin/python

RUN wget https://bootstrap.pypa.io/pip/3.6/get-pip.py && \
	python3 get-pip.py && \
	rm get-pip.py

# install dependencies
# See https://pytorch.org/ for other options if you use a different version of CUDA  
# cmake from apt-get is too old
RUN pip install tensorboard cmake onnx  
RUN pip install torch==1.10 torchvision==0.11.1 -f https://download.pytorch.org/whl/cu111/torch_stable.html
# fixes https://github.com/pytorch/pytorch/issues/69894
RUN pip install setuptools==59.5.0

RUN pip install 'git+https://github.com/facebookresearch/fvcore'
# install detectron2
RUN git clone https://github.com/facebookresearch/detectron2 detectron2_repo
# set FORCE_CUDA because during `docker build` cuda is not accessible
ENV FORCE_CUDA="1"
# This will by default build detectron2 for all common cuda architectures and take a lot more time,
# because inside `docker build`, there is no way to tell which architecture will be used.
ARG TORCH_CUDA_ARCH_LIST="Kepler;Kepler+Tesla;Maxwell;Maxwell+Tegra;Pascal;Volta;Turing"
ENV TORCH_CUDA_ARCH_LIST="${TORCH_CUDA_ARCH_LIST}"

RUN pip install -e detectron2_repo

# Set a fixed model cache directory.
# ENV FVCORE_CACHE="/tmp"
# WORKDIR /home/appuser/detectron2_repo
RUN pip install ipython
RUN pip install git+https://github.com/PatBall1/detectree2.git

RUN pip install Flask python-dotenv flask-cors

# copy backend server code
COPY . .

# download forest model 
# TODO: download all other models
RUN wget -q \
-O "/230103_randresize_full.pth" \
https://zenodo.org/records/10522461/files/230103_randresize_full.pth
# RUN wget -q \
# -O "/urban_trees_Cambridge_20230630.pth" \
# https://zenodo.org/records/10522461/files/urban_trees_Cambridge_20230630.pth
# RUN wget -q \
# -O "/250312_flexi.pth" \
# https://zenodo.org/records/15014353/files/250312_flexi.pth

CMD ["python", "app.py"]
