FROM dolittle/runtime:5.0.0 as dolittle-runtime

FROM ubuntu:bionic
SHELL ["/bin/bash", "-c"]

# Install .NET Core dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libc6 \
        libgcc1 \
        libgssapi-krb5-2 \
        libicu60 \
        libssl1.1 \
        libstdc++6 \
        zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Install .NET Core
RUN dotnet_version=3.1.6 \
    && curl -SL --output dotnet.tar.gz https://dotnetcli.azureedge.net/dotnet/Runtime/$dotnet_version/dotnet-runtime-$dotnet_version-linux-x64.tar.gz \
    && dotnet_sha512='3d0667120f6af71f7bbdd8493f75952df70396886f6e167961103e0f1c6c5566ef9730c4abec060734edfa4dbcebf48397dca4e2b8f5308fb01cd4ecc2e4fe6c' \
    && echo "$dotnet_sha512 dotnet.tar.gz" | sha512sum -c - \
    && mkdir -p /usr/share/dotnet \
    && tar -ozxf dotnet.tar.gz -C /usr/share/dotnet \
    && rm dotnet.tar.gz \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

# Install ASP.NET Core
RUN aspnetcore_version=3.1.6 \
    && curl -SL --output aspnetcore.tar.gz https://dotnetcli.azureedge.net/dotnet/aspnetcore/Runtime/$aspnetcore_version/aspnetcore-runtime-$aspnetcore_version-linux-x64.tar.gz \
    && aspnetcore_sha512='f74da84b6ddc9e9a7fed91772e82a01772a20c3b9f4f9e8948502e7defd1c6aaf5c6fb18c73259f1010edfc0e6ab0fef483ed5285560c00ef01f974650636f7a' \
    && echo "$aspnetcore_sha512  aspnetcore.tar.gz" | sha512sum -c - \
    && tar -ozxf aspnetcore.tar.gz -C /usr/share/dotnet ./shared/Microsoft.AspNetCore.App \
    && rm aspnetcore.tar.gz

# Install MongoDB dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        wget \
        gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - \
    && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" > /etc/apt/sources.list.d/mongodb-org-4.2.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        mongodb-org \
    && rm -rf /var/lib/apt/lists/*

# Setup MongoDB as single-node replicaset
RUN mkdir -p /data/db /data/configdb \
    && chown -R mongodb:mongodb /data/db /data/configdb \
    && mongod --logpath /var/log/mongodb/initdb.log --replSet "rs0" --bind_ip 0.0.0.0 --fork \
    && mongo --eval 'rs.initiate({_id: "rs0", members: [{ _id: 0, host: "localhost:27017"}]})'

VOLUME /data/db /data/configdb

# Copy the Dolittle Runtime
COPY --from=dolittle-runtime /app /bin/dolittle-runtime

# Install supervisord
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Node + Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get update \
    && apt-get install -y \
        nodejs \
        yarn \
    && rm -rf /var/lib/apt/lists/*

# Build Libertas packages
WORKDIR /libertas
COPY Source ./Source
COPY Testbench/package.json ./Testbench/package.json
COPY package.json ./package.json
COPY .eslintrc.js ./.eslintrc.js
COPY tsconfig.settings.json ./tsconfig.settings.json
COPY wallaby.js ./wallaby.js
RUN yarn && yarn build

# Configure NodeRED
RUN mkdir -p /root/.node-red
RUN echo $'\
[                                                               \n\
    {                                                           \n\
        "id": "c844cd09.f0dc5",                                 \n\
        "type": "dolittle-runtime-config",                      \n\
        "z": "",                                                \n\
        "name": "Built-in Runtime",                             \n\
        "microservice": "f8c60d7c-9d24-4711-882b-a0ae04330ab9", \n\
        "host": "localhost",                                    \n\
        "port": "50053"                                         \n\
    }                                                           \n\
]                                                               \n\
' > /root/.node-red/flows.json
RUN echo $'\
// Copyright (c) Dolittle. All rights reserved.                                                                     \n\
// Licensed under the MIT license. See LICENSE file in the project root for full license information.               \n\
module.exports = {                                                                                                  \n\
    uiPort: 1880,                                                                                                   \n\
    flowFile: "flows.json",                                                                                         \n\
    flowFilePretty: true,                                                                                           \n\
    paletteCategories: ["subflows", "Dolittle", "common", "function", "network", "sequence", "parser", "storage"],  \n\
    logging: {                                                                                                      \n\
        console: {                                                                                                  \n\
            level: "debug",                                                                                         \n\
            metrics: false,                                                                                         \n\
            audit: false                                                                                            \n\
        }                                                                                                           \n\
    },                                                                                                              \n\
    editorTheme: {                                                                                                  \n\
        page: {                                                                                                     \n\
            css: "/libertas/node_modules/@node-red-contrib-themes/solarized-dark/theme.css"                         \n\
        },                                                                                                          \n\
        projects: {                                                                                                 \n\
            enabled: false                                                                                          \n\
        }                                                                                                           \n\
    }                                                                                                               \n\
};                                                                                                                  \n\
' > /root/.node-red/settings.js

VOLUME /root/.node-red

# Configure supervisord to run MongoDB + Dolittle Runtime + NodeRED
RUN echo $'\
[supervisord]                                                   \n\
nodaemon=true                                                   \n\
                                                                \n\
[program:mongod]                                                \n\
command=/usr/bin/mongod --replSet "rs0" --bind_ip 0.0.0.0       \n\
stdout_logfile=/dev/stdout                                      \n\
stdout_logfile_maxbytes=0                                       \n\
                                                                \n\
[program:dolittle-runtime]                                      \n\
directory=/bin/dolittle-runtime                                 \n\
command=/usr/bin/dotnet "Dolittle.Runtime.Server.dll"           \n\
stdout_logfile=/dev/stdout                                      \n\
stdout_logfile_maxbytes=0                                       \n\
                                                                \n\
[program:node-red]                                              \n\
command=/usr/bin/node /libertas/node_modules/node-red/red.js    \n\
stdout_logfile=/dev/stdout                                      \n\
stdout_logfile_maxbytes=0                                       \n\
' > /etc/supervisord.conf

# Expose all the ports that are usefull
EXPOSE 1880 27017 9007 50052 50053

ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisord.conf" ]