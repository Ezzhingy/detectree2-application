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
2. Create a new security group with an inbound rule of:

   a. IP version: `IPv4`
   b. Protocol: `TCP`
   c. Port range: `5000`
   d. Source: `0.0.0.0/0`

#### Creating a new user on Identity and Access Management (IAM)

1. Go to the IAM dashboard
2. Create a new user and a new group and grant the group the `AdministratorAccess` permission policy
3. Also, navigate to the Roles tab and create a new role called `ecsTaskExecutionRole` with the `AmazonECSTaskExecutionRolePolicy` policy

This should now allow you to run the following commands through the AWS CLI.

#### Creating an Amazon Elastic Container Registry (ECR)

1. Go to the ECR dashboard
2. Create a new image and follow the `push commands` to push your docker image to the cloud
3. NOTE: you must be authenticated with the user you created to be able to push using the AWS CLI

#### Creating an Amazon Elastic Container Service (ECS)

1. Go to the ECS dashboard
2. Create a cluster
3. Separately, create a task definition and connect your ECR instance

   a. Allocate `4vCPU` and `30GB` of memory for the task. Feel free to tweak these amounts as necessary
   b. Set the `ecsTaskExecutionRole` as the task execution role
   c. Make sure to set two environment variables: `FLASK_APP: app.py` and `FLASK_ENV: production`
   d. Allocate `30GB` of ephemeral storage for the task. Feel free to tweak these amounts as necessary

4. Within your cluster, create a service and connect your task definition

Once the task is running, access the task's public IP to see your backend deployment.

#### Creating an Amazon Elastic Compute Cloud (EC2) instance

1. Go to the EC2 dashboard
2. Create a new EC2 instance

   a. Make sure to check all three rules when creating your new security group

3. After creating the instance, go back to the dashboard and connect

NOTE: The following commands may differ depending on OS. All commands below are run on RHEL

4. Once in the terminal, run

```bash
sudo yum check-update # refreshes your local package index
sudo yum install nginx -y
```

5. Run the following commands:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

6. Create your own configuration file:

```bash
sudo vim /etc/nginx/conf.d/proxy.conf
```

7. Paste the following:

```bash
server {
    server_name api.detectree2.tech; # api.detectree2.tech to be setup later
    client_max_body_size 100M; # can be customized, currently set to 100MB

    location / {
        proxy_pass http://<ECS_PUBLIC_IP>:5000; # points to your ECS instance
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

8. Reload nginx

```bash
sudo nginx -t # checks your proxy.conf syntax
sudo systemctl reload nginx # restarts nginx
```

All calls to nginx will now be forwarded to the task instance!

9. Now add HTTPS by installing the following:

```bash
sudo yum check-update # refreshes your local package index
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.detectree2.tech # api.detectree2.tech to be setup later
```

You should now be able to hit https://api.detectree2.tech!

#### Hosting the frontend on Netlify

1. Import an existing project from GitHub (detectree2)
2. For your deploy settings, make sure they are set to the following:

   a. Base directory: `frontend`
   b. Build command: `npm run dev`
   c. Publish directory: `frontend/dist`

Once the deploy finishes, it will generate a production deploy link.

#### Purchasing a domain for the nginx reverse proxy

1. Go to any domain purchasing service (ie. Namecheap) and buy a domain name
2. Once bought, add a new `A Record` with the following:

   a. host: `api`
   b. value: `<EC2_PUBLIC_IP>`

If using Namecheap, refer to [this article](https://www.namecheap.com/support/knowledgebase/article.aspx/9776/2237/how-to-create-a-subdomain-for-my-domain/) for more info.

Wait 5 minutes for changes to propagate and you should be all set!

### Next Steps

- Currently only the `Forest` mode is supported. Add support for `Default` and `Urban`
- A network request takes ~1min to process which is absurdly slow. To boost performance:

  - Optimize the Dockerfile. Currently installing very heavy GPU dependencies, should be some way of installing CPU-only resources while still being compatible with the detectron2 library
  - Setup AWS servers in multiple regions. Currently only setup for `eu-west-2`

- `https://detectree2.netlify.app/` is currently set up on a personal account. This should be migrated over to the organization's Netlify account
- `https://api.detectree2.tech/` is the domain name for the nginx reverse proxy. The `detectree2.tech` domain name is currently set up on a personal account. This should be migrated over to a domain name owned by the organization
