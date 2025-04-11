# detectree2-application

## Prerequisites

You must download a pre-trained model from the model_garden to run this application. To download, you can run wget on the package repo:

```bash
!wget https://zenodo.org/records/10522461/files/230103_randresize_full.pth
```

Also, make sure to have the following installed:

- [Node.js](https://nodejs.org/en)
- [Python 3.8+](https://www.python.org/)

### Running the backend

If this is your first time running the app, set up a virtual environment:

```bash
python -m venv /path/to/new/virtual/environment
```

Then activate your virtual environment:

```bash
source venv/bin/activate
```

If this is your first time running the app, install the required dependencies using:

```bash
pip install -r requirements.txt
```

Then to start the server:

```bash
flask run
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
