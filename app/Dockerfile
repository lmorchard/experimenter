FROM python:3.8.2

WORKDIR /app
EXPOSE 7001


# Disable python pyc files
ENV PYTHONDONTWRITEBYTECODE 1


# Script for waiting for the db to initialize
COPY bin/wait-for-it.sh /app/bin/wait-for-it.sh
RUN chmod +x /app/bin/wait-for-it.sh


# Install nvm with node and npm
ENV NODE_VERSION=14.8.0
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"


# System  packages
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get --no-install-recommends install -y apt-utils ca-certificates postgresql-client yarn parallel


# Python packages
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
ENV PATH "/root/.poetry/bin:${PATH}"
RUN poetry config virtualenvs.create false
COPY poetry.lock pyproject.toml ./
RUN poetry install

# If any package is installed, that is incompatible by version, this command
# will exit non-zero and print what is usually just a warning in `poetry install`
RUN poetry check

# Node packages
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY ./experimenter/legacy-ui/core/package.json /app/experimenter/legacy-ui/core/package.json
COPY ./experimenter/legacy-ui/rapid/package.json /app/experimenter/legacy-ui/rapid/package.json
COPY ./experimenter/legacy-ui/visualization/package.json /app/experimenter/legacy-ui/visualization/package.json
COPY ./experimenter/nimbus-ui/package.json /app/experimenter/nimbus-ui/package.json
RUN yarn install --frozen-lockfile


# Build assets
COPY ./experimenter/legacy-ui/ /app/experimenter/legacy-ui/
COPY ./experimenter/nimbus-ui/ /app/experimenter/nimbus-ui/
RUN yarn workspace @experimenter/core build
RUN yarn workspace @experimenter/visualization build
RUN yarn workspace @experimenter/rapid build
RUN yarn workspace @experimenter/nimbus-ui build


# Copy source
COPY . /app
