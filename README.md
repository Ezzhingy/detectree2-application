# detectree2-application

## Prerequisites

You must download a pre-trained model from the model_garden to run this application. To download, you can run wget on the package repo:

```bash
wget https://zenodo.org/records/10522461/files/230103_randresize_full.pth
wget https://zenodo.org/records/10522461/files/urban_trees_Cambridge_20230630.pth
wget https://zenodo.org/records/15014353/files/250312_flexi.pth
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

### Hosting the backend on AWS

If this is your first time using AWS, make sure to create an AWS account and install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

#### Creating a new security group on Virtual Private Cloud (VPC)

1. Go to the security groups tab on the VPC dashboard
2. Create a new security group with
   a. IP version: `IPv4`
   b. Protocol: `TCP`
   c. Port range: `5000`
   d. Source: `0.0.0.0/0`

#### Creating a new user on Identity and Access Management (IAM)

1. Go to the IAM dashboard
2. Create a new user and a new group and grant the group the `AdministratorAccess` permission policy

This should now allow you to run the following commands through the AWS CLI.

#### Create an Amazon Elastic Container Registry (ECR)

1. Go to the ECR dashboard
2. Create a new image and follow the `push commands` to push your docker image to the cloud
3. NOTE: you must be authenticated with the user you created to be able to push using the AWS CLI

#### Create an Amazon Elastic Container Service (ECS)

1. Go to the ECS dashboard
2. Create a cluster
3. Separately, create a task definition and connect your ECR instance
4. Within your cluster, create a service and connect your task definition

Once the task is running, access the task's public IP to see your backend deployment.

#### Hosting the frontend on Netlify

1. Import an existing project from GitHub (detectree2)
2. For your deploy settings, make sure they are set to the following:
   a. Base directory: `frontend`
   b. Build command: `npm run dev`
   c. Publish directory: `frontend/dist`

Once the deploy finishes, it will generate a production deploy link.

### Next Steps

#### Backend

- Currently, the task IP is being run on `http`, which the `https` frontend cannot hit due to mixed content headers (CORS error)
- The temporary solution is to use the https://cors-anywhere.herokuapp.com as a proxy, but this proxy requires an activation link which expires every 24 hours
- A real solution would be to implement your own reverse proxy, which can be done through nginx and https

#### Frontend

- The frontend currently doesn't have it's own domain name
- Purchase a domain name (ie. from Namecheap) and configure the nameservers/DNS per Netlify's requirements
