FROM nodered/node-red

# Define build-time arguments
ARG GIT_USER
ARG GIT_PSW
ARG GIT_BRANCH
ARG GIT_REPO
ARG GIT_EMAIL
ARG FLOWS

RUN rm -rf /data/* /data/.[!.]* /data/..?*

RUN git clone https://${GIT_USER}:${GIT_PSW}@${GIT_REPO} -b ${GIT_BRANCH} /data
RUN git config --global user.email "${GIT_EMAIL}"
RUN git config --global user.name "${GIT_USER}"
RUN cd /data && git pull

RUN cp /data/wrk-srvc/package.json /usr/src/node-red/package.json
RUN cp /data/wrk-srvc/settings.js /usr/src/node-red/settings.js
RUN cd /usr/src/node-red && npm install
#RUN cd /data/shcos && npm install
#RUN cd /data/shazblob && npm install
#RUN cd /data/wrk-srvc && npm install



