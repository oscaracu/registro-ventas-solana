FROM ubuntu:24.04

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git build-essential pkg-config libssl-dev libudev-dev protobuf-compiler sudo \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash -u 1001 node \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER node
WORKDIR /home/node

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - \
    && sudo apt-get install -y nodejs

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
ENV PATH="/home/node/.cargo/bin:${PATH}"

RUN sudo curl -L https://github.com/anza-xyz/agave/releases/latest/download/solana-release-x86_64-unknown-linux-gnu.tar.bz2 \
        -o /tmp/solana.tar.bz2 \
    && sudo tar -xjf /tmp/solana.tar.bz2 -C /tmp \
    && sudo cp -a /tmp/solana-release/bin/. /usr/local/bin/

RUN sudo curl -L https://github.com/otter-sec/anchor/releases/download/v0.32.1/anchor-0.32.1-x86_64-unknown-linux-gnu \
        -o /usr/local/bin/anchor \
    && sudo chmod +x /usr/local/bin/anchor
