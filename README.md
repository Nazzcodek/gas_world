# Gas World

Gas World is a comprehensive management application designed to help gas station owners and managers oversee and monitor their stations effectively. The app facilitates the management of sales, stock, pump activities, and shift assignments. It also assists attendants in managing their shifts and tracking their sales.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Station Management**: Manage sales, stock, and pump activities.
- **Shift Management**: Assign shifts to attendants and monitor their performance.
- **Sales Tracking**: Keep track of sales for each shift.
- **Stock Monitoring**: Monitor stock levels and ensure timely refills.

## Technologies Used
- **Backend**: Django
- **Frontend**: React
- **Caching**: Redis

## Setup and Installation

### Prerequisites
- Python (>=3.8)
- Node.js (>=14.x)
- Redis

### Backend Setup
1. **Clone the repository**:
    ```bash
    git clone https://www.github.com/Nazzcodek/gas-world
    cd gas-world
    ```

2. **Create a virtual environment**:
    ```bash
    python -m venv .venv
    ```

3. **Activate the virtual environment**:
    - On macOS and Linux:
        ```bash
        source .venv/bin/activate
        ```
    - On Windows:
        ```bash
        .venv\Scripts\activate
        ```

4. **Install the dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

5. **Set up Redis**:
    - Make sure Redis is installed and running on your machine. You can download it from [Redis.io](https://redis.io/download).

6. **Apply database migrations**:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

### Frontend Setup
1. **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2. **Install the frontend dependencies**:
    ```bash
    npm install
    ```

## Running the Project

### Start the Backend Server
1. **Activate the virtual environment** (if not already activated):
    - On macOS and Linux:
        ```bash
        source .venv/bin/activate
        ```
    - On Windows:
        ```bash
        .venv\Scripts\activate
        ```

2. **Run the development server**:
    ```bash
    python manage.py runserver
    ```

### Start the Frontend Server
1. **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2. **Run the frontend development server**:
    ```bash
    npm start
    ```

3. **Open your browser and visit**:
    ```
    http://localhost:3000
    ```

## Usage
1. **Login**: Station Owners, managers and attendants can log in to access their respective dashboards.
2. **Dashboard**: Owners can view stations, Managers, pit, pump and sales activities. Managers can view overall sales, stock levels, and assign shifts to attendants.
3. **Shift Management**: Managers can assign and oversee shifts, while attendants can view their shift details and manage their sales.
4. **Sales Tracking**: Both managers and attendants can keep track of sales data in real-time.
5. **Stock Monitoring**: Monitor fuel levels and get notifications for low stock.

## Contributing
We welcome contributions to Gas World! If you have suggestions, bug reports, or code contributions, please create a pull request or open an issue on the GitHub repository.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Happy managing with Gas World! If you have any questions or need further assistance, feel free to contact us.