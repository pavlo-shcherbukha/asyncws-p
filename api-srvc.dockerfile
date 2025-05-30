# Use the official Node.js 18 image based on Alpine
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Expose the application's default port
EXPOSE 8082

# Copy the application source code to the container
#COPY ./api-srvc/ .

# Define build-time arguments
ARG GIT_USER
ARG GIT_PSW
ARG GIT_BRANCH
ARG GIT_REPO
ARG GIT_EMAIL

# Install Git and other necessary tools
RUN apk add --no-cache git

# Clean up the /data directory if it exists
RUN rm -rf /usr/src/app/* /usr/src/app/.[!.]* /usr/src/app/..?*

# Clone the repository using the provided arguments
RUN git clone https://${GIT_USER}:${GIT_PSW}@${GIT_REPO} /usr/src/app -b ${GIT_BRANCH}

# Configure Git user details
RUN git config --global user.email "${GIT_EMAIL}" && \
    git config --global user.name "${GIT_USER}"

# Pull the latest changes from the repository
RUN cd /usr/src/app && git pull

# Install application dependencies
RUN cd /usr/src/app/api-srvc  && npm install

# Start the application
#CMD ["npm", "start"]
CMD ["npm", "start", "--prefix", "/usr/src/app/api-srvc"]