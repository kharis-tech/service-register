# service-register
This is a FastAPI application for managing a church service register. It provides endpoints for handling branches, members, service events, and attendance.

## Project Structure
- **backend/**: Contains the FastAPI application code.
  - **main.py**: Entry point of the application.
  - **api/**: Contains versioned API endpoints.
    - **v1/**: Version 1 of the API.
      - **endpoints/**: Contains individual endpoint files for branches, members, service events, and attendance.
  - **core/**: Contains configuration settings for the application.
  - **db/**: Contains database initialization and models.
  - **schemas/**: Contains Pydantic models for data validation.
  - **services.json5**: Dummy data for service events.
  - **members.json5**: Dummy data for members.
  - **branches.json5**: Dummy data for branches.
  - **attendance.json5**: Dummy data for attendance records.
  - **requirements.txt**: Lists dependencies for the application.

- **infra/**: Contains infrastructure configuration files for deployment.
  - **variables.tf**: Terraform variables for infrastructure configuration.
  - **main/**: Main Terraform configuration for deploying the infrastructure.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd service-register
   ```

2. Install the required dependencies:
   ```
   pip install -r backend/requirements.txt
   ```

3. Run the FastAPI application:
   ```
   uvicorn backend.main:app --reload
   ```

4. Access the API documentation at `http://localhost:8000/docs`.

## Usage
- **Branches**: Create, delete, update, and retrieve branch information.
- **Members**: Create, delete, update, and retrieve member records.
- **Service Events**: Create and update service events.
- **Attendance**: Get service event attendance and mark members as present.

## License
This project is licensed under the MIT License.