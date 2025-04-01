FROM --platform=linux/amd64 debian:trixie-slim
SHELL ["/bin/bash", "-c"]

# Install dependencies
RUN apt update && apt install -y curl bash git tar gzip libc++-dev jq nodejs npm

# Install noirup (which installs nargo)
RUN curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
ENV PATH="/root/.nargo/bin:$PATH"

# Install nargo via noirup
RUN noirup

# Install Barretenberg backend and set backend to Barretenberg v 0.82.0
RUN curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/refs/heads/master/barretenberg/bbup/install | bash && \
    bash -c "source ~/.bashrc && bbup -v 0.82.2"


ENTRYPOINT ["nargo"]

